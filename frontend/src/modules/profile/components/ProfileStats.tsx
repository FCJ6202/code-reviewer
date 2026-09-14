import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/format';
import { SCORE_BAND_TEXT_CLASS, scoreBand } from '@/config/score';
import type { User } from '@/types';

interface Stat {
  label: string;
  value: string;
  suffix?: string;
  valueClass: string;
}

function buildStats(user: User): Stat[] {
  const hasReviews = user.reviewCount > 0;
  return [
    { label: 'Reviews', value: String(user.reviewCount), valueClass: 'text-[32px] font-bold' },
    {
      label: 'Average score',
      value: hasReviews ? user.avgScore.toFixed(1) : '–',
      suffix: hasReviews ? '/10' : undefined,
      valueClass: cn(
        'text-[32px] font-bold',
        hasReviews ? SCORE_BAND_TEXT_CLASS[scoreBand(user.avgScore)] : 'text-muted-foreground',
      ),
    },
    { label: 'Member since', value: formatDate(user.createdAt), valueClass: 'text-xl font-medium leading-[38px]' },
  ];
}

export function ProfileStats({ user }: { user: User }) {
  return (
    <dl className="grid grid-cols-1 rounded-[10px] border border-border sm:grid-cols-3">
      {buildStats(user).map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col gap-2 border-b border-border p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"
        >
          <dt className="text-xs text-muted-foreground">{stat.label}</dt>
          <dd className={cn('font-mono', stat.valueClass)}>
            {stat.value}
            {stat.suffix && <span className="text-sm font-normal text-subtle-foreground">{stat.suffix}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
