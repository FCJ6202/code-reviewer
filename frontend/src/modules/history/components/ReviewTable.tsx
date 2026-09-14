import { ScoreBadge } from '@/components/domain/ScoreBadge';
import { formatDateTime } from '@/lib/format';
import { displayLanguage } from '@/lib/language';
import type { ReviewSummary } from '@/types';

interface ReviewTableProps {
  reviews: ReviewSummary[];
  onOpen: (id: string) => void;
}

export function ReviewTable({ reviews, onOpen }: ReviewTableProps) {
  return (
    <table className="w-full table-fixed border-collapse text-left">
      <thead>
        <tr className="h-8 border-b border-border text-xs text-subtle-foreground">
          <th scope="col" className="w-[72px] px-3 font-normal">Score</th>
          <th scope="col" className="w-[240px] px-3 font-normal">File</th>
          <th scope="col" className="hidden px-3 font-normal md:table-cell">Summary</th>
          <th scope="col" className="w-[130px] px-3 text-right font-normal">Reviewed</th>
        </tr>
      </thead>
      <tbody>
        {reviews.map((review) => (
          <tr
            key={review.id}
            onClick={() => onOpen(review.id)}
            className="h-12 cursor-pointer border-b border-card hover:bg-card"
          >
            <td className="px-3">
              <ScoreBadge score={review.score} />
            </td>
            <td className="px-3">
              {/* The row is clickable with a mouse; this button makes it reachable by keyboard. */}
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onOpen(review.id);
                }}
                className="flex max-w-full items-baseline gap-2 rounded text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span className="truncate font-mono text-[13px] text-foreground">{review.filename || 'untitled'}</span>
                <span className="shrink-0 font-mono text-[11px] text-subtle-foreground">
                  {displayLanguage(review.language)}
                </span>
              </button>
            </td>
            <td className="hidden truncate px-3 text-[13px] text-secondary-foreground md:table-cell">{review.summary}</td>
            <td className="px-3 text-right font-mono text-xs text-muted-foreground">{formatDateTime(review.createdAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
