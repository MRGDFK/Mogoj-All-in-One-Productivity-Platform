import type { CookieOptions } from "express";
import { env } from "../config/env.js";

const isProd = env.NODE_ENV === "production";

// The web app proxies /api/v1 to the API (next.config rewrite), so cookies are
// first-party to the web origin: SameSite=Lax, Secure in production, and no
// Domain attribute (host-only).
export const accessTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax",
  path: "/",
  maxAge: 15 * 60 * 1000, // 15 minutes
};

export const refreshTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax",
  path: "/api/v1/auth",
  maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
};

// Deliberately NOT httpOnly — the frontend must read this value to echo it
// back as the X-CSRF-Token header on mutating requests (double-submit).
export const csrfTokenCookieOptions: CookieOptions = {
  httpOnly: false,
  secure: isProd,
  sameSite: "lax",
  path: "/",
  maxAge: 15 * 60 * 1000,
};

export const ACCESS_TOKEN_COOKIE = "mogoj_access_token";
export const REFRESH_TOKEN_COOKIE = "mogoj_refresh_token";
export const CSRF_TOKEN_COOKIE = "mogoj_csrf_token";
