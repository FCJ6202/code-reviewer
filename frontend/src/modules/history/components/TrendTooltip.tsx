import type { TrendPoint } from '../utils/history';

interface TrendTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: unknown }>;
}

export function TrendTooltip({ active, payload }: TrendTooltipProps) {
  const point = payload?.[0]?.payload as TrendPoint | undefined;
  if (!active || !point) return null;

  return (
    <div className="flex w-[180px] flex-col gap-1 rounded-lg border border-input bg-background px-3 py-2.5">
      <span className="font-mono text-[11px] text-muted-foreground">{point.dateTime}</span>
      <span className="truncate text-[13px] font-semibold text-foreground">{point.filename}</span>
      <span className="font-mono text-[13px] text-foreground">score {point.score}/10</span>
    </div>
  );
}
