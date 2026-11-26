import type { Request, Response } from "express";
import type { RegisterInput, LoginInput, UpdateProfileInput } from "@mogoj/shared";
import * as authService from "./auth.service.js";
import { sendSuccess } from "../../utils/ApiResponse.js";
import { env } from "../../config/env.js";
import { ApiError } from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  CSRF_TOKEN_COOKIE,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  csrfTokenCookieOptions,
} from "../../utils/cookieOptions.js";
import type { IssuedTokens } from "./auth.service.js";

function setAuthCookies(res: Response, tokens: IssuedTokens): void {
  res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, accessTokenCookieOptions);
  res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, refreshTokenCookieOptions);
  res.cookie(CSRF_TOKEN_COOKIE, tokens.csrfToken, csrfTokenCookieOptions);
}

function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_TOKEN_COOKIE, { path: accessTokenCookieOptions.path });
  res.clearCookie(REFRESH_TOKEN_COOKIE, { path: refreshTokenCookieOptions.path });
  res.clearCookie(CSRF_TOKEN_COOKIE, { path: csrfTokenCookieOptions.path });
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  if (!env.ALLOW_REGISTRATION) throw ApiError.forbidden("Registration is disabled");
  const input = req.body as RegisterInput;
  const { user, tokens } = await authService.registerUser(input);
  setAuthCookies(res, tokens);
  sendSuccess(res, 201, "Account created", user);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as LoginInput;
  const { user, tokens } = await authService.loginUser(input);
  setAuthCookies(res, tokens);
  sendSuccess(res, 200, "Logged in", user);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined;
  if (refreshToken) {
    await authService.revokeRefreshToken(refreshToken);
  }
  clearAuthCookies(res);
  sendSuccess(res, 200, "Logged out", null);
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined;
  if (!refreshToken) {
    throw ApiError.unauthorized("Missing refresh token");
  }
  const { userId: _userId, ...tokens } = await authService.refreshTokens(refreshToken);
  setAuthCookies(res, tokens);
  sendSuccess(res, 200, "Session refreshed", null);
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getUserById(req.user!.id);
  sendSuccess(res, 200, "Current user", user);
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as UpdateProfileInput;
  const user = await authService.updateUserProfile(req.user!.id, input);
  sendSuccess(res, 200, "Profile updated", user);
});
