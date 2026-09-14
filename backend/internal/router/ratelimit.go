package router

import (
	"fmt"
	"log"
	"math"
	"net/http"
	"strconv"
)

// allowReview spends one of the caller's hourly reviews. When the limit is
// reached it writes the 429 itself and returns false. If the limiter fails the
// request is allowed: a Firestore outage shouldn't block every review.
func allowReview(w http.ResponseWriter, r *http.Request, d Deps, uid string) bool {
	decision, err := d.Limiter.Take(r.Context(), uid)
	if err != nil {
		log.Printf("rate limit for %s failed, allowing: %v", uid, err)
		return true
	}
	if decision.Allowed {
		return true
	}

	seconds := int(math.Ceil(decision.RetryAfter.Seconds()))
	minutes := (seconds + 59) / 60
	w.Header().Set("Retry-After", strconv.Itoa(seconds))
	writeJSON(w, http.StatusTooManyRequests, map[string]any{
		"error":             fmt.Sprintf("You've reached %d reviews this hour. Try again in %s.", decision.Limit, pluralMinutes(minutes)),
		"retryAfterSeconds": seconds,
	})
	return false
}

func pluralMinutes(n int) string {
	if n == 1 {
		return "1 minute"
	}
	return fmt.Sprintf("%d minutes", n)
}
