import type { Response } from "express";
import type { ApiSuccessResponse } from "@mogoj/shared";

export function sendSuccess<T>(
  res: Response,
  statusCode: number,
  message: string,
  data: T,
  meta?: ApiSuccessResponse<T>["meta"],
): Response {
  const body: ApiSuccessResponse<T> = { success: true, message, data, ...(meta && { meta }) };
  return res.status(statusCode).json(body);
}
