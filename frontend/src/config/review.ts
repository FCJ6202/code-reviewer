import type { Category, Severity } from '@/types';

/** Same limit the API enforces (backend config.MaxCodeBytes). */
export const MAX_CODE_BYTES = 200 * 1024;

/** GET /api/reviews accepts at most 100. */
export const HISTORY_LIMIT = 100;

export interface CategoryConfig {
  key: Category;
  label: string;
}

export const CATEGORIES: CategoryConfig[] = [
  { key: 'security', label: 'Security' },
  { key: 'bug', label: 'Bug' },
  { key: 'performance', label: 'Performance' },
  { key: 'architecture', label: 'Architecture' },
  { key: 'formatting', label: 'Formatting' },
];

export interface SeverityConfig {
  label: string;
  /** Lower ranks sort first. */
  rank: number;
  textClass: string;
  dotClass: string;
  lineClass: string;
  lineSelectedClass: string;
}

export const SEVERITIES: Record<Severity, SeverityConfig> = {
  high: {
    label: 'High',
    rank: 0,
    textClass: 'text-severity-high',
    dotClass: 'bg-severity-high',
    lineClass: 'bg-severity-high/[0.08]',
    lineSelectedClass: 'bg-severity-high/20',
  },
  medium: {
    label: 'Medium',
    rank: 1,
    textClass: 'text-severity-medium',
    dotClass: 'bg-severity-medium',
    lineClass: 'bg-severity-medium/[0.08]',
    lineSelectedClass: 'bg-severity-medium/20',
  },
  low: {
    label: 'Low',
    rank: 2,
    textClass: 'text-severity-low',
    dotClass: 'bg-severity-low',
    lineClass: 'bg-severity-low/[0.08]',
    lineSelectedClass: 'bg-severity-low/20',
  },
};

export const SEVERITY_ORDER: Severity[] = ['high', 'medium', 'low'];

/**
 * Shown while POST /api/reviews is in flight. The API reports no progress, so
 * these are time-based estimates of where a typical review is.
 */
export const REVIEW_PROGRESS_STEPS = [
  { label: 'Finding relevant team rules', startsAtMs: 0 },
  { label: 'Gemini is reviewing your code', startsAtMs: 2_000 },
  { label: 'Saving to your history', startsAtMs: 15_000 },
] as const;
