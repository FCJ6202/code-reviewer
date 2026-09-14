export const queryKeys = {
  reviews: {
    lists: ['reviews', 'list'] as const,
    list: (limit: number) => ['reviews', 'list', limit] as const,
    detail: (id: string) => ['reviews', 'detail', id] as const,
  },
  rules: {
    list: ['rules', 'list'] as const,
  },
  users: {
    me: ['users', 'me'] as const,
  },
};
