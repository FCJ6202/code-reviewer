// Package rule manages historical review rules: retrieval, listing, ingestion.
package rule

import (
	"context"
	"io"

	"github.com/fcj6202/code-reviewer/backend/internal/model"
)

type Service interface {
	// Retrieve returns the k rules most relevant to a short code summary.
	Retrieve(ctx context.Context, codeSummary string, k int) ([]model.Rule, error)
	// List returns rules in id order, up to limit.
	List(ctx context.Context, limit int) ([]model.Rule, error)
	// Ingest loads a CSV (id,type,description) and embeds new/changed rules.
	Ingest(ctx context.Context, csv io.Reader, sourceFile string) (*model.IngestResult, error)
}
