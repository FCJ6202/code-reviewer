import { formatDateTime, formatLatency } from '@/lib/format';
import type { Review } from '@/types';

export function ReviewMeta({ review }: { review: Review }) {
  return (
    <div className="mt-auto flex shrink-0 flex-wrap gap-x-4 gap-y-1 border-t border-border px-6 py-3 font-mono text-[11px] text-subtle-foreground">
      <span>{review.model}</span>
      <span>{formatLatency(review.latencyMs)}</span>
      <span>{formatDateTime(review.createdAt)}</span>
    </div>
  );
}
