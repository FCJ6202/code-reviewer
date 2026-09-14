// Package user manages user profiles and per-user aggregates.
package user

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/fcj6202/code-reviewer/backend/internal/model"
)

var (
	ErrNotFound      = errors.New("user not found")
	ErrAlreadyExists = errors.New("user already exists")
)

// EnsureUser runs on every authenticated request, so it only writes
// lastSeenAt when the stored value is older than this.
const touchInterval = 5 * time.Minute

type Service interface {
	EnsureUser(ctx context.Context, uid, email, name string) (*model.User, error)
	Get(ctx context.Context, uid string) (*model.User, error)
	RecordReview(ctx context.Context, uid string, score int) error
	Stats(ctx context.Context, uid string) (*model.UserStats, error)
}

// Repo is the storage abstraction for users/{uid}.
type Repo interface {
	Get(ctx context.Context, uid string) (*model.User, error)
	// Create fails with ErrAlreadyExists if the document exists.
	Create(ctx context.Context, u *model.User) error
	// Touch updates email, displayName and lastSeenAt.
	Touch(ctx context.Context, uid, email, name string, at time.Time) error
	// AddReview atomically bumps reviewCount/totalScore and recomputes avgScore.
	AddReview(ctx context.Context, uid string, score int, at time.Time) error
}

type service struct{ repo Repo }

func New(repo Repo) Service { return &service{repo: repo} }

func (s *service) EnsureUser(ctx context.Context, uid, email, name string) (*model.User, error) {
	if uid == "" {
		return nil, errors.New("uid is required")
	}
	now := time.Now().UTC()

	u, err := s.repo.Get(ctx, uid)
	if errors.Is(err, ErrNotFound) {
		u = &model.User{UID: uid, Email: email, DisplayName: name, CreatedAt: now, LastSeenAt: now}
		err = s.repo.Create(ctx, u)
		if errors.Is(err, ErrAlreadyExists) {
			return s.repo.Get(ctx, uid) // a parallel first request created it
		}
		if err != nil {
			return nil, fmt.Errorf("create user: %w", err)
		}
		return u, nil
	}
	if err != nil {
		return nil, err
	}

	if now.Sub(u.LastSeenAt) > touchInterval || u.Email != email || u.DisplayName != name {
		if err := s.repo.Touch(ctx, uid, email, name, now); err != nil {
			return nil, fmt.Errorf("touch user: %w", err)
		}
		u.Email, u.DisplayName, u.LastSeenAt = email, name, now
	}
	return u, nil
}

func (s *service) Get(ctx context.Context, uid string) (*model.User, error) {
	return s.repo.Get(ctx, uid)
}

func (s *service) RecordReview(ctx context.Context, uid string, score int) error {
	if score < 1 || score > 10 {
		return fmt.Errorf("score %d out of range 1-10", score)
	}
	return s.repo.AddReview(ctx, uid, score, time.Now().UTC())
}

// Stats is a placeholder until phase 6 adds the score trend and findings
// breakdown; for now it reports the aggregates stored on the user document.
func (s *service) Stats(ctx context.Context, uid string) (*model.UserStats, error) {
	u, err := s.repo.Get(ctx, uid)
	if err != nil {
		return nil, err
	}
	return &model.UserStats{
		ReviewCount:    u.ReviewCount,
		AvgScore:       u.AvgScore,
		ScoreTrend:     []model.ScorePoint{},
		FindingsByType: map[string]int{},
	}, nil
}
