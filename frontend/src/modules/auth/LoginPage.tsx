import { Navigate, useLocation } from 'react-router-dom';
import { BrandMark } from '@/components/layout/BrandMark';
import { PageLoader } from '@/components/layout/PageLoader';
import { Button } from '@/components/ui/Button';
import { LoginPreview } from './components/LoginPreview';
import { useGoogleSignIn } from './hooks/useGoogleSignIn';
import { useAuth } from '@/hooks/useAuth';
import { loginRedirectTarget } from '@/config/navigation';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const { signIn, pending } = useGoogleSignIn();
  const location = useLocation();

  if (loading) return <PageLoader />;
  if (user) return <Navigate to={loginRedirectTarget(location.state)} replace />;

  return (
    <div className="grid min-h-full lg:grid-cols-[600px_minmax(0,1fr)]">
      <section className="flex flex-col justify-between gap-16 px-8 py-10 sm:px-16">
        <BrandMark />

        <div className="flex flex-col gap-5">
          <h1 className="text-4xl font-semibold leading-tight tracking-[-0.01em] sm:text-[44px] sm:leading-[52px]">
            A senior reviewer for your code, any hour.
          </h1>
          <p className="max-w-[460px] text-[17px] leading-[27px] text-secondary-foreground">
            Paste a file and get a 1–10 score with line-by-line findings on security, bugs, performance and style.
          </p>
          <div className="flex flex-col gap-3 pt-3">
            <Button
              size="lg"
              loading={pending}
              onClick={() => void signIn()}
              className="w-full bg-foreground text-background hover:bg-foreground/90 sm:w-[280px]"
            >
              {!pending && (
                <span
                  aria-hidden
                  className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-background text-[11px] font-bold"
                >
                  G
                </span>
              )}
              Continue with Google
            </Button>
            <p className="text-[13px] text-muted-foreground">Your reviews are private to your account.</p>
          </div>
        </div>

        <span className="font-mono text-[11px] text-subtle-foreground">24/7 Intelligent Code Reviewer</span>
      </section>

      <aside className="hidden items-center justify-center border-l border-border bg-surface lg:flex">
        <LoginPreview />
      </aside>
    </div>
  );
}
