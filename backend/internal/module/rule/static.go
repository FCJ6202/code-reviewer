package rule

// PHASE 2 ONLY. Deleted in phase 3 when bigquery.go replaces it.

import (
	"context"
	"errors"
	"io"
	"sort"
	"strings"

	"github.com/fcj6202/code-reviewer/backend/internal/model"
)

type static struct{ rules []model.Rule }

func NewStatic() Service {
	return &static{rules: []model.Rule{
		{ID: 1, Type: "formatting", Description: "Avoid single-character variable names — they hurt readability"},
		{ID: 2, Type: "performance", Description: "Cache repeated database lookups inside the request loop"},
		{ID: 3, Type: "security", Description: "Never interpolate raw user input directly into SQL queries"},
	}}
}

// Retrieve does a crude keyword overlap so the phase 2 checkpoint exercises
// the "rules feed the prompt" path. Real vector search arrives in phase 3.
func (s *static) Retrieve(_ context.Context, codeSummary string, k int) ([]model.Rule, error) {
	summary := strings.ToLower(codeSummary)
	out := make([]model.Rule, 0, len(s.rules))
	for _, r := range s.rules {
		hits := 0
		for _, w := range strings.Fields(strings.ToLower(r.Description)) {
			if len(w) > 3 && strings.Contains(summary, w) {
				hits++
			}
		}
		r.Distance = 1.0 / float64(hits+1)
		out = append(out, r)
	}
	sort.SliceStable(out, func(i, j int) bool { return out[i].Distance < out[j].Distance })
	if k > 0 && len(out) > k {
		out = out[:k]
	}
	return out, nil
}

func (s *static) List(_ context.Context, limit int) ([]model.Rule, error) {
	if limit > 0 && limit < len(s.rules) {
		return s.rules[:limit], nil
	}
	return s.rules, nil
}

func (s *static) Ingest(context.Context, io.Reader, string) (*model.IngestResult, error) {
	return nil, errors.New("ingest not supported by static rules; wired in phase 6")
}
