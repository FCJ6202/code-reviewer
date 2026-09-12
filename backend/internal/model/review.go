package model

import "time"

// ReviewRequest is the body of POST /api/reviews.
type ReviewRequest struct {
	Code     string `json:"code"`
	Filename string `json:"filename"`
	Language string `json:"language"`
}

// Finding is one issue Gemini reports.
type Finding struct {
	Category    string `json:"category"    firestore:"category"` // security|bug|performance|architecture|formatting
	Severity    string `json:"severity"    firestore:"severity"` // high|medium|low
	Line        int    `json:"line"        firestore:"line"`
	Title       string `json:"title"       firestore:"title"`
	Explanation string `json:"explanation" firestore:"explanation"`
	Suggestion  string `json:"suggestion"  firestore:"suggestion"`
	RuleID      int64  `json:"ruleId"      firestore:"ruleId"` // 0 when not based on a historical rule
}

// Review is the full stored review. Firestore path: users/{uid}/reviews/{id}.
type Review struct {
	ID        string    `json:"id"             firestore:"id"`
	UID       string    `json:"-"              firestore:"uid"`
	Filename  string    `json:"filename"       firestore:"filename"`
	Language  string    `json:"language"       firestore:"language"`
	Code      string    `json:"code,omitempty" firestore:"code"`
	Score     int       `json:"score"          firestore:"score"`
	Summary   string    `json:"summary"        firestore:"summary"`
	Findings  []Finding `json:"findings"       firestore:"findings"`
	RulesUsed []int64   `json:"rulesUsed"      firestore:"rulesUsed"`
	Model     string    `json:"model"          firestore:"model"`
	LatencyMs int64     `json:"latencyMs"      firestore:"latencyMs"`
	Degraded  bool      `json:"degraded"       firestore:"degraded"` // rule retrieval failed
	CreatedAt time.Time `json:"createdAt"      firestore:"createdAt"`
}

// ReviewSummary is the list-view projection (no code, no findings).
type ReviewSummary struct {
	ID        string    `json:"id"`
	Filename  string    `json:"filename"`
	Language  string    `json:"language"`
	Score     int       `json:"score"`
	Summary   string    `json:"summary"`
	CreatedAt time.Time `json:"createdAt"`
}

// ModelOutput is exactly what Gemini is asked to return (response schema).
type ModelOutput struct {
	Score    int       `json:"score"`
	Summary  string    `json:"summary"`
	Findings []Finding `json:"findings"`
}
