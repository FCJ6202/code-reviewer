import { http, HttpResponse } from 'msw';
import { sampleReview, sampleSummaries, sampleUser } from '../fixtures';

// Default happy-path API. Individual tests override with server.use(...).
export const handlers = [
  // Like the real API, the POST response has no `code` field.
  http.post('*/api/reviews', () => HttpResponse.json(sampleReview)),
  http.get('*/api/reviews', () => HttpResponse.json({ reviews: sampleSummaries })),
  http.get('*/api/reviews/:id', () => HttpResponse.json({ ...sampleReview, code: 'print(1)\n' })),
  http.get('*/api/users/me', () => HttpResponse.json(sampleUser)),
];
