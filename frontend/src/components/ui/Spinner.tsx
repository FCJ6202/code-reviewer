import { cn } from '@/lib/cn';

interface SpinnerProps {
  className?: string;
  /** When set, the spinner is announced to screen readers; otherwise it is decorative. */
  label?: string;
}

export function Spinner({ className, label }: SpinnerProps) {
  return (
    <span
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn(
        'inline-block shrink-0 animate-spin rounded-full border-2 border-border-strong border-t-primary',
        className,
      )}
    />
  );
}
