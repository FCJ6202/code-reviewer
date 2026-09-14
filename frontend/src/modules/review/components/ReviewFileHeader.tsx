import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { buttonVariants } from '@/components/ui/buttonVariants';
import { PanelHeader } from '@/components/ui/PanelHeader';
import { countLines } from '@/lib/code';
import { displayLanguage } from '@/lib/language';
import { ROUTES } from '@/config/navigation';
import type { Review } from '@/types';

interface ReviewFileHeaderProps {
  review: Review;
  fromHistory: boolean;
}

export function ReviewFileHeader({ review, fromHistory }: ReviewFileHeaderProps) {
  return (
    <PanelHeader className="pr-3 font-mono text-xs text-muted-foreground">
      <div className="flex min-w-0 items-center gap-3">
        {fromHistory && (
          <>
            <Link to={ROUTES.history} className="flex h-8 items-center gap-1.5 text-secondary-foreground hover:text-foreground">
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
              History
            </Link>
            <span className="text-border-strong">/</span>
          </>
        )}
        <h1 className="truncate text-foreground">{review.filename || 'untitled'}</h1>
        <span>{displayLanguage(review.language)}</span>
        {review.code && <span className="hidden sm:inline">{countLines(review.code)} lines</span>}
      </div>
      {!fromHistory && (
        <Link to={ROUTES.newReview} className={buttonVariants({ variant: 'secondary', size: 'sm', className: 'font-sans' })}>
          Review another file
        </Link>
      )}
    </PanelHeader>
  );
}
