import { z } from "zod";
import { ProjectStatus, Priority } from "../constants/enums";

export const createProjectSchema = z.object({
  areaId: z.string().cuid(),
  name: z.string().min(1).max(150),
  description: z.string().max(2000).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#000000"),
  icon: z.string().max(1000).default("Rocket"),
  priority: z
    .enum([Priority.LOW, Priority.MEDIUM, Priority.HIGH, Priority.CRITICAL])
    .default(Priority.MEDIUM),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  coverImage: z.string().url().optional(),
  order: z.number().optional(),
});
export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = createProjectSchema.partial().extend({
  description: z.string().max(2000).optional().nullable(),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
  status: z
    .enum([
      ProjectStatus.ACTIVE,
      ProjectStatus.ON_HOLD,
      ProjectStatus.COMPLETED,
      ProjectStatus.ARCHIVED,
    ])
    .optional(),
});
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const projectQuerySchema = z.object({
  areaId: z.string().cuid().optional(),
  status: z
    .enum([
      ProjectStatus.ACTIVE,
      ProjectStatus.ON_HOLD,
      ProjectStatus.COMPLETED,
      ProjectStatus.ARCHIVED,
    ])
    .optional(),
  priority: z
    .enum([Priority.LOW, Priority.MEDIUM, Priority.HIGH, Priority.CRITICAL])
    .optional(),
});
export type ProjectQuery = z.infer<typeof projectQuerySchema>;
