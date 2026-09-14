package ratelimit

import (
	"context"
	"fmt"

	"cloud.google.com/go/firestore"
	"github.com/fcj6202/code-reviewer/backend/internal/model"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// firestoreRepo stores windows at rateLimits/{uid}.
type firestoreRepo struct{ fs *firestore.Client }

func NewFirestoreRepo(fs *firestore.Client) Repo {
	return &firestoreRepo{fs: fs}
}

func (f *firestoreRepo) Update(ctx context.Context, uid string, fn func(model.RateWindow) (model.RateWindow, bool)) error {
	ref := f.fs.Collection("rateLimits").Doc(uid)
	return f.fs.RunTransaction(ctx, func(ctx context.Context, tx *firestore.Transaction) error {
		var current model.RateWindow
		snap, err := tx.Get(ref)
		switch {
		case status.Code(err) == codes.NotFound:
			// First request ever: start from an empty window.
		case err != nil:
			return err
		default:
			if err := snap.DataTo(&current); err != nil {
				return fmt.Errorf("decode rate window %s: %w", uid, err)
			}
		}

		next, write := fn(current)
		if !write {
			return nil
		}
		return tx.Set(ref, next)
	})
}
