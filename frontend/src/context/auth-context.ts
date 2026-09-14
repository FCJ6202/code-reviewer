import { createContext } from 'react';
import type { User } from 'firebase/auth';

export interface AuthContextValue {
  /** The signed-in Firebase user, or null. */
  user: User | null;
  /** True until Firebase reports the initial sign-in state. */
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
