import { ScoreBadge } from '@/components/domain/ScoreBadge';
import { formatSeverityCounts } from '../utils/findings';
import { scoreRubric } from '@/config/score';
import type { Review } from '@/types';

export function ScoreHeader({ review }: { review: Review }) {
  return (
    <div className="flex flex-col gap-3 border-b border-border px-6 pb-5 pt-6">
      <div className="flex items-end gap-5">
        <ScoreBadge score={review.score} size="lg" />
        <div className="flex flex-col gap-1.5 pb-1">
          <span className="text-[15px] font-semibold">{scoreRubric(review.score)}</span>
          <span className="font-mono text-xs text-muted-foreground">{formatSeverityCounts(review.findings)}</span>
        </div>
      </div>
      {review.summary && <p className="text-[13px] leading-5 text-secondary-foreground">{review.summary}</p>}
    </div>
  );
}
