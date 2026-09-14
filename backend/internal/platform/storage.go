package platform

import (
	"context"

	"cloud.google.com/go/storage"
)

// NewStorage returns a Cloud Storage client using Application Default Credentials.
func NewStorage(ctx context.Context) (*storage.Client, error) {
	return storage.NewClient(ctx)
}
