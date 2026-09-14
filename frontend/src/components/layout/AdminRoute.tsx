import { Navigate, Outlet } from 'react-router-dom';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageLoader } from './PageLoader';
import { useMe } from '@/hooks/useCurrentUser';
import { ROUTES } from '@/config/navigation';

/**
 * Renders nested routes only for admins; everyone else is sent home.
 * This only hides the UI: the API rejects admin calls from non-admins with 403.
 */
export function AdminRoute() {
  const { data: me, isPending, isError, error } = useMe();

  if (isPending) return <PageLoader />;
  if (isError) {
    return <EmptyState className="flex-1" title="Could not check your access" description={error.message} />;
  }
  if (!me.isAdmin) return <Navigate to={ROUTES.newReview} replace />;

  return <Outlet />;
}
