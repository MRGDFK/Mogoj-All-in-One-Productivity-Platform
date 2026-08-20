import type { CookieOptions } from "express";
import { env } from "../config/env.js";

const isProd = env.NODE_ENV === "production";

// Cross-origin (Vercel <-> Railway) cookies require SameSite=None + Secure in
// production. In local dev, frontend/backend run on different ports of
// localhost, which browsers treat as cross-site too, but `Lax` + no Secure
// works fine over plain http://localhost.
export const accessTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  path: "/",
  maxAge: 15 * 60 * 1000, // 15 minutes
};

export const refreshTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  path: "/api/v1/auth",
  maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
};

// Deliberately NOT httpOnly — the frontend must read this value to echo it
// back as the X-CSRF-Token header on mutating requests (double-submit).
export const csrfTokenCookieOptions: CookieOptions = {
  httpOnly: false,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  path: "/",
  maxAge: 15 * 60 * 1000,
};

export const ACCESS_TOKEN_COOKIE = "mogoj_access_token";
export const REFRESH_TOKEN_COOKIE = "mogoj_refresh_token";
export const CSRF_TOKEN_COOKIE = "mogoj_csrf_token";
