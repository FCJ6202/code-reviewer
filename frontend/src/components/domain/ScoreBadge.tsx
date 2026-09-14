import { cn } from '@/lib/cn';
import { SCORE_BAND_TEXT_CLASS, scoreBand } from '@/config/score';

interface ScoreBadgeProps {
  score: number;
  /** lg: the result page headline. sm: a table cell. */
  size?: 'sm' | 'lg';
}

export function ScoreBadge({ score, size = 'sm' }: ScoreBadgeProps) {
  const color = SCORE_BAND_TEXT_CLASS[scoreBand(score)];

  if (size === 'lg') {
    return (
      <p className="flex items-baseline gap-1 font-mono">
        <span className={cn('text-7xl font-bold leading-[64px]', color)}>{score}</span>
        <span className="text-xl text-subtle-foreground">/10</span>
      </p>
    );
  }

  return <span className={cn('font-mono text-[15px] font-bold', color)}>{score}</span>;
}
