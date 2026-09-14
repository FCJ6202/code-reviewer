// Mirrors backend/internal/model/user.go (JSON fields only), plus isAdmin from GET /api/users/me.

export interface User {
  uid: string;
  email: string;
  displayName: string;
  createdAt: string;
  lastSeenAt: string;
  reviewCount: number;
  avgScore: number;
  /** Verified email is in the API's ADMIN_EMAILS. The API enforces admin routes itself. */
  isAdmin: boolean;
}
