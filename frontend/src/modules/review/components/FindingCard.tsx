import { RuleBadge } from '@/components/domain/RuleBadge';
import { SeverityDot } from '@/components/domain/SeverityDot';
import { cn } from '@/lib/cn';
import { SEVERITIES } from '@/config/review';
import type { IndexedFinding } from '../utils/findings';

interface FindingCardProps {
  finding: IndexedFinding;
  open: boolean;
  onToggle: () => void;
  showRule: boolean;
}

export function FindingCard({ finding, open, onToggle, showRule }: FindingCardProps) {
  const severity = SEVERITIES[finding.severity];

  return (
    <div className={cn('rounded-lg', open && 'bg-card')}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={cn(
          'flex w-full flex-col gap-2 rounded-lg p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          !open && 'hover:bg-card/60',
        )}
      >
        <span className="flex w-full items-center gap-2.5 font-mono text-[11px] text-muted-foreground">
          <SeverityDot severity={finding.severity} />
          <span className={severity.textClass}>{severity.label.toUpperCase()}</span>
          <span>{finding.category}</span>
          {finding.line > 0 && <span>L{finding.line}</span>}
          {showRule && finding.ruleId > 0 && <RuleBadge ruleId={finding.ruleId} className="ml-auto" />}
        </span>
        <span className="text-sm font-semibold text-foreground">{finding.title}</span>
      </button>

      {open && (
        <div className="flex flex-col gap-2 px-3 pb-3.5">
          <p className="text-[13px] leading-5 text-secondary-foreground">{finding.explanation}</p>
          {finding.suggestion && (
            <pre className="whitespace-pre-wrap rounded-md bg-background px-2.5 py-2 font-mono text-xs leading-[18px] text-success">
              {finding.suggestion}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
