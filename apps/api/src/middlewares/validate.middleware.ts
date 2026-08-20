import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { ApiError } from "../utils/ApiError.js";

interface ValidationTargets {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

function flatten(errors: Record<string, string[] | undefined>): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(errors)) {
    if (value) out[key] = value;
  }
  return out;
}

// Factory: validate({ body: createTaskSchema }) — parses and replaces
// req.body/query/params with the parsed (and coerced/defaulted) value.
export function validate(targets: ValidationTargets) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (targets.body) {
      const result = targets.body.safeParse(req.body);
      if (!result.success) {
        next(ApiError.badRequest("Validation failed", flatten(result.error.flatten().fieldErrors)));
        return;
      }
      req.body = result.data;
    }

    if (targets.query) {
      const result = targets.query.safeParse(req.query);
      if (!result.success) {
        next(ApiError.badRequest("Validation failed", flatten(result.error.flatten().fieldErrors)));
        return;
      }
      Object.assign(req.query, result.data);
    }

    if (targets.params) {
      const result = targets.params.safeParse(req.params);
      if (!result.success) {
        next(ApiError.badRequest("Validation failed", flatten(result.error.flatten().fieldErrors)));
        return;
      }
      req.params = result.data as typeof req.params;
    }

    next();
  };
}
