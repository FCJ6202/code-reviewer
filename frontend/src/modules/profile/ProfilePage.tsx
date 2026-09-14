import { Link } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { buttonVariants } from '@/components/ui/buttonVariants';
import { Skeleton } from '@/components/ui/Skeleton';
import { ProfileStats } from './components/ProfileStats';
import { useAuth } from '@/hooks/useAuth';
import { useMe } from '@/hooks/useCurrentUser';
import { ROUTES } from '@/config/navigation';

export default function ProfilePage() {
  const { user: firebaseUser, signOut } = useAuth();
  const { data: me, isPending, isError, error } = useMe();

  const name = me?.displayName || firebaseUser?.displayName || me?.email || firebaseUser?.email || 'You';
  const email = me?.email || firebaseUser?.email || '';

  return (
    <div className="flex-1 lg:min-h-0 lg:overflow-y-auto">
      <div className="mx-auto flex w-full max-w-[640px] flex-col gap-8 px-6 py-10 sm:pt-16">
        <div className="flex items-center gap-5">
          <Avatar name={name} photoUrl={firebaseUser?.photoURL} size="lg" />
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="truncate text-2xl font-semibold">{name}</h1>
            <span className="truncate font-mono text-[13px] text-muted-foreground">{email} · Google account</span>
          </div>
        </div>

        {isPending && <Skeleton className="h-[98px]" />}
        {isError && (
          <p role="alert" className="text-sm text-destructive-soft">
            Could not load your stats: {error.message}
          </p>
        )}
        {me && <ProfileStats user={me} />}

        <div className="flex flex-wrap gap-3">
          <Link to={ROUTES.history} className={buttonVariants({ variant: 'secondary' })}>
            See score history
          </Link>
          <Button variant="danger" onClick={() => void signOut()}>
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
