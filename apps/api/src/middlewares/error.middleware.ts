import type { NextFunction, Request, Response } from "express";
import type { ApiErrorResponse } from "@mogoj/shared";
import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";

export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    const body: ApiErrorResponse = {
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    };
    res.status(err.statusCode).json(body);
    return;
  }

  console.error(err);
  const body: ApiErrorResponse = {
    success: false,
    message:
      env.NODE_ENV === "production"
        ? "Internal server error"
        : err instanceof Error
          ? err.message
          : "Internal server error",
  };
  res.status(500).json(body);
}
