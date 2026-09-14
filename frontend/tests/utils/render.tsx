import type { ReactElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { User as FirebaseUser } from 'firebase/auth';
import { AuthContext, type AuthContextValue } from '@/context/auth-context';

interface RenderPageOptions {
  /** Route pattern the page is mounted at, e.g. "/reviews/:id". */
  path: string;
  /** URL to start at. Defaults to `path`. */
  url?: string;
  /** Extra routes, used to assert navigation. */
  extraRoutes?: { path: string; element: ReactElement }[];
  auth?: Partial<AuthContextValue>;
}

const testUser = {
  uid: 'u1',
  email: 'dev@example.com',
  displayName: 'Dev User',
  photoURL: null,
} as FirebaseUser;

/** Renders a page with a fresh query client, a signed-in user, and an in-memory router. */
export function renderPage(page: ReactElement, { path, url = path, extraRoutes = [], auth = {} }: RenderPageOptions) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const authValue: AuthContextValue = {
    user: testUser,
    loading: false,
    signInWithGoogle: () => Promise.resolve(),
    signOut: () => Promise.resolve(),
    ...auth,
  };

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={authValue}>
        <MemoryRouter initialEntries={[url]}>
          <Routes>
            <Route path={path} element={page} />
            {extraRoutes.map((route) => (
              <Route key={route.path} path={route.path} element={route.element} />
            ))}
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
}
