import { cn } from '@/lib/cn';

export function RuleBadge({ ruleId, className }: { ruleId: number; className?: string }) {
  return (
    <span
      title="Based on a historical team rule"
      className={cn('rounded border border-border-strong px-1.5 py-0.5 font-mono text-[11px] text-primary', className)}
    >
      rule #{ruleId}
    </span>
  );
}
