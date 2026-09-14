package model

// Rule is one historical review rule. Stored in BigQuery reviewer.rules_embedded.
type Rule struct {
	ID          int64   `json:"id"                 bigquery:"id"`
	Type        string  `json:"type"               bigquery:"type"`
	Description string  `json:"description"        bigquery:"description"`
	Distance    float64 `json:"distance,omitempty" bigquery:"distance"` // set only by Retrieve
}

// IngestResult reports what a rules CSV upload did.
type IngestResult struct {
	RowsRead     int64  `json:"rowsRead"`
	RowsUpserted int64  `json:"rowsUpserted"`
	RowsFailed   int64  `json:"rowsFailed"` // new or changed rules whose embedding failed; not saved
	SourceFile   string `json:"sourceFile"` // gs:// URI of the archived upload
}
