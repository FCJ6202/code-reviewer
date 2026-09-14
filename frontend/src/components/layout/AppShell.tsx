import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { PageLoader } from './PageLoader';
import { TopBar } from './TopBar';

/** Top bar + page. On large screens the page fills the viewport and panes scroll on their own. */
export function AppShell() {
  return (
    <div className="flex min-h-full flex-col lg:h-full">
      <TopBar />
      <main className="flex flex-1 flex-col lg:min-h-0">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
