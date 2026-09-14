// Mirrors backend/internal/model/user.go (JSON fields only).

export interface User {
  uid: string;
  email: string;
  displayName: string;
  createdAt: string;
  lastSeenAt: string;
  reviewCount: number;
  avgScore: number;
}
