import { api } from './api';
import type { IngestResult, Rule, RuleListResponse } from '@/types';

export async function listRules(limit: number): Promise<Rule[]> {
  const { data } = await api.get<RuleListResponse>('/rules', { params: { limit } });
  return data.rules ?? [];
}

/** Admin only. The API validates the CSV and answers 400 with the offending line. */
export async function ingestRules(file: File): Promise<IngestResult> {
  const form = new FormData();
  form.append('file', file);
  // No Content-Type header: the browser adds multipart/form-data with its boundary.
  const { data } = await api.post<IngestResult>('/rules/ingest', form);
  return data;
}
