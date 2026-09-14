// Package ratelimit caps how many reviews each user can request per hour.
package ratelimit

import (
	"context"
	"time"

	"github.com/fcj6202/code-reviewer/backend/internal/model"
)

// Window is how long a user's allowance lasts once their first request opens it.
const Window = time.Hour

type Decision struct {
	Allowed    bool
	Limit      int
	RetryAfter time.Duration // set when Allowed is false
}

type Limiter interface {
	// Take spends one of uid's requests for the current window.
	Take(ctx context.Context, uid string) (Decision, error)
}

// Repo stores RateWindows. Update runs fn inside a transaction and saves the
// returned window when write is true, so concurrent requests can't both take
// the last slot.
type Repo interface {
	Update(ctx context.Context, uid string, fn func(current model.RateWindow) (next model.RateWindow, write bool)) error
}

type limiter struct {
	repo  Repo
	limit int
	now   func() time.Time
}

// New allows `limit` requests per uid per Window. limit <= 0 disables limiting.
func New(repo Repo, limit int) Limiter {
	if limit <= 0 {
		return unlimited{}
	}
	return &limiter{repo: repo, limit: limit, now: time.Now}
}

func (l *limiter) Take(ctx context.Context, uid string) (Decision, error) {
	var decision Decision
	err := l.repo.Update(ctx, uid, func(current model.RateWindow) (model.RateWindow, bool) {
		var next model.RateWindow
		next, decision = decide(current, l.now().UTC(), l.limit)
		return next, decision.Allowed
	})
	return decision, err
}

// decide applies a fixed window: the first request opens a window of length
// Window, and at most limit requests are allowed until it ends.
func decide(w model.RateWindow, now time.Time, limit int) (model.RateWindow, Decision) {
	if w.WindowStart.IsZero() || !now.Before(w.WindowStart.Add(Window)) {
		w = model.RateWindow{WindowStart: now}
	}
	if w.Count >= limit {
		return w, Decision{Allowed: false, Limit: limit, RetryAfter: w.WindowStart.Add(Window).Sub(now)}
	}
	w.Count++
	return w, Decision{Allowed: true, Limit: limit}
}

type unlimited struct{}

func (unlimited) Take(context.Context, string) (Decision, error) {
	return Decision{Allowed: true}, nil
}
