import { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { buttonVariants } from '@/components/ui/buttonVariants';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { ReviewTable } from './components/ReviewTable';
import { ScoreTrendChart } from './components/ScoreTrendChart';
import { useReviewList } from '@/hooks/useReviews';
import { summarizeHistory } from './utils/history';
import { ROUTES, type ReviewLocationState } from '@/config/navigation';

export default function HistoryPage() {
  const navigate = useNavigate();
  const { data: reviews, isPending, isError, error, refetch } = useReviewList();

  const openReview = useCallback(
    (id: string) => {
      const state: ReviewLocationState = { from: 'history' };
      navigate(ROUTES.review(id), { state });
    },
    [navigate],
  );

  const hasReviews = reviews !== undefined && reviews.length > 0;

  return (
    <div className="flex-1 lg:min-h-0 lg:overflow-y-auto">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-4 px-6 py-6">
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="text-xl font-semibold">Score history</h1>
          {hasReviews && <span className="font-mono text-xs text-muted-foreground">{summarizeHistory(reviews)}</span>}
        </div>

        {isPending && (
          <>
            <Skeleton className="h-[234px]" />
            <Skeleton className="h-64" />
          </>
        )}

        {isError && (
          <EmptyState
            title="Could not load your history"
            description={error.message}
            action={
              <Button variant="secondary" onClick={() => void refetch()}>
                Try again
              </Button>
            }
          />
        )}

        {reviews?.length === 0 && (
          <EmptyState
            title="No reviews yet"
            description="Your past reviews and score trend will show up here."
            action={
              <Link to={ROUTES.newReview} className={buttonVariants()}>
                Review your first file
              </Link>
            }
          />
        )}

        {hasReviews && (
          <>
            <ScoreTrendChart reviews={reviews} />
            <ReviewTable reviews={reviews} onOpen={openReview} />
          </>
        )}
      </div>
    </div>
  );
}
