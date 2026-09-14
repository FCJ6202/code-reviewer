import { http, HttpResponse } from 'msw';
import { sampleReview, sampleRules, sampleSummaries, sampleUser } from '../fixtures';

// Default happy-path API. Individual tests override with server.use(...).
export const handlers = [
  // Like the real API, the POST response has no `code` field.
  http.post('*/api/reviews', () => HttpResponse.json(sampleReview)),
  http.get('*/api/reviews', () => HttpResponse.json({ reviews: sampleSummaries })),
  http.get('*/api/reviews/:id', () => HttpResponse.json({ ...sampleReview, code: 'print(1)\n' })),
  http.get('*/api/users/me', () => HttpResponse.json(sampleUser)),
  http.get('*/api/rules', () => HttpResponse.json({ rules: sampleRules })),
  http.post('*/api/rules/ingest', () =>
    HttpResponse.json({
      rowsRead: 21,
      rowsUpserted: 1,
      rowsFailed: 0,
      sourceFile: 'gs://test-bucket/rules/20260914T120000_ab12cd34-rules.csv',
    }),
  ),
];
