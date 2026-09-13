package review

// PHASE 2 ONLY. Replaced by repo_firestore.go in phase 4. Kept afterwards for tests.

import (
	"context"
	"sort"
	"sync"

	"github.com/fcj6202/code-reviewer/backend/internal/model"
)

type memoryRepo struct {
	mu   sync.RWMutex
	data map[string]map[string]*model.Review // uid → id → review
}

func NewMemoryRepo() Repo {
	return &memoryRepo{data: map[string]map[string]*model.Review{}}
}

func (m *memoryRepo) Save(_ context.Context, r *model.Review) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	if m.data[r.UID] == nil {
		m.data[r.UID] = map[string]*model.Review{}
	}
	cp := *r
	m.data[r.UID][r.ID] = &cp
	return nil
}

func (m *memoryRepo) Get(_ context.Context, uid, id string) (*model.Review, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	if r, ok := m.data[uid][id]; ok {
		cp := *r
		return &cp, nil
	}
	return nil, ErrNotFound
}

func (m *memoryRepo) List(_ context.Context, uid string, limit int) ([]model.ReviewSummary, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	out := []model.ReviewSummary{}
	for _, r := range m.data[uid] {
		out = append(out, model.ReviewSummary{
			ID: r.ID, Filename: r.Filename, Language: r.Language,
			Score: r.Score, Summary: r.Summary, CreatedAt: r.CreatedAt,
		})
	}
	sort.Slice(out, func(i, j int) bool { return out[i].CreatedAt.After(out[j].CreatedAt) })
	if len(out) > limit {
		out = out[:limit]
	}
	return out, nil
}
