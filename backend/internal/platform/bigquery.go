package platform

import (
	"context"
	"fmt"

	"cloud.google.com/go/bigquery"
	"github.com/fcj6202/code-reviewer/backend/internal/config"
)

// NewBigQuery returns a client whose queries run in the dataset's region.
func NewBigQuery(ctx context.Context, cfg config.Config) (*bigquery.Client, error) {
	if cfg.ProjectID == "" {
		return nil, fmt.Errorf("PROJECT_ID is required")
	}
	client, err := bigquery.NewClient(ctx, cfg.ProjectID)
	if err != nil {
		return nil, err
	}
	client.Location = cfg.BQLocation
	return client, nil
}
