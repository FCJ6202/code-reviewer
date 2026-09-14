import axios from 'axios';
import { env } from '@/config/env';
import { auth } from '@/lib/firebase';
import { ApiError, type ApiErrorBody } from '@/types';

// Cloud Run allows 120 s and a review can take most of that.
const REQUEST_TIMEOUT_MS = 120_000;

export const api = axios.create({
  baseURL: `${env.apiUrl}/api`,
  timeout: REQUEST_TIMEOUT_MS,
});

// Firebase refreshes the ID token automatically when it is close to expiry,
// so asking for it on every request always sends a valid one.
api.interceptors.request.use(async (config) => {
  const token = await auth.currentUser?.getIdToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

let handleUnauthorized: () => void = () => {};

/** AuthProvider registers what to do when the API rejects the session. */
export function setUnauthorizedHandler(handler: () => void): void {
  handleUnauthorized = handler;
}

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = toApiError(error);
    if (apiError.status === 401) {
      handleUnauthorized();
    }
    return Promise.reject(apiError);
  },
);

function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const status = error.response?.status ?? 0;
    if (status === 0) {
      const timedOut = error.code === 'ECONNABORTED';
      return new ApiError(0, timedOut ? 'The server took too long to answer.' : 'Could not reach the server.');
    }
    return new ApiError(status, error.response?.data?.error ?? error.message);
  }
  return new ApiError(0, error instanceof Error ? error.message : 'Unexpected error');
}
