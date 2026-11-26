import { rateLimit } from "express-rate-limit";

// The default in-memory store is per instance; on serverless each instance
// counts separately, so these limits are best-effort, not a hard guarantee.
const base = { standardHeaders: true, legacyHeaders: false } as const;
const message = { success: false, message: "Too many requests, please try again later", data: null };

export const globalLimiter = rateLimit({ ...base, windowMs: 15 * 60 * 1000, limit: 600, message });
export const authLimiter = rateLimit({ ...base, windowMs: 15 * 60 * 1000, limit: 10, message });
