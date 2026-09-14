import { useMemo } from 'react';
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '@/components/ui/Card';
import { TrendTooltip } from './TrendTooltip';
import { useChartColors } from '@/hooks/useChartColors';
import { averageScore, toTrendPoints } from '../utils/history';
import type { ReviewSummary } from '@/types';

const AXIS_FONT = { fontSize: 11, fontFamily: '"JetBrains Mono", Menlo, monospace' };
const SCORE_TICKS = [2, 4, 6, 8, 10];

/** One series (your score over time): a single hue, no legend, hover tooltip. The table below is the data view. */
export function ScoreTrendChart({ reviews }: { reviews: ReviewSummary[] }) {
  const colors = useChartColors();
  const points = useMemo(() => toTrendPoints(reviews), [reviews]);
  const average = useMemo(() => averageScore(reviews), [reviews]);

  return (
    <Card className="p-4">
      <h2 className="sr-only">Score trend, oldest to newest</h2>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 12, right: 16, bottom: 0, left: -16 }}>
            <CartesianGrid stroke={colors.grid} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ ...AXIS_FONT, fill: colors.axis }}
              tickLine={false}
              axisLine={{ stroke: colors.grid }}
              minTickGap={24}
            />
            <YAxis
              domain={[0, 10]}
              ticks={SCORE_TICKS}
              tick={{ ...AXIS_FONT, fill: colors.axis }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <ReferenceLine
              y={average}
              stroke={colors.axis}
              strokeDasharray="4 4"
              label={{ value: `avg ${average.toFixed(1)}`, position: 'insideTopRight', fill: colors.label, ...AXIS_FONT }}
            />
            <Tooltip
              cursor={{ stroke: colors.cursor }}
              content={(props) => <TrendTooltip active={props.active} payload={props.payload} />}
            />
            <Line
              type="linear"
              dataKey="score"
              stroke={colors.line}
              strokeWidth={2}
              dot={{ r: 4, fill: colors.line, stroke: colors.surface, strokeWidth: 2 }}
              activeDot={{ r: 5, fill: colors.line, stroke: colors.surface, strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
