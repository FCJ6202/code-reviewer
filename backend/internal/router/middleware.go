package router

import (
	"context"
	"log"
	"net/http"
	"runtime/debug"
	"strings"
	"time"
)

// Identity is what the auth layer puts into the request context.
type Identity struct {
	UID   string
	Email string
	Name  string
}

// AuthVerifier turns a bearer token into an Identity.
// Phase 2-3: DevAuth. Phase 4: FirebaseAuth.
type AuthVerifier interface {
	Verify(ctx context.Context, idToken string) (Identity, error)
}

// DevAuth accepts any request and returns a fixed identity. Local dev only.
type DevAuth struct{}

func (DevAuth) Verify(context.Context, string) (Identity, error) {
	return Identity{UID: "dev-user", Email: "dev@example.com", Name: "Dev User"}, nil
}

type ctxKey int

const identityKey ctxKey = 1

// UserFrom returns the authenticated identity; handlers call this.
func UserFrom(ctx context.Context) Identity {
	id, _ := ctx.Value(identityKey).(Identity)
	return id
}

func requireAuth(d Deps) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			token := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")
			if _, isDev := d.Auth.(DevAuth); !isDev && token == "" {
				writeError(w, http.StatusUnauthorized, "missing bearer token")
				return
			}
			id, err := d.Auth.Verify(r.Context(), token)
			if err != nil {
				writeError(w, http.StatusUnauthorized, "invalid token")
				return
			}
			if _, err := d.Users.EnsureUser(r.Context(), id.UID, id.Email, id.Name); err != nil {
				log.Printf("ensure user %s: %v", id.UID, err) // non-fatal
			}
			next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), identityKey, id)))
		})
	}
}

func requestLog(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		sw := &statusWriter{ResponseWriter: w, status: 200}
		next.ServeHTTP(sw, r)
		log.Printf("request %s %s -> %d (%s)", r.Method, r.URL.Path, sw.status, time.Since(start).Round(time.Millisecond))
	})
}

func recoverPanics(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if rec := recover(); rec != nil {
				log.Printf("panic: %v\n%s", rec, debug.Stack())
				writeError(w, http.StatusInternalServerError, "internal error")
			}
		}()
		next.ServeHTTP(w, r)
	})
}

func cors(allowed []string) func(http.Handler) http.Handler {
	set := map[string]bool{}
	for _, o := range allowed {
		set[o] = true
	}
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if origin := r.Header.Get("Origin"); origin != "" && set[origin] {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Vary", "Origin")
				w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")
				w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
			}
			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

type statusWriter struct {
	http.ResponseWriter
	status int
}

func (s *statusWriter) WriteHeader(code int) {
	s.status = code
	s.ResponseWriter.WriteHeader(code)
}
