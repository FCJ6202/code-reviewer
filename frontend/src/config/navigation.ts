export const ROUTES = {
  login: '/login',
  newReview: '/',
  reviewPattern: '/reviews/:id',
  review: (id: string) => `/reviews/${encodeURIComponent(id)}`,
  history: '/history',
  profile: '/me',
} as const;

export interface NavItem {
  label: string;
  path: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'New review', path: ROUTES.newReview },
  { label: 'History', path: ROUTES.history },
  { label: 'Profile', path: ROUTES.profile },
];

/** Router state passed when opening a review from the History page. */
export interface ReviewLocationState {
  from: 'history';
}

export function isFromHistory(state: unknown): boolean {
  return typeof state === 'object' && state !== null && 'from' in state && state.from === 'history';
}

/** Router state set by ProtectedRoute so sign-in can return to the original page. */
export interface LoginLocationState {
  from: string;
}

export function loginRedirectTarget(state: unknown): string {
  if (typeof state === 'object' && state !== null && 'from' in state && typeof state.from === 'string') {
    return state.from === ROUTES.login ? ROUTES.newReview : state.from;
  }
  return ROUTES.newReview;
}

/** Which top-nav item is highlighted. A review page belongs to History when opened from there. */
export function resolveActiveNav(pathname: string, fromHistory: boolean): string | null {
  if (pathname.startsWith('/reviews/')) {
    return fromHistory ? ROUTES.history : ROUTES.newReview;
  }
  return NAV_ITEMS.find((item) => item.path === pathname)?.path ?? null;
}
