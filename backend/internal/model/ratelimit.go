package model

import "time"

// RateWindow is a user's review counter. Firestore path: rateLimits/{uid}.
type RateWindow struct {
	WindowStart time.Time `firestore:"windowStart"`
	Count       int       `firestore:"count"`
}
