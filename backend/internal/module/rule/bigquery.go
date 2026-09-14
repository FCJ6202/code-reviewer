package rule

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"log"
	"path"
	"regexp"
	"strings"
	"time"

	"cloud.google.com/go/bigquery"
	"cloud.google.com/go/storage"
	"github.com/fcj6202/code-reviewer/backend/internal/model"
	"google.golang.org/api/iterator"
)

const (
	retrieveTimeout = 20 * time.Second
	ingestTimeout   = 110 * time.Second // Cloud Run's request timeout is 120 s
	stagingTTL      = time.Hour         // safety net if deleting the staging table fails
	maxQueryChars   = 2000              // text-embedding-005 accepts ~2k tokens; stay well under
	maxK            = 50
)

// BigQueryConfig says where rules live.
type BigQueryConfig struct {
	ProjectID string
	Dataset   string
	Bucket    string // GCS bucket that archives uploaded CSVs
}

type bigQuery struct {
	bq    *bigquery.Client
	gcs   *storage.Client
	cfg   BigQueryConfig
	table string // `project.dataset.rules_embedded`
	model string // `project.dataset.embedding_model`
}

// NewBigQuery retrieves rules with ML.GENERATE_EMBEDDING + VECTOR_SEARCH over
// reviewer.rules_embedded, and ingests CSVs through GCS into the same table.
func NewBigQuery(bq *bigquery.Client, gcs *storage.Client, cfg BigQueryConfig) Service {
	s := &bigQuery{bq: bq, gcs: gcs, cfg: cfg}
	s.table = s.qualified("rules_embedded")
	s.model = s.qualified("embedding_model")
	return s
}

