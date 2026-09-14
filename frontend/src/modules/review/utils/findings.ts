import { CATEGORIES, SEVERITIES, SEVERITY_ORDER } from '@/config/review';
import type { ChipOption } from '@/components/ui/ChipGroup';
import type { Category, Finding, Severity } from '@/types';

export type FindingFilterValue = Category | 'all';

/** A finding plus its position in the API response, used as a stable key. */
export interface IndexedFinding extends Finding {
  index: number;
}

/** Most severe first, then by line. */
export function sortFindings(findings: Finding[]): IndexedFinding[] {
  return findings
    .map((finding, index) => ({ ...finding, index }))
    .sort((a, b) => SEVERITIES[a.severity].rank - SEVERITIES[b.severity].rank || a.line - b.line);
}

/** "All" plus one chip per category that has findings, in CATEGORIES order. */
export function buildFilterOptions(findings: Finding[]): ChipOption<FindingFilterValue>[] {
  const perCategory = CATEGORIES.map((category) => ({
    value: category.key,
    label: category.label,
    count: findings.filter((finding) => finding.category === category.key).length,
  })).filter((option) => option.count > 0);

  return [{ value: 'all', label: 'All', count: findings.length }, ...perCategory];
}

/** Line number → the most severe finding on it. Findings without a line (0) are skipped. */
export function buildLineMarks(findings: Finding[]): Map<number, Severity> {
  const marks = new Map<number, Severity>();
  for (const finding of findings) {
    if (finding.line <= 0) continue;
    const current = marks.get(finding.line);
    if (!current || SEVERITIES[finding.severity].rank < SEVERITIES[current].rank) {
      marks.set(finding.line, finding.severity);
    }
  }
  return marks;
}

/** "2 high · 1 medium · 1 low" */
export function formatSeverityCounts(findings: Finding[]): string {
  const parts = SEVERITY_ORDER.map((severity) => ({
    severity,
    count: findings.filter((finding) => finding.severity === severity).length,
  }))
    .filter((part) => part.count > 0)
    .map((part) => `${part.count} ${part.severity}`);

  return parts.length > 0 ? parts.join(' · ') : 'No findings';
}
