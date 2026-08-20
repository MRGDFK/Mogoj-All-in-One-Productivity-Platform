import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { CSRF_TOKEN_COOKIE } from "../utils/cookieOptions.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
export const CSRF_HEADER = "x-csrf-token";

// Double-submit cookie check: the CSRF cookie is readable by JS (unlike the
// auth cookies) so the frontend can echo its value back as a header. A
// cross-site attacker can force a cookie-bearing request but cannot read the
// cookie to also set the matching header.
export function csrfMiddleware(req: Request, _res: Response, next: NextFunction): void {
  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  const cookieToken = req.cookies?.[CSRF_TOKEN_COOKIE] as string | undefined;
  const headerToken = req.header(CSRF_HEADER);

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    next(ApiError.forbidden("Invalid or missing CSRF token"));
    return;
  }

  next();
}
