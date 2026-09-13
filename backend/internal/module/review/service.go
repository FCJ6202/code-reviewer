// Package review orchestrates a code review: retrieve rules → Gemini → store.
package review

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/fcj6202/code-reviewer/backend/internal/model"
	"github.com/fcj6202/code-reviewer/backend/internal/module/rule"
	"github.com/fcj6202/code-reviewer/backend/internal/module/user"
	"github.com/fcj6202/code-reviewer/backend/internal/platform"
	"google.golang.org/genai"
)

var ErrNotFound = errors.New("review not found")

const (
	rulesPerReview = 6
	geminiTimeout  = 90 * time.Second
)

type Service interface {
	Create(ctx context.Context, uid string, req model.ReviewRequest) (*model.Review, error)
	Get(ctx context.Context, uid, id string) (*model.Review, error)
	List(ctx context.Context, uid string, limit int) ([]model.ReviewSummary, error)
}

// Repo is the storage abstraction. Phase 2: memory. Phase 4: Firestore.
type Repo interface {
	Save(ctx context.Context, r *model.Review) error
	Get(ctx context.Context, uid, id string) (*model.Review, error)
	List(ctx context.Context, uid string, limit int) ([]model.ReviewSummary, error)
}

type service struct {
	gem   *platform.Gemini
	rules rule.Service
	repo  Repo
	users user.Service
}

func New(gem *platform.Gemini, rules rule.Service, repo Repo, users user.Service) Service {
	return &service{gem: gem, rules: rules, repo: repo, users: users}
}

func (s *service) Create(ctx context.Context, uid string, req model.ReviewRequest) (*model.Review, error) {
	if strings.TrimSpace(req.Code) == "" {
		return nil, errors.New("code is required")
	}
	if req.Language == "" {
		req.Language = DetectLanguage(req.Filename)
	}
	start := time.Now()

	// 1. Retrieve relevant historical rules. Failure degrades, never blocks.
	degraded := false
	rules, err := s.rules.Retrieve(ctx, BuildCodeSummary(req), rulesPerReview)
	if err != nil {
		log.Printf("rule retrieval failed, continuing without rules: %v", err)
		rules, degraded = nil, true
	}

	// 2. Ask Gemini for a structured review.
	out, err := s.callGemini(ctx, req, rules)
	if err != nil {
		return nil, err
	}

	// 3. Assemble, clamp, persist.
	rv := &model.Review{
		ID:        newID(),
		UID:       uid,
		Filename:  req.Filename,
		Language:  req.Language,
		Code:      req.Code,
		Score:     clamp(out.Score, 1, 10),
		Summary:   out.Summary,
		Findings:  out.Findings,
		RulesUsed: usedRuleIDs(out.Findings),
		Model:     s.gem.Model,
		LatencyMs: time.Since(start).Milliseconds(),
		Degraded:  degraded,
		CreatedAt: time.Now().UTC(),
	}
	if rv.Findings == nil {
		rv.Findings = []model.Finding{}
	}
	if err := s.repo.Save(ctx, rv); err != nil {
		return nil, fmt.Errorf("save review: %w", err)
	}
	if err := s.users.RecordReview(ctx, uid, rv.Score); err != nil {
		log.Printf("record review for user %s: %v", uid, err) // non-fatal
	}
	return rv, nil
}

func (s *service) Get(ctx context.Context, uid, id string) (*model.Review, error) {
	return s.repo.Get(ctx, uid, id)
}

func (s *service) List(ctx context.Context, uid string, limit int) ([]model.ReviewSummary, error) {
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	return s.repo.List(ctx, uid, limit)
}

func (s *service) callGemini(ctx context.Context, req model.ReviewRequest, rules []model.Rule) (*model.ModelOutput, error) {
	ctx, cancel := context.WithTimeout(ctx, geminiTimeout)
	defer cancel()

	cfg := &genai.GenerateContentConfig{
		SystemInstruction: genai.NewContentFromText(SystemPrompt(rules), genai.RoleUser),
		Temperature:       genai.Ptr[float32](0.2),
		ResponseMIMEType:  "application/json",
		ResponseSchema:    ResponseSchema(),
	}
	resp, err := s.gem.Client.Models.GenerateContent(ctx, s.gem.Model, genai.Text(UserPrompt(req)), cfg)
	if err != nil {
		return nil, fmt.Errorf("gemini: %w", err)
	}
	raw := resp.Text()
	var out model.ModelOutput
	if err := json.Unmarshal([]byte(raw), &out); err != nil {
		return nil, fmt.Errorf("parse model output: %w (raw: %.200s)", err, raw)
	}
	return &out, nil
}

func usedRuleIDs(fs []model.Finding) []int64 {
	seen := map[int64]bool{}
	ids := []int64{}
	for _, f := range fs {
		if f.RuleID > 0 && !seen[f.RuleID] {
			seen[f.RuleID] = true
			ids = append(ids, f.RuleID)
		}
	}
	return ids
}

func clamp(v, lo, hi int) int {
	if v < lo {
		return lo
	}
	if v > hi {
		return hi
	}
	return v
}

func newID() string {
	b := make([]byte, 8)
	_, _ = rand.Read(b)
	return "rv_" + time.Now().UTC().Format("20060102T150405") + "_" + hex.EncodeToString(b)
}
