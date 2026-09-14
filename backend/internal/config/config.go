// Package config loads all runtime configuration from environment variables.
package config

import (
	"os"
	"strconv"
	"strings"
)

type Config struct {
	Port             string
	ProjectID        string
	GeminiLocation   string
	GeminiModel      string
	BQDataset        string
	BQLocation       string
	Bucket           string
	AdminEmails      []string
	AllowedOrigins   []string
	DevAuth          bool
	MaxCodeBytes     int
	RateLimitPerHour int // reviews per user per hour; 0 disables the limit
}

func Load() Config {
	loadDotEnv(".env")
	return Config{
		Port:             envOr("PORT", "8080"),
		ProjectID:        envOr("PROJECT_ID", ""),
		GeminiLocation:   envOr("GEMINI_LOCATION", "us-central1"),
		GeminiModel:      envOr("GEMINI_MODEL", "gemini-2.5-flash"),
		BQDataset:        envOr("BQ_DATASET", "reviewer"),
		BQLocation:       envOr("BQ_LOCATION", "asia-south1"),
		Bucket:           envOr("GCS_BUCKET", ""),
		AdminEmails:      splitCSV(os.Getenv("ADMIN_EMAILS")),
		AllowedOrigins:   splitCSV(envOr("CORS_ORIGINS", "http://localhost:5173")),
		DevAuth:          envBool("DEV_AUTH", false), // set true in local .env only
		MaxCodeBytes:     200 * 1024,
		RateLimitPerHour: envInt("RATE_LIMIT_PER_HOUR", 30),
	}
}

// loadDotEnv sets KEY=VALUE lines from path for local dev. A missing file is
// fine (Cloud Run has none), and variables already set in the environment win.
func loadDotEnv(path string) {
	b, err := os.ReadFile(path)
	if err != nil {
		return
	}
	for line := range strings.SplitSeq(string(b), "\n") {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		key, val, ok := strings.Cut(strings.TrimPrefix(line, "export "), "=")
		if !ok {
			continue
		}
		key = strings.TrimSpace(key)
		val = strings.Trim(strings.TrimSpace(val), `"'`)
		if _, exists := os.LookupEnv(key); !exists {
			os.Setenv(key, val)
		}
	}
}

func envOr(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func envBool(key string, def bool) bool {
	v := os.Getenv(key)
	if v == "" {
		return def
	}
	b, err := strconv.ParseBool(v)
	if err != nil {
		return def
	}
	return b
}

func envInt(key string, def int) int {
	v := os.Getenv(key)
	if v == "" {
		return def
	}
	n, err := strconv.Atoi(v)
	if err != nil {
		return def
	}
	return n
}

func splitCSV(s string) []string {
	if s == "" {
		return nil
	}
	var out []string
	for _, p := range strings.Split(s, ",") {
		if p = strings.TrimSpace(p); p != "" {
			out = append(out, p)
		}
	}
	return out
}
