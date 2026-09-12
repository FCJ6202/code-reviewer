// Package user manages user profiles and per-user aggregates.
package user

import (
	"context"
	"time"

	"github.com/fcj6202/code-reviewer/backend/internal/model"
)

type Service interface {
	EnsureUser(ctx context.Context, uid, email, name string) (*model.User, error)
	Get(ctx context.Context, uid string) (*model.User, error)
	RecordReview(ctx context.Context, uid string, score int) error
	Stats(ctx context.Context, uid string) (*model.UserStats, error)
}

// noop satisfies Service until Firestore arrives in phase 4.
type noop struct{}

func NewNoop() Service { return noop{} }

func (noop) EnsureUser(_ context.Context, uid, email, name string) (*model.User, error) {
	return &model.User{UID: uid, Email: email, DisplayName: name, CreatedAt: time.Now().UTC()}, nil
}
func (noop) Get(_ context.Context, uid string) (*model.User, error) {
	return &model.User{UID: uid}, nil
}
func (noop) RecordReview(context.Context, string, int) error { return nil }
func (noop) Stats(context.Context, string) (*model.UserStats, error) {
	return &model.UserStats{ScoreTrend: []model.ScorePoint{}, FindingsByType: map[string]int{}}, nil
}
