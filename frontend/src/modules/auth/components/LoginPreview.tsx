import { CodeView } from '@/components/domain/CodeView';
import { SeverityDot } from '@/components/domain/SeverityDot';
import type { Severity } from '@/types';

// A static example of what a review looks like. Decorative only.
const PREVIEW_CODE = 'def get_user(db, n):\n    q = "SELECT … \'" + n + "\'"\n    return db.execute(q)\n';
const PREVIEW_MARKS = new Map<number, Severity>([[2, 'high']]);

export function LoginPreview() {
  return (
    <div aria-hidden className="w-[480px] overflow-hidden rounded-[10px] border border-border bg-background">
      <CodeView
        code={PREVIEW_CODE}
        marks={PREVIEW_MARKS}
        selectedLine={2}
        className="border-b border-border py-3 text-[12.5px] leading-6"
      />
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center gap-2.5 font-mono text-[11px] text-muted-foreground">
          <SeverityDot severity="high" />
          <span className="text-severity-high">HIGH</span>
          <span>security</span>
          <span>L2</span>
          <span className="ml-auto text-[22px] font-bold text-destructive">
            3<span className="text-xs font-normal text-subtle-foreground">/10</span>
          </span>
        </div>
        <span className="text-sm font-semibold">SQL Injection Vulnerability</span>
        <span className="text-[13px] leading-5 text-secondary-foreground">
          Pass n as a query parameter instead of adding it to the string.
        </span>
      </div>
    </div>
  );
}
