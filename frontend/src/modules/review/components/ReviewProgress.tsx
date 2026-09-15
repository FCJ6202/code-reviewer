import { Check } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { useElapsedTime } from '@/hooks/useElapsedTime';
import { cn } from '@/lib/cn';
import { REVIEW_PROGRESS_STEPS } from '@/config/review';

type StepState = 'done' | 'active' | 'pending';

export function ReviewProgress() {
  const elapsed = useElapsedTime();
  const activeIndex = REVIEW_PROGRESS_STEPS.reduce(
    (current, step, index) => (elapsed >= step.startsAtMs ? index : current),
    0,
  );

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col gap-3.5 rounded-lg border border-border bg-surface p-4 text-[13px]"
    >
      {REVIEW_PROGRESS_STEPS.map((step, index) => {
        const state: StepState = index < activeIndex ? 'done' : index === activeIndex ? 'active' : 'pending';
        return (
          <div key={step.label} className={cn('flex items-center gap-2.5', state === 'pending' && 'text-subtle-foreground')}>
            <StepIcon state={state} />
            {step.label}
          </div>
        );
      })}
      <span className="font-mono text-[11px] text-subtle-foreground">can take up to a minute</span>
    </div>
  );
}

function StepIcon({ state }: { state: StepState }) {
  if (state === 'done') return <Check className="h-4 w-4 text-success" aria-hidden />;
  if (state === 'active') return <Spinner className="m-0.5 h-3 w-3" />;
  return <span aria-hidden className="m-0.5 h-3 w-3 rounded-full border-2 border-input" />;
}
