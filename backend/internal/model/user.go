package model

import "time"

// User lives at Firestore users/{uid}.
type User struct {
	UID         string    `json:"uid"         firestore:"uid"`
	Email       string    `json:"email"       firestore:"email"`
	DisplayName string    `json:"displayName" firestore:"displayName"`
	CreatedAt   time.Time `json:"createdAt"   firestore:"createdAt"`
	LastSeenAt  time.Time `json:"lastSeenAt"  firestore:"lastSeenAt"`
	ReviewCount int       `json:"reviewCount" firestore:"reviewCount"`
	TotalScore  int       `json:"-"           firestore:"totalScore"`
	AvgScore    float64   `json:"avgScore"    firestore:"avgScore"`
}

type ScorePoint struct {
	At    time.Time `json:"at"`
	Score int       `json:"score"`
}

// UserStats backs GET /api/users/me/stats (phase 6).
type UserStats struct {
	ReviewCount    int            `json:"reviewCount"`
	AvgScore       float64        `json:"avgScore"`
	ScoreTrend     []ScorePoint   `json:"scoreTrend"`
	FindingsByType map[string]int `json:"findingsByType"`
}
