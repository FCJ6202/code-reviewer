import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminRoute } from '@/components/layout/AdminRoute';
import { AppShell } from '@/components/layout/AppShell';
import { PageLoader } from '@/components/layout/PageLoader';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { ROUTES } from '@/config/navigation';

const LoginPage = lazy(() => import('@/modules/auth/LoginPage'));
const NewReviewPage = lazy(() => import('@/modules/review/NewReviewPage'));
const ReviewResultPage = lazy(() => import('@/modules/review/ReviewResultPage'));
const HistoryPage = lazy(() => import('@/modules/history/HistoryPage'));
const RulesPage = lazy(() => import('@/modules/admin/RulesPage'));
const ProfilePage = lazy(() => import('@/modules/profile/ProfilePage'));

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path={ROUTES.newReview} element={<NewReviewPage />} />
            <Route path={ROUTES.reviewPattern} element={<ReviewResultPage />} />
            <Route path={ROUTES.history} element={<HistoryPage />} />
            <Route path={ROUTES.profile} element={<ProfilePage />} />
            <Route element={<AdminRoute />}>
              <Route path={ROUTES.adminRules} element={<RulesPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to={ROUTES.newReview} replace />} />
      </Routes>
    </Suspense>
  );
}
