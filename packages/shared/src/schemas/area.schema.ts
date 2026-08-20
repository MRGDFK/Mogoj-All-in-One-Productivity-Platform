import { z } from "zod";
import { AreaStatus } from "../constants/enums";

export const createAreaSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(2000).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#6366f1"),
  icon: z.string().max(50).default("folder"),
  order: z.number().optional(),
});
export type CreateAreaInput = z.infer<typeof createAreaSchema>;

export const updateAreaSchema = createAreaSchema.partial().extend({
  status: z.enum([AreaStatus.ACTIVE, AreaStatus.ARCHIVED]).optional(),
});
export type UpdateAreaInput = z.infer<typeof updateAreaSchema>;

export const areaQuerySchema = z.object({
  status: z.enum([AreaStatus.ACTIVE, AreaStatus.ARCHIVED]).optional(),
});
export type AreaQuery = z.infer<typeof areaQuerySchema>;
