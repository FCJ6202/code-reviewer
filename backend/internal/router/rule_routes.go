package router

import (
	"errors"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/fcj6202/code-reviewer/backend/internal/module/rule"
)

const maxRulesCSVBytes = 1 << 20 // 1 MB

// Rule routes are admin-only. Reviews use rules through the rule module
// (rules.Retrieve in review.Create), never through these endpoints.
func registerRuleRoutes(mux *http.ServeMux, d Deps) {
	mux.HandleFunc("GET /rules", requireAdmin(d, listRules(d)))
	mux.HandleFunc("GET /rules/search", requireAdmin(d, searchRules(d)))
	mux.HandleFunc("POST /rules/ingest", requireAdmin(d, ingestRules(d)))
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

// ingestRules accepts a multipart upload with the CSV in the "file" field.
// Admin only (see registerRuleRoutes).
func ingestRules(d Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Room for the multipart envelope around the file itself.
		r.Body = http.MaxBytesReader(w, r.Body, maxRulesCSVBytes+64*1024)
		file, header, err := r.FormFile("file")
		if err != nil {
			writeError(w, http.StatusBadRequest, "upload a CSV file in the \"file\" field (max 1 MB)")
			return
		}
		defer file.Close()
		if header.Size > maxRulesCSVBytes {
			writeError(w, http.StatusRequestEntityTooLarge, "CSV exceeds 1 MB")
			return
		}

		result, err := d.Rules.Ingest(r.Context(), file, header.Filename)
		var invalid *rule.ValidationError
		if errors.As(err, &invalid) {
			writeError(w, http.StatusBadRequest, invalid.Error())
			return
		}
		if err != nil {
			log.Printf("ingest rules: %v", err)
			writeError(w, http.StatusBadGateway, "rule ingest failed, please try again")
			return
		}

		log.Printf("rules ingested by %s: read=%d upserted=%d failed=%d source=%s",
			UserFrom(r.Context()).Email, result.RowsRead, result.RowsUpserted, result.RowsFailed, result.SourceFile)
		writeJSON(w, http.StatusOK, result)
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
