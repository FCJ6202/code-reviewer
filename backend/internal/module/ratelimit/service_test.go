package ratelimit

import (
	"testing"
	"time"

	"github.com/fcj6202/code-reviewer/backend/internal/model"
)

func TestDecide(t *testing.T) {
	start := time.Date(2026, 9, 14, 10, 0, 0, 0, time.UTC)

	t.Run("first request opens a window", func(t *testing.T) {
		w, d := decide(model.RateWindow{}, start, 2)
		if !d.Allowed || w.Count != 1 || !w.WindowStart.Equal(start) {
			t.Fatalf("got window %+v decision %+v", w, d)
		}
	})

	t.Run("allows up to the limit", func(t *testing.T) {
		w, d := decide(model.RateWindow{WindowStart: start, Count: 1}, start.Add(10*time.Minute), 2)
		if !d.Allowed || w.Count != 2 {
			t.Fatalf("got window %+v decision %+v", w, d)
		}
	})

	t.Run("denies at the limit until the window ends", func(t *testing.T) {
		w, d := decide(model.RateWindow{WindowStart: start, Count: 2}, start.Add(45*time.Minute), 2)
		if d.Allowed || d.RetryAfter != 15*time.Minute || w.Count != 2 {
			t.Fatalf("got window %+v decision %+v", w, d)
		}
	})

	t.Run("opens a new window after an hour", func(t *testing.T) {
		now := start.Add(time.Hour)
		w, d := decide(model.RateWindow{WindowStart: start, Count: 2}, now, 2)
		if !d.Allowed || w.Count != 1 || !w.WindowStart.Equal(now) {
			t.Fatalf("got window %+v decision %+v", w, d)
		}
	})
}
