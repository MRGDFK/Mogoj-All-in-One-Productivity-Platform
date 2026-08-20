import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(72),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatar: z.string().url().optional().nullable(),
  preferences: z.record(z.string(), z.unknown()).optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const authUserSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  email: z.string().email(),
  avatar: z.string().nullable(),
  preferences: z.record(z.string(), z.unknown()),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type AuthUser = z.infer<typeof authUserSchema>;
