package platform

import (
	"context"
	"fmt"

	"cloud.google.com/go/firestore"
	"github.com/fcj6202/code-reviewer/backend/internal/config"
)

// NewFirestore returns a client for the project's (default) Firestore database.
func NewFirestore(ctx context.Context, cfg config.Config) (*firestore.Client, error) {
	if cfg.ProjectID == "" {
		return nil, fmt.Errorf("PROJECT_ID is required")
	}
	return firestore.NewClient(ctx, cfg.ProjectID)
}
