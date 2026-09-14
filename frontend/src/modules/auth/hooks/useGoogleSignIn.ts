import { useCallback, useState } from 'react';
import { FirebaseError } from 'firebase/app';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

// Closing the popup is a choice, not an error.
const DISMISSED_CODES = new Set(['auth/popup-closed-by-user', 'auth/cancelled-popup-request']);

export function useGoogleSignIn() {
  const { signInWithGoogle } = useAuth();
  const [pending, setPending] = useState(false);

  const signIn = useCallback(async () => {
    setPending(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      if (error instanceof FirebaseError && DISMISSED_CODES.has(error.code)) return;
      if (error instanceof FirebaseError && error.code === 'auth/popup-blocked') {
        toast.error('Your browser blocked the sign-in popup. Allow popups for this site and try again.');
        return;
      }
      toast.error('Sign-in failed. Please try again.');
    } finally {
      setPending(false);
    }
  }, [signInWithGoogle]);

  return { signIn, pending };
}
