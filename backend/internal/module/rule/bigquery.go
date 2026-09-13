package rule

import (
	"context"
	"errors"
	"fmt"
	"io"
	"strings"
	"time"

	"cloud.google.com/go/bigquery"
	"github.com/fcj6202/code-reviewer/backend/internal/model"
	"google.golang.org/api/iterator"
)

const (
	retrieveTimeout = 20 * time.Second
	maxQueryChars   = 2000 // text-embedding-005 accepts ~2k tokens; stay well under
	maxK            = 50
)

type bigQuery struct {
	bq    *bigquery.Client
	table string // `project.dataset.rules_embedded`
	model string // `project.dataset.embedding_model`
}

// NewBigQuery retrieves rules with ML.GENERATE_EMBEDDING + VECTOR_SEARCH over
// reviewer.rules_embedded, using the reviewer.embedding_model remote model.
func NewBigQuery(bq *bigquery.Client, projectID, dataset string) Service {
	return &bigQuery{
		bq:    bq,
		table: fmt.Sprintf("`%s.%s.rules_embedded`", projectID, dataset),
		model: fmt.Sprintf("`%s.%s.embedding_model`", projectID, dataset),
	}
}

// Retrieve embeds the text as a retrieval query and returns the k nearest
// rules by cosine distance, closest first.
func (s *bigQuery) Retrieve(ctx context.Context, codeSummary string, k int) ([]model.Rule, error) {
	text := strings.TrimSpace(codeSummary)
	if text == "" {
		return nil, errors.New("empty retrieval query")
	}
	if len(text) > maxQueryChars {
		text = text[:maxQueryChars]
	}
	k = clampK(k)

	ctx, cancel := context.WithTimeout(ctx, retrieveTimeout)
	defer cancel()

	// k is an int we clamped, and table/model come from config, so Sprintf is
	// safe here. The user-supplied text always goes in as a query parameter.
	q := s.bq.Query(fmt.Sprintf(`
SELECT base.id AS id, base.type AS type, base.description AS description, distance
FROM VECTOR_SEARCH(
  TABLE %s, 'embedding',
  (SELECT ml_generate_embedding_result AS embedding
   FROM ML.GENERATE_EMBEDDING(
     MODEL %s,
     (SELECT @q AS content),
     STRUCT(TRUE AS flatten_json_output, 'RETRIEVAL_QUERY' AS task_type))),
  top_k => %d, distance_type => 'COSINE')
ORDER BY distance`, s.table, s.model, k))
	q.Parameters = []bigquery.QueryParameter{{Name: "q", Value: text}}
	return readRules(ctx, q)
}

func (s *bigQuery) List(ctx context.Context, limit int) ([]model.Rule, error) {
	q := s.bq.Query(fmt.Sprintf(
		"SELECT id, type, description FROM %s ORDER BY id LIMIT %d", s.table, clampLimit(limit)))
	return readRules(ctx, q)
}

func (s *bigQuery) Ingest(context.Context, io.Reader, string) (*model.IngestResult, error) {
	return nil, errors.New("ingest via API arrives in phase 6")
}

func readRules(ctx context.Context, q *bigquery.Query) ([]model.Rule, error) {
	it, err := q.Read(ctx)
	if err != nil {
		return nil, fmt.Errorf("bigquery: %w", err)
	}
	rules := []model.Rule{}
	for {
		var r model.Rule
		err := it.Next(&r)
		if errors.Is(err, iterator.Done) {
			return rules, nil
		}
		if err != nil {
			return nil, fmt.Errorf("bigquery rows: %w", err)
		}
		rules = append(rules, r)
	}
}

func clampK(k int) int {
	if k <= 0 {
		return 6
	}
	return min(k, maxK)
}

func clampLimit(limit int) int {
	if limit <= 0 || limit > 1000 {
		return 100
	}
	return limit
}
