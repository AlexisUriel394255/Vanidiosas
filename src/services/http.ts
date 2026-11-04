import type { ApiErrorBody } from "../types/auth";

// PUBLIC_ prefix: Astro only exposes env variables with it to the browser
const API_URL = import.meta.env.PUBLIC_API_URL as string | undefined;

// If there is no URL configured, services fall back to their mocks
export const isApiConfigured = Boolean(API_URL);

// Custom error that carries the HTTP status and per-field messages
export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string>;

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
    // Lets the browser send and receive the HttpOnly session cookie (needed for login later)
    credentials: "include",
  });

  if (!response.ok) {
    // The body may be empty or not JSON, so we guard against parsing errors
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    throw new ApiError(response.status, body?.message ?? "Unexpected error", body?.fieldErrors);
  }

  // 204 No Content has no body to parse
  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}