import { describe, expect, it } from 'vitest';
import {
  buildFilterOptions,
  buildLineMarks,
  formatSeverityCounts,
  sortFindings,
} from '@/modules/review/utils/findings';
import { sampleReview } from '../../fixtures';
import type { Finding } from '@/types';

const findings = sampleReview.findings;

describe('sortFindings', () => {
  it('orders by severity, then line, and keeps the original index', () => {
    const sorted = sortFindings(findings);
    expect(sorted.map((f) => [f.severity, f.line])).toEqual([
      ['high', 2],
      ['high', 3],
      ['medium', 5],
      ['low', 1],
    ]);
    expect(sorted[0].index).toBe(1);
  });
});

describe('buildFilterOptions', () => {
  it('lists All plus only categories that have findings, in config order', () => {
    const options = buildFilterOptions(findings);
    expect(options.map((o) => [o.value, o.count])).toEqual([
      ['all', 4],
      ['security', 1],
      ['bug', 1],
      ['performance', 1],
      ['formatting', 1],
    ]);
  });
});

describe('buildLineMarks', () => {
  it('keeps the most severe finding per line and skips line 0', () => {
    const extra: Finding[] = [
      { ...findings[0], severity: 'low', line: 2 },
      { ...findings[0], severity: 'high', line: 0 },
    ];
    const marks = buildLineMarks([...findings, ...extra]);
    expect(marks.get(2)).toBe('high');
    expect(marks.get(1)).toBe('low');
    expect(marks.has(0)).toBe(false);
  });
});

describe('formatSeverityCounts', () => {
  it('summarizes non-zero severities', () => {
    expect(formatSeverityCounts(findings)).toBe('2 high · 1 medium · 1 low');
    expect(formatSeverityCounts([])).toBe('No findings');
  });
});
