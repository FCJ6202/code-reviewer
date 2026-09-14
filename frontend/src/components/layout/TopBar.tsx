import { Link, useLocation } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { BrandMark } from './BrandMark';
import { useAuth } from '@/hooks/useAuth';
import { useMe } from '@/hooks/useCurrentUser';
import { cn } from '@/lib/cn';
import { NAV_ITEMS, ROUTES, isFromHistory, resolveActiveNav } from '@/config/navigation';

export function TopBar() {
  const { pathname, state } = useLocation();
  const { user } = useAuth();
  const { data: me } = useMe();

  const activePath = resolveActiveNav(pathname, isFromHistory(state));
  const displayName = user?.displayName || user?.email || '';
  // Admin items stay hidden until /users/me confirms the role.
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || me?.isAdmin === true);

  return (
    <header className="flex h-[52px] shrink-0 items-center justify-between gap-4 border-b border-border bg-surface px-5">
      <Link to={ROUTES.newReview} aria-label="Code Reviewer home">
        <BrandMark />
      </Link>
      <nav aria-label="Main" className="flex items-center gap-1 text-[13px]">
        {items.map((item) => {
          const active = item.path === activePath;
          return (
            <Link
              key={item.path}
              to={item.path}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex h-9 items-center rounded-md px-3 transition-colors',
                active ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {item.label}
            </Link>
          );
        })}
        <Link
          to={ROUTES.profile}
          aria-label="Your profile"
          className="ml-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Avatar name={displayName} photoUrl={user?.photoURL} />
        </Link>
      </nav>
    </header>
  );
}
