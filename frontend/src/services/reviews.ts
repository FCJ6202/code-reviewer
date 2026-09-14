import { api } from './api';
import type { Finding, Review, ReviewListResponse, ReviewRequest, ReviewSummary } from '@/types';

// Go encodes empty (nil) slices as null, so the wire format can differ from Review.
type ReviewResponse = Omit<Review, 'findings' | 'rulesUsed'> & {
  findings: Finding[] | null;
  rulesUsed: number[] | null;
};

function normalizeReview(review: ReviewResponse): Review {
  return { ...review, findings: review.findings ?? [], rulesUsed: review.rulesUsed ?? [] };
}

export async function createReview(request: ReviewRequest): Promise<Review> {
  const { data } = await api.post<ReviewResponse>('/reviews', request);
  return normalizeReview(data);
}

export async function listReviews(limit: number): Promise<ReviewSummary[]> {
  const { data } = await api.get<ReviewListResponse>('/reviews', { params: { limit } });
  return data.reviews ?? [];
}

export async function getReview(id: string): Promise<Review> {
  const { data } = await api.get<ReviewResponse>(`/reviews/${encodeURIComponent(id)}`);
  return normalizeReview(data);
}
