package router

import (
	"errors"
	"log"
	"net/http"

	"github.com/fcj6202/code-reviewer/backend/internal/model"
	"github.com/fcj6202/code-reviewer/backend/internal/module/user"
)

func registerUserRoutes(mux *http.ServeMux, d Deps) {
	mux.HandleFunc("GET /users/me", getMe(d))
}

// meResponse is the stored profile plus whether the caller may use admin pages.
type meResponse struct {
	*model.User
	IsAdmin bool `json:"isAdmin"`
}

// getMe returns the caller's profile. The auth middleware has already called
// EnsureUser, so the document normally exists.
func getMe(d Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := UserFrom(r.Context())
		u, err := d.Users.Get(r.Context(), id.UID)
		if errors.Is(err, user.ErrNotFound) {
			writeError(w, http.StatusNotFound, "user not found")
			return
		}
		if err != nil {
			log.Printf("get user %s: %v", id.UID, err)
			writeError(w, http.StatusInternalServerError, "could not load user")
			return
		}
		writeJSON(w, http.StatusOK, meResponse{User: u, IsAdmin: isAdmin(d.Config, id)})
	}
}
