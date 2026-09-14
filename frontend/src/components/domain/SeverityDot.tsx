import { cn } from '@/lib/cn';
import { SEVERITIES } from '@/config/review';
import type { Severity } from '@/types';

export function SeverityDot({ severity }: { severity: Severity }) {
  return <span aria-hidden className={cn('inline-block h-2 w-2 shrink-0 rounded-full', SEVERITIES[severity].dotClass)} />;
}
