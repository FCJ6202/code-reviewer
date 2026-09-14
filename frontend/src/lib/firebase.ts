import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { env } from '@/config/env';

// The only module that initializes Firebase. Everything else imports `auth` from here.
const app = initializeApp(env.firebase);

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
