package platform

import (
	"context"
	"fmt"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"github.com/fcj6202/code-reviewer/backend/internal/config"
)

// NewFirebaseAuth returns a Firebase Auth client for verifying ID tokens.
// Verification only needs the project ID (Google's public signing keys are
// fetched and cached by the SDK), so no service-account key is involved.
func NewFirebaseAuth(ctx context.Context, cfg config.Config) (*auth.Client, error) {
	if cfg.ProjectID == "" {
		return nil, fmt.Errorf("PROJECT_ID is required")
	}
	app, err := firebase.NewApp(ctx, &firebase.Config{ProjectID: cfg.ProjectID})
	if err != nil {
		return nil, err
	}
	return app.Auth(ctx)
}
