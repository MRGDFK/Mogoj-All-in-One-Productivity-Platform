import axios, { AxiosError } from "axios";
import type { ApiErrorResponse } from "@mogoj/shared";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match?.[1];
}

// Echo the double-submit CSRF cookie back as a header on every mutating
// request — see apps/api/src/middlewares/csrf.middleware.ts.
api.interceptors.request.use((config) => {
  const method = config.method?.toUpperCase();
  if (method && !["GET", "HEAD", "OPTIONS"].includes(method)) {
    const csrfToken = readCookie("mogoj_csrf_token");
    if (csrfToken) {
      config.headers.set("X-CSRF-Token", csrfToken);
    }
  }
  return config;
});

let refreshPromise: Promise<unknown> | null = null;

// On a 401 (expired access token), transparently refresh once and retry the
// original request. Concurrent 401s share a single in-flight refresh call.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as (typeof error.config & { _retry?: boolean }) | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/login")
    ) {
      originalRequest._retry = true;
      try {
        refreshPromise ??= api.post("/auth/refresh").finally(() => {
          refreshPromise = null;
        });
        await refreshPromise;
        return api(originalRequest);
      } catch {
        // Refresh failed — fall through and surface the original 401 so the
        // caller (useAuth / AuthProvider) can redirect to /login.
      }
    }

    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data.message ?? error.message;
  }
  return "Something went wrong";
}
