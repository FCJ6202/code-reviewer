package main

import (
	"context"
	"log"
	"net/http"

	"github.com/fcj6202/code-reviewer/backend/internal/config"
	"github.com/fcj6202/code-reviewer/backend/internal/module/review"
	"github.com/fcj6202/code-reviewer/backend/internal/module/rule"
	"github.com/fcj6202/code-reviewer/backend/internal/module/user"
	"github.com/fcj6202/code-reviewer/backend/internal/platform"
	"github.com/fcj6202/code-reviewer/backend/internal/router"
)

func main() {
	ctx := context.Background()
	cfg := config.Load()

	gem, err := platform.NewGemini(ctx, cfg)
	if err != nil {
		log.Fatalf("gemini client: %v", err)
	}

	bq, err := platform.NewBigQuery(ctx, cfg)
	if err != nil {
		log.Fatalf("bigquery client: %v", err)
	}
	defer bq.Close()

	// Phase 2 wiring: static rules, in-memory review repo, no-op user service.
	// rules := rule.NewStatic()
	// Phase 3 wiring: BigQuery vector rules, in-memory review repo, no-op users.
	// Phase 4 swaps review.NewMemoryRepo → review.NewFirestoreRepo and
	// user.NewNoop → user.New(firestore), and router.DevAuth → FirebaseAuth.
	rules := rule.NewBigQuery(bq, cfg.ProjectID, cfg.BQDataset)
	users := user.NewNoop()
	reviews := review.New(gem, rules, review.NewMemoryRepo(), users)

	var auth router.AuthVerifier = router.DevAuth{}
	if !cfg.DevAuth {
		log.Printf("WARNING: DEV_AUTH is false but Firebase auth is not wired until phase 4; using DevAuth")
	}

	h := router.New(router.Deps{
		Reviews: reviews,
		Rules:   rules,
		Users:   users,
		Auth:    auth,
		Config:  cfg,
	})

	log.Printf("listening on :%s (model=%s, devAuth=%v)", cfg.Port, cfg.GeminiModel, cfg.DevAuth)
	log.Fatal(http.ListenAndServe(":"+cfg.Port, h))
}
