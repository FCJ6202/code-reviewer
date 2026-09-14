import { useLocation, useParams } from 'react-router-dom';
import { PageLoader } from '@/components/layout/PageLoader';
import { ReviewLoadError } from './components/ReviewLoadError';
import { ReviewResultView } from './components/ReviewResultView';
import { useReview } from '@/hooks/useReviews';
import { isFromHistory } from '@/config/navigation';

export default function ReviewResultPage() {
  const { id = '' } = useParams();
  const location = useLocation();
  const { data: review, isPending, isError, error, refetch } = useReview(id);

  if (isPending) return <PageLoader />;
  if (isError) return <ReviewLoadError error={error} onRetry={() => void refetch()} />;

  // key: a different review starts with fresh filter state.
  return <ReviewResultView key={review.id} review={review} fromHistory={isFromHistory(location.state)} />;
}
