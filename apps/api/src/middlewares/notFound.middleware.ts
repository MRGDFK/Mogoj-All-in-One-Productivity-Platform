import type { Request, Response } from "express";
import type { ApiErrorResponse } from "@mogoj/shared";

export function notFoundMiddleware(req: Request, res: Response) {
  const body: ApiErrorResponse = {
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  };
  res.status(404).json(body);
}
