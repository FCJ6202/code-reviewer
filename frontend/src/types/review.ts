// Mirrors backend/internal/model/review.go. Keep the two in sync.

export type Category = 'security' | 'bug' | 'performance' | 'architecture' | 'formatting';

export type Severity = 'high' | 'medium' | 'low';

export interface Finding {
  category: Category;
  severity: Severity;
  line: number;
  title: string;
  explanation: string;
  suggestion: string;
  /** 0 when the finding is not based on a historical rule. */
  ruleId: number;
}

export interface Review {
  id: string;
  filename: string;
  language: string;
  /** Omitted by POST /api/reviews; returned by GET /api/reviews/{id}. */
  code?: string;
  score: number;
  summary: string;
  findings: Finding[];
  rulesUsed: number[];
  model: string;
  latencyMs: number;
  /** True when rule retrieval failed and the review ran without team rules. */
  degraded: boolean;
  createdAt: string;
}

export interface ReviewSummary {
  id: string;
  filename: string;
  language: string;
  score: number;
  summary: string;
  createdAt: string;
}

export interface ReviewRequest {
  code: string;
  filename: string;
}

export interface ReviewListResponse {
  reviews: ReviewSummary[];
}
