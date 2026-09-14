// Mirrors backend/internal/model/rule.go.
import type { Category } from './review';

export interface Rule {
  id: number;
  type: Category;
  description: string;
}

export interface RuleListResponse {
  rules: Rule[];
}

export interface IngestResult {
  rowsRead: number;
  rowsUpserted: number;
  /** New or changed rules whose embedding failed; they were not saved. */
  rowsFailed: number;
  /** gs:// URI of the archived upload. */
  sourceFile: string;
}
