/** Same limit the API enforces on POST /api/rules/ingest. */
export const MAX_RULES_CSV_BYTES = 1024 * 1024;
export const MAX_RULES_CSV_LABEL = '1 MB';

/** GET /api/rules returns at most 1000. */
export const RULE_LIST_LIMIT = 1000;
