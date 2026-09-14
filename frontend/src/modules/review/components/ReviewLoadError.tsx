import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { buttonVariants } from '@/components/ui/buttonVariants';
import { EmptyState } from '@/components/ui/EmptyState';
import { ROUTES } from '@/config/navigation';
import { ApiError } from '@/types';

interface ReviewLoadErrorProps {
  error: Error;
  onRetry: () => void;
}

export function ReviewLoadError({ error, onRetry }: ReviewLoadErrorProps) {
  const notFound = error instanceof ApiError && error.status === 404;

  if (notFound) {
    return (
      <EmptyState
        className="flex-1"
        title="Review not found"
        description="It may belong to another account, or the link is wrong."
        action={
          <Link to={ROUTES.history} className={buttonVariants({ variant: 'secondary' })}>
            Back to history
          </Link>
        }
      />
    );
  }

  return (
    <EmptyState
      className="flex-1"
      title="Could not load this review"
      description={error.message}
      action={
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      }
    />
  );
}
