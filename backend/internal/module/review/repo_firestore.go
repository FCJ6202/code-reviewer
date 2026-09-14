package review

import (
	"context"
	"fmt"

	"cloud.google.com/go/firestore"
	"github.com/fcj6202/code-reviewer/backend/internal/model"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// firestoreRepo stores reviews at users/{uid}/reviews/{id}.
type firestoreRepo struct{ fs *firestore.Client }

func NewFirestoreRepo(fs *firestore.Client) Repo {
	return &firestoreRepo{fs: fs}
}

func (f *firestoreRepo) reviews(uid string) *firestore.CollectionRef {
	return f.fs.Collection("users").Doc(uid).Collection("reviews")
}

func (f *firestoreRepo) Save(ctx context.Context, r *model.Review) error {
	_, err := f.reviews(r.UID).Doc(r.ID).Set(ctx, r)
	return err
}

func (f *firestoreRepo) Get(ctx context.Context, uid, id string) (*model.Review, error) {
	snap, err := f.reviews(uid).Doc(id).Get(ctx)
	if status.Code(err) == codes.NotFound {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	var r model.Review
	if err := snap.DataTo(&r); err != nil {
		return nil, fmt.Errorf("decode review %s: %w", id, err)
	}
	// Firestore decodes a stored empty array as a nil slice, which JSON encodes
	// as null. The API contract is always an array.
	if r.Findings == nil {
		r.Findings = []model.Finding{}
	}
	if r.RulesUsed == nil {
		r.RulesUsed = []int64{}
	}
	return &r, nil
}

// List returns newest first and only reads the summary fields, so the stored
// code and findings are not downloaded. Ordering on a single field inside one
// subcollection needs no composite index.
func (f *firestoreRepo) List(ctx context.Context, uid string, limit int) ([]model.ReviewSummary, error) {
	snaps, err := f.reviews(uid).
		Select("id", "filename", "language", "score", "summary", "createdAt").
		OrderBy("createdAt", firestore.Desc).
		Limit(limit).
		Documents(ctx).GetAll()
	if err != nil {
		return nil, err
	}
	out := make([]model.ReviewSummary, 0, len(snaps))
	for _, s := range snaps {
		var rs model.ReviewSummary
		if err := s.DataTo(&rs); err != nil {
			return nil, fmt.Errorf("decode review %s: %w", s.Ref.ID, err)
		}
		out = append(out, rs)
	}
	return out, nil
}
