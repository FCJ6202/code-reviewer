// Package router mounts HTTP routes and middleware. It never touches storage
// or Gemini directly; everything goes through module services.
package router

import (
	"net/http"

	"github.com/fcj6202/code-reviewer/backend/internal/config"
	"github.com/fcj6202/code-reviewer/backend/internal/module/review"
	"github.com/fcj6202/code-reviewer/backend/internal/module/rule"
	"github.com/fcj6202/code-reviewer/backend/internal/module/user"
)

type Deps struct {
	Reviews review.Service
	Rules   rule.Service
	Users   user.Service
	Auth    AuthVerifier
	Config  config.Config
}

func New(d Deps) http.Handler {
	mux := http.NewServeMux()

	// Public. NOTE: never use /healthz — Google's front end intercepts it.
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})
	mux.HandleFunc("GET /{$}", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"message": "24/7 Intelligent Code Reviewer API"})
	})

	// Authenticated API. Each *_routes.go file registers its own group.
	api := http.NewServeMux()
	registerReviewRoutes(api, d)
	// registerRuleRoutes(api, d)  // phase 3
	// registerUserRoutes(api, d)  // phase 4
	mux.Handle("/api/", http.StripPrefix("/api", requireAuth(d)(api)))

	return recoverPanics(requestLog(cors(d.Config.AllowedOrigins)(mux)))
}
