import { CodeView } from '@/components/domain/CodeView';
import { DegradedBanner } from '@/components/domain/DegradedBanner';
import { FindingList } from './FindingList';
import { ReviewFileHeader } from './ReviewFileHeader';
import { ReviewMeta } from './ReviewMeta';
import { ScoreHeader } from './ScoreHeader';
import { useFindingFilter } from '../hooks/useFindingFilter';
import type { Review } from '@/types';

interface ReviewResultViewProps {
  review: Review;
  fromHistory: boolean;
}

export function ReviewResultView({ review, fromHistory }: ReviewResultViewProps) {
  const findingState = useFindingFilter(review);

  return (
    <div className="flex flex-1 flex-col lg:min-h-0">
      {review.degraded && <DegradedBanner />}

      <div className="grid flex-1 lg:min-h-0 lg:grid-cols-[minmax(0,7fr)_minmax(0,6fr)]">
        <section
          aria-label="Submitted code"
          className="flex min-h-0 flex-col border-b border-border lg:border-b-0 lg:border-r"
        >
          <ReviewFileHeader review={review} fromHistory={fromHistory} />
          {review.code ? (
            <CodeView
              code={review.code}
              marks={findingState.lineMarks}
              selectedLine={findingState.selectedLine}
              className="min-h-0 flex-1"
            />
          ) : (
            <p className="px-5 py-4 text-sm text-muted-foreground">The submitted code isn&apos;t available for this review.</p>
          )}
        </section>

        <section aria-label="Review findings" className="flex min-h-0 flex-col">
          <ScoreHeader review={review} />
          <FindingList state={findingState} showRules={!review.degraded} />
          <ReviewMeta review={review} />
        </section>
      </div>
    </div>
  );
}
