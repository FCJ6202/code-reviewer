export type ScoreBand = 'critical' | 'warning' | 'success';

export function scoreBand(score: number): ScoreBand {
  const rounded = Math.round(score);
  if (rounded <= 4) return 'critical';
  if (rounded <= 6) return 'warning';
  return 'success';
}

export const SCORE_BAND_TEXT_CLASS: Record<ScoreBand, string> = {
  critical: 'text-destructive',
  warning: 'text-warning',
  success: 'text-success',
};

/** Mirrors the scoring rubric in the backend system prompt (review/prompt.go). */
export function scoreRubric(score: number): string {
  if (score >= 9) return 'Production quality';
  if (score >= 7) return 'Minor style or efficiency issues';
  if (score >= 5) return 'A real bug or design flaw';
  if (score >= 3) return 'Multiple bugs or a security issue';
  return 'Broken or unsafe';
}
