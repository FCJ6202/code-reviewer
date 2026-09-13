package router

import (
	"log"
	"net/http"
	"strconv"
	"strings"
)

func registerRuleRoutes(mux *http.ServeMux, d Deps) {
	mux.HandleFunc("GET /rules", listRules(d))
	mux.HandleFunc("GET /rules/search", searchRules(d))
	// Phase 6 adds:
	// mux.HandleFunc("POST /rules/ingest", ingestRules(d))  // admin only
}

// listRules returns rules in id order. Optional ?limit=N (default 100, max 1000).
func listRules(d Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		limit, ok := intParam(w, r, "limit")
		if !ok {
			return
		}
		rules, err := d.Rules.List(r.Context(), limit)
		if err != nil {
			log.Printf("list rules: %v", err)
			writeError(w, http.StatusBadGateway, "could not list rules")
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"rules": rules})
	}
}

// searchRules runs the same vector retrieval a review uses.
// ?q=text (required), optional ?k=N (default 6, max 50).
func searchRules(d Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		q := strings.TrimSpace(r.URL.Query().Get("q"))
		if q == "" {
			writeError(w, http.StatusBadRequest, "q is required")
			return
		}
		k, ok := intParam(w, r, "k")
		if !ok {
			return
		}
		rules, err := d.Rules.Retrieve(r.Context(), q, k)
		if err != nil {
			log.Printf("search rules: %v", err)
			writeError(w, http.StatusBadGateway, "rule search failed")
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"query": q, "rules": rules})
	}
}

// intParam reads an optional integer query parameter; 0 means "not set".
// On a malformed value it writes a 400 and returns ok=false.
func intParam(w http.ResponseWriter, r *http.Request, name string) (int, bool) {
	s := r.URL.Query().Get(name)
	if s == "" {
		return 0, true
	}
	n, err := strconv.Atoi(s)
	if err != nil {
		writeError(w, http.StatusBadRequest, name+" must be an integer")
		return 0, false
	}
	return n, true
}
