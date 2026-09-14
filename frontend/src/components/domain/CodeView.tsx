import { useEffect, useMemo, useRef } from 'react';
import { cn } from '@/lib/cn';
import { splitLines } from '@/lib/code';
import { SEVERITIES } from '@/config/review';
import type { Severity } from '@/types';

interface CodeViewProps {
  code: string;
  /** Line number → the most severe finding on that line. */
  marks?: ReadonlyMap<number, Severity>;
  selectedLine?: number | null;
  className?: string;
}

/** Read-only code with line numbers, a severity gutter, and a highlighted selected line. */
export function CodeView({ code, marks, selectedLine = null, className }: CodeViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lines = useMemo(() => splitLines(code), [code]);

  useEffect(() => {
    if (selectedLine === null) return;
    const row = containerRef.current?.querySelector(`[data-line="${selectedLine}"]`);
    row?.scrollIntoView?.({ block: 'nearest' });
  }, [selectedLine]);

  return (
    <div ref={containerRef} className={cn('overflow-auto py-4 font-mono text-[13px] leading-[26px]', className)}>
      <div className="min-w-max">
        {lines.map((text, index) => {
          const lineNumber = index + 1;
          const severity = marks?.get(lineNumber);
          const config = severity ? SEVERITIES[severity] : null;
          const selected = lineNumber === selectedLine;
          return (
            <div
              key={lineNumber}
              data-line={lineNumber}
              className={cn(
                'grid grid-cols-[4px_44px_1fr]',
                config && (selected ? config.lineSelectedClass : config.lineClass),
              )}
            >
              <span className={config?.dotClass} />
              <span className="select-none pr-4 text-right text-subtle-foreground">{lineNumber}</span>
              <span className="whitespace-pre pr-6">{text || ' '}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
