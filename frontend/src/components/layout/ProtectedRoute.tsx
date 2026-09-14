import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { PageLoader } from './PageLoader';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES, type LoginLocationState } from '@/config/navigation';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;

  if (!user) {
    const state: LoginLocationState = { from: location.pathname };
    return <Navigate to={ROUTES.login} replace state={state} />;
  }

  return <Outlet />;
}
