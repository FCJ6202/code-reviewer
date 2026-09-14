/** Every failed API call rejects with this. status 0 means the server was unreachable. */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** Error body the Go API writes (router/respond.go). */
export interface ApiErrorBody {
  error?: string;
}
