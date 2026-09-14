import { useCallback, useMemo, useState } from 'react';
import { buildFilterOptions, buildLineMarks, sortFindings, type FindingFilterValue } from '../utils/findings';
import type { Review } from '@/types';

/** Category filter + the open finding, whose line is highlighted in the code. */
export function useFindingFilter(review: Review) {
  const findings = useMemo(() => sortFindings(review.findings), [review.findings]);
  const options = useMemo(() => buildFilterOptions(review.findings), [review.findings]);
  const lineMarks = useMemo(() => buildLineMarks(review.findings), [review.findings]);

  const [filter, setFilter] = useState<FindingFilterValue>('all');
  // The most severe finding starts open.
  const [selectedIndex, setSelectedIndex] = useState<number | null>(() => findings[0]?.index ?? null);

  const visible = useMemo(
    () => (filter === 'all' ? findings : findings.filter((finding) => finding.category === filter)),
    [findings, filter],
  );

  const toggle = useCallback((index: number) => {
    setSelectedIndex((current) => (current === index ? null : index));
  }, []);

  const selectedLine = findings.find((finding) => finding.index === selectedIndex)?.line ?? null;

  return {
    filter,
    setFilter,
    options,
    visible,
    total: findings.length,
    selectedIndex,
    selectedLine,
    toggle,
    lineMarks,
  };
}

export type FindingFilterState = ReturnType<typeof useFindingFilter>;
