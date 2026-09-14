import { formatDateTime, formatDayMonth } from '@/lib/format';
import type { ReviewSummary } from '@/types';

export interface TrendPoint {
  id: string;
  score: number;
  /** X-axis tick, e.g. "13 Sep". */
  label: string;
  /** Tooltip, e.g. "13 Sep, 04:30". */
  dateTime: string;
  filename: string;
}

/** The API returns newest first; the chart reads left to right, oldest first. */
export function toTrendPoints(reviews: ReviewSummary[]): TrendPoint[] {
  return [...reviews].reverse().map((review) => ({
    id: review.id,
    score: review.score,
    label: formatDayMonth(review.createdAt),
    dateTime: formatDateTime(review.createdAt),
    filename: review.filename || 'untitled',
  }));
}

export function averageScore(reviews: ReviewSummary[]): number {
  if (reviews.length === 0) return 0;
  return reviews.reduce((sum, review) => sum + review.score, 0) / reviews.length;
}

/** "7 reviews · average 5.0" */
export function summarizeHistory(reviews: ReviewSummary[]): string {
  const noun = reviews.length === 1 ? 'review' : 'reviews';
  return `${reviews.length} ${noun} · average ${averageScore(reviews).toFixed(1)}`;
}
