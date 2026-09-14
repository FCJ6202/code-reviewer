package user

import (
	"context"
	"fmt"
	"math"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/fcj6202/code-reviewer/backend/internal/model"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// firestoreRepo stores users at users/{uid}.
type firestoreRepo struct{ fs *firestore.Client }

func NewFirestoreRepo(fs *firestore.Client) Repo {
	return &firestoreRepo{fs: fs}
}

func (f *firestoreRepo) doc(uid string) *firestore.DocumentRef {
	return f.fs.Collection("users").Doc(uid)
}

func (f *firestoreRepo) Get(ctx context.Context, uid string) (*model.User, error) {
	snap, err := f.doc(uid).Get(ctx)
	if status.Code(err) == codes.NotFound {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	var u model.User
	if err := snap.DataTo(&u); err != nil {
		return nil, fmt.Errorf("decode user %s: %w", uid, err)
	}
	return &u, nil
}

func (f *firestoreRepo) Create(ctx context.Context, u *model.User) error {
	_, err := f.doc(u.UID).Create(ctx, u)
	if status.Code(err) == codes.AlreadyExists {
		return ErrAlreadyExists
	}
	return err
}

func (f *firestoreRepo) Touch(ctx context.Context, uid, email, name string, at time.Time) error {
	_, err := f.doc(uid).Update(ctx, []firestore.Update{
		{Path: "email", Value: email},
		{Path: "displayName", Value: name},
		{Path: "lastSeenAt", Value: at},
	})
	if status.Code(err) == codes.NotFound {
		return ErrNotFound
	}
	return err
}

// AddReview runs in a transaction so two reviews finishing at the same time
// can't overwrite each other's count. If the user document is missing (e.g.
// EnsureUser failed earlier) it is created with just the aggregates.
func (f *firestoreRepo) AddReview(ctx context.Context, uid string, score int, at time.Time) error {
	ref := f.doc(uid)
	return f.fs.RunTransaction(ctx, func(ctx context.Context, tx *firestore.Transaction) error {
		var u model.User
		isNew := false
		snap, err := tx.Get(ref)
		switch {
		case status.Code(err) == codes.NotFound:
			isNew = true
		case err != nil:
			return err
		default:
			if err := snap.DataTo(&u); err != nil {
				return fmt.Errorf("decode user %s: %w", uid, err)
			}
		}

		u.ReviewCount++
		u.TotalScore += score
		avg := math.Round(float64(u.TotalScore)/float64(u.ReviewCount)*100) / 100

		fields := map[string]any{
			"uid":         uid,
			"reviewCount": u.ReviewCount,
			"totalScore":  u.TotalScore,
			"avgScore":    avg,
			"lastSeenAt":  at,
		}
		if isNew {
			fields["createdAt"] = at
		}
		return tx.Set(ref, fields, firestore.MergeAll)
	})
}
