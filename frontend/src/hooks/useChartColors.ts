import { useMemo } from 'react';

// Chart libraries write colors into SVG attributes, where CSS variables don't
// resolve. Read the theme tokens once and hand the chart real color strings.
function readToken(name: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();
  return value ? `hsl(${value})` : 'currentColor';
}

export function useChartColors() {
  return useMemo(
    () => ({
      line: readToken('primary'),
      grid: readToken('muted'),
      axis: readToken('subtle-foreground'),
      label: readToken('muted-foreground'),
      cursor: readToken('border-strong'),
      surface: readToken('surface'),
    }),
    [],
  );
}
