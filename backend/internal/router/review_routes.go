package router

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/fcj6202/code-reviewer/backend/internal/model"
	"github.com/fcj6202/code-reviewer/backend/internal/module/review"
)

func registerReviewRoutes(mux *http.ServeMux, d Deps) {
	mux.HandleFunc("POST /reviews", createReview(d))
	mux.HandleFunc("GET /reviews", listReviews(d))
	mux.HandleFunc("GET /reviews/{id}", getReview(d))
}

// getReview returns one of the caller's reviews, including the submitted code.
// The lookup is scoped to the caller's uid, so other users' ids return 404.
func getReview(d Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := UserFrom(r.Context())
		rv, err := d.Reviews.Get(r.Context(), id.UID, r.PathValue("id"))
		if errors.Is(err, review.ErrNotFound) {
			writeError(w, http.StatusNotFound, "review not found")
			return
		}
		if err != nil {
			log.Printf("get review: %v", err)
			writeError(w, http.StatusInternalServerError, "could not load review")
			return
		}
		writeJSON(w, http.StatusOK, rv)
	}
}

// listReviews returns the caller's reviews, newest first.
// Optional ?limit=N (1-100, default 20; the service clamps out-of-range values).
func listReviews(d Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		limit := 0
		if s := r.URL.Query().Get("limit"); s != "" {
			n, err := strconv.Atoi(s)
			if err != nil {
				writeError(w, http.StatusBadRequest, "limit must be an integer")
				return
			}
			limit = n
		}
		id := UserFrom(r.Context())
		reviews, err := d.Reviews.List(r.Context(), id.UID, limit)
		if err != nil {
			log.Printf("list reviews: %v", err)
			writeError(w, http.StatusInternalServerError, "could not list reviews")
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"reviews": reviews})
	}
}

func createReview(d Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		r.Body = http.MaxBytesReader(w, r.Body, int64(d.Config.MaxCodeBytes)+4096)
		var req model.ReviewRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeError(w, http.StatusBadRequest, "invalid JSON body or submission over 200 KB")
			return
		}
		if len(req.Code) > d.Config.MaxCodeBytes {
			writeError(w, http.StatusRequestEntityTooLarge, "code exceeds 200 KB")
			return
		}
		// Checked here too so an invalid request doesn't use up a rate-limit slot.
		if strings.TrimSpace(req.Code) == "" {
			writeError(w, http.StatusBadRequest, review.ErrEmptyCode.Error())
			return
		}

		id := UserFrom(r.Context())
		// Taken before calling Gemini: failed reviews still cost, and parallel
		// requests can't slip past the limit.
		if !allowReview(w, r, d, id.UID) {
			return
		}

		rv, err := d.Reviews.Create(r.Context(), id.UID, req)
		if err != nil {
			if errors.Is(err, review.ErrEmptyCode) {
				writeError(w, http.StatusBadRequest, err.Error())
				return
			}
			log.Printf("create review: %v", err)
			writeError(w, http.StatusBadGateway, "review failed, please try again")
			return
		}
		rv.Code = "" // don't echo the submission back
		writeJSON(w, http.StatusOK, rv)
	}
}
