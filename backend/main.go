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

	fs, err := platform.NewFirestore(ctx, cfg)
	if err != nil {
		log.Fatalf("firestore client: %v", err)
	}
	defer fs.Close()

	rules := rule.NewBigQuery(bq, cfg.ProjectID, cfg.BQDataset)
	users := user.New(user.NewFirestoreRepo(fs))
	reviews := review.New(gem, rules, review.NewFirestoreRepo(fs), users)

	var auth router.AuthVerifier
	if cfg.DevAuth {
		log.Printf("WARNING: DEV_AUTH=true, every request is treated as dev-user. Local dev only, never deploy this.")
		auth = router.DevAuth{}
	} else {
		fbAuth, err := platform.NewFirebaseAuth(ctx, cfg)
		if err != nil {
			log.Fatalf("firebase auth client: %v", err)
		}
		auth = router.FirebaseAuth{Client: fbAuth}
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