func (s *bigQuery) qualified(name string) string {
	return fmt.Sprintf("`%s.%s.%s`", s.cfg.ProjectID, s.cfg.Dataset, name)
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

var stagingSchema = bigquery.Schema{
	{Name: "id", Type: bigquery.IntegerFieldType, Required: true},
	{Name: "type", Type: bigquery.StringFieldType, Required: true},
	{Name: "description", Type: bigquery.StringFieldType, Required: true},
}

// Ingest validates a rules CSV, archives it in GCS, loads it into a short-lived
// staging table, embeds new or changed rules and MERGEs them on id. Rules that
// are not in the file are kept.
func (s *bigQuery) Ingest(ctx context.Context, csv io.Reader, sourceFile string) (*model.IngestResult, error) {
	if s.cfg.Bucket == "" {
		return nil, errors.New("GCS_BUCKET is not configured")
	}
	data, rows, err := parseRulesCSV(csv)
	if err != nil {
		return nil, err
	}

	ctx, cancel := context.WithTimeout(ctx, ingestTimeout)
	defer cancel()

	// A unique run id keeps concurrent uploads from sharing a staging table.
	runID := time.Now().UTC().Format("20060102T150405") + "_" + randomHex(4)
	object := "rules/" + runID + "-" + safeObjectName(sourceFile)
	if err := s.upload(ctx, object, data); err != nil {
		return nil, fmt.Errorf("upload csv: %w", err)
	}
	uri := fmt.Sprintf("gs://%s/%s", s.cfg.Bucket, object)

	staging := s.bq.Dataset(s.cfg.Dataset).Table("rules_staging_" + runID)
	if err := staging.Create(ctx, &bigquery.TableMetadata{
		Schema:         stagingSchema,
		ExpirationTime: time.Now().Add(stagingTTL),
	}); err != nil {
		return nil, fmt.Errorf("create staging table: %w", err)
	}
	defer func() {
		if err := staging.Delete(context.WithoutCancel(ctx)); err != nil {
			log.Printf("delete staging table %s (it expires on its own): %v", staging.TableID, err)
		}
	}()

	if err := s.loadStaging(ctx, staging, uri); err != nil {
		return nil, fmt.Errorf("load staging table: %w", err)
	}

	stagingName := s.qualified(staging.TableID)
	upserted, err := s.merge(ctx, stagingName, uri)
	if err != nil {
		return nil, fmt.Errorf("merge rules: %w", err)
	}
	failed, err := s.countUnembedded(ctx, stagingName)
	if err != nil {
		return nil, fmt.Errorf("verify rules: %w", err)
	}

	return &model.IngestResult{RowsRead: rows, RowsUpserted: upserted, RowsFailed: failed, SourceFile: uri}, nil
}

func (s *bigQuery) upload(ctx context.Context, object string, data []byte) error {
	w := s.gcs.Bucket(s.cfg.Bucket).Object(object).NewWriter(ctx)
	w.ContentType = "text/csv"
	if _, err := w.Write(data); err != nil {
		_ = w.Close()
		return err
	}
	return w.Close()
}

func (s *bigQuery) loadStaging(ctx context.Context, table *bigquery.Table, uri string) error {
	ref := bigquery.NewGCSReference(uri)
	ref.SourceFormat = bigquery.CSV
	ref.SkipLeadingRows = 1
	ref.AllowQuotedNewlines = true

	loader := table.LoaderFrom(ref)
	loader.CreateDisposition = bigquery.CreateNever
	loader.WriteDisposition = bigquery.WriteTruncate
	_, err := runJob(ctx, loader)
	return err
}

// mergeSQL args: %[1]s rules_embedded, %[2]s embedding model, %[3]s staging table.
// Only new or changed rules are embedded; rows whose embedding failed are skipped.
const mergeSQL = `
MERGE %[1]s T
USING (
  SELECT id, type, description, ml_generate_embedding_result AS embedding
  FROM ML.GENERATE_EMBEDDING(
    MODEL %[2]s,
    (SELECT s.id, s.type, s.description, CONCAT(s.type, ': ', s.description) AS content
     FROM %[3]s s
     LEFT JOIN %[1]s e USING (id)
     WHERE e.id IS NULL OR e.type != s.type OR e.description != s.description),
    STRUCT(TRUE AS flatten_json_output, 'RETRIEVAL_DOCUMENT' AS task_type))
  WHERE ml_generate_embedding_status = ''
) S
ON T.id = S.id
WHEN MATCHED THEN UPDATE SET
  type = S.type, description = S.description, embedding = S.embedding,
  source_file = @source, loaded_at = CURRENT_TIMESTAMP()
WHEN NOT MATCHED THEN INSERT (id, type, description, embedding, source_file, loaded_at)
  VALUES (S.id, S.type, S.description, S.embedding, @source, CURRENT_TIMESTAMP())`

func (s *bigQuery) merge(ctx context.Context, staging, uri string) (int64, error) {
	q := s.bq.Query(fmt.Sprintf(mergeSQL, s.table, s.model, staging))
	q.Parameters = []bigquery.QueryParameter{{Name: "source", Value: uri}}
	status, err := runJob(ctx, q)
	if err != nil {
		return 0, err
	}
	if status.Statistics != nil {
		if stats, ok := status.Statistics.Details.(*bigquery.QueryStatistics); ok {
			return stats.NumDMLAffectedRows, nil
		}
	}
	return 0, nil
}

// unembeddedSQL counts staged rules that still don't match rules_embedded after
// the MERGE, i.e. the ones whose embedding failed.
const unembeddedSQL = `
SELECT COUNT(*) AS n
FROM %[2]s s
LEFT JOIN %[1]s e USING (id)
WHERE e.id IS NULL OR e.type != s.type OR e.description != s.description`

func (s *bigQuery) countUnembedded(ctx context.Context, staging string) (int64, error) {
	it, err := s.bq.Query(fmt.Sprintf(unembeddedSQL, s.table, staging)).Read(ctx)
	if err != nil {
		return 0, err
	}
	var row struct {
		N int64 `bigquery:"n"`
	}
	if err := it.Next(&row); err != nil {
		return 0, err
	}
	return row.N, nil
}

type jobRunner interface {
	Run(ctx context.Context) (*bigquery.Job, error)
}

// runJob starts a BigQuery job, waits for it, and returns its final status.
func runJob(ctx context.Context, r jobRunner) (*bigquery.JobStatus, error) {
	job, err := r.Run(ctx)
	if err != nil {
		return nil, err
	}
	status, err := job.Wait(ctx)
	if err != nil {
		return nil, err
	}
	if err := status.Err(); err != nil {
		return nil, err
	}
	return status, nil
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

var unsafeObjectChars = regexp.MustCompile(`[^A-Za-z0-9._-]+`)

// safeObjectName keeps an uploaded filename readable in the GCS object name
// without letting it add path segments or odd characters.
func safeObjectName(filename string) string {
	name := unsafeObjectChars.ReplaceAllString(path.Base(filename), "_")
	name = strings.Trim(name, "._")
	if name == "" {
		return "rules.csv"
	}
	if len(name) > 80 {
		name = name[len(name)-80:]
	}
	return name
}

func randomHex(n int) string {
	b := make([]byte, n)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
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
