package model

// Rule is one historical review rule. Stored in BigQuery reviewer.rules_embedded.
type Rule struct {
	ID          int64   `json:"id"                 bigquery:"id"`
	Type        string  `json:"type"               bigquery:"type"`
	Description string  `json:"description"        bigquery:"description"`
	Distance    float64 `json:"distance,omitempty" bigquery:"distance"` // set only by Retrieve
}

// IngestResult reports what an ingest run did (phase 6).
type IngestResult struct {
	RowsRead     int64  `json:"rowsRead"`
	RowsUpserted int64  `json:"rowsUpserted"`
	SourceFile   string `json:"sourceFile"`
}
