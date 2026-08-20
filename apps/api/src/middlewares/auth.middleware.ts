import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { verifyAccessToken } from "../utils/generateToken.js";
import { ACCESS_TOKEN_COOKIE } from "../utils/cookieOptions.js";

declare module "express-serve-static-core" {
  interface Request {
    user?: { id: string };
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.[ACCESS_TOKEN_COOKIE] as string | undefined;

  if (!token) {
    next(ApiError.unauthorized("Not authenticated"));
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub };
    next();
  } catch {
    next(ApiError.unauthorized("Session expired"));
  }
}
