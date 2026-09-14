import type { Review, ReviewSummary, User } from '@/types';

export const sampleReview: Review = {
  id: 'rv_20260913T043000_abc123',
  filename: 'app.py',
  language: 'python',
  score: 3,
  summary: 'SQL injection and a query repeated inside a loop.',
  findings: [
    {
      category: 'formatting',
      severity: 'low',
      line: 1,
      title: 'Single-Character Variable Names',
      explanation: 'n and r do not say what they hold.',
      suggestion: 'Rename n to name.',
      ruleId: 1,
    },
    {
      category: 'security',
      severity: 'high',
      line: 2,
      title: 'SQL Injection Vulnerability',
      explanation: 'User input is concatenated into SQL.',
      suggestion: 'Use a parameterized query.',
      ruleId: 3,
    },
    {
      category: 'bug',
      severity: 'medium',
      line: 5,
      title: 'Ineffective Loop and Return Value',
      explanation: 'Only the last result is returned.',
      suggestion: 'return db.execute(q)',
      ruleId: 0,
    },
    {
      category: 'performance',
      severity: 'high',
      line: 3,
      title: 'Repeated Database Query in Loop',
      explanation: 'The same query runs 100 times.',
      suggestion: 'Run it once.',
      ruleId: 0,
    },
  ],
  rulesUsed: [1, 3],
  model: 'gemini-2.5-flash',
  latencyMs: 10958,
  degraded: false,
  createdAt: '2026-09-13T04:30:00Z',
};

export const sampleSummaries: ReviewSummary[] = [
  {
    id: sampleReview.id,
    filename: 'app.py',
    language: 'python',
    score: 3,
    summary: sampleReview.summary,
    createdAt: '2026-09-13T04:30:00Z',
  },
  {
    id: 'rv_20260912T211200_def456',
    filename: 'handlers.go',
    language: 'go',
    score: 6,
    summary: 'Errors from db.Query are ignored in two handlers.',
    createdAt: '2026-09-12T21:12:00Z',
  },
];

export const sampleUser: User = {
  uid: 'u1',
  email: 'dev@example.com',
  displayName: 'Dev User',
  createdAt: '2026-09-01T10:00:00Z',
  lastSeenAt: '2026-09-13T04:30:00Z',
  reviewCount: 2,
  avgScore: 4.5,
};
