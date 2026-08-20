import { z } from "zod";
import { TaskStatus, Priority } from "../constants/enums";

const tiptapDocSchema = z.object({
  type: z.literal("doc"),
  content: z.array(z.unknown()).optional(),
}).passthrough();

export const createTaskSchema = z
  .object({
    projectId: z.string().cuid().optional(),
    areaId: z.string().cuid().optional(),
    parentTaskId: z.string().cuid().optional(),
    title: z.string().min(1).max(300),
    description: tiptapDocSchema.optional(),
    status: z
      .enum([TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.IN_REVIEW, TaskStatus.DONE])
      .default(TaskStatus.TODO),
    priority: z
      .enum([Priority.LOW, Priority.MEDIUM, Priority.HIGH, Priority.CRITICAL])
      .default(Priority.MEDIUM),
    dueDate: z.coerce.date().optional(),
    startDate: z.coerce.date().optional(),
    tags: z.array(z.string().min(1).max(50)).max(20).default([]),
    order: z.number().optional(),
  })
  .refine((data) => data.projectId ?? data.areaId, {
    message: "Task must belong to either a project or an area",
    path: ["projectId"],
  });
export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z.object({
  projectId: z.string().cuid().optional().nullable(),
  areaId: z.string().cuid().optional().nullable(),
  title: z.string().min(1).max(300).optional(),
  description: tiptapDocSchema.optional().nullable(),
  status: z
    .enum([TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.IN_REVIEW, TaskStatus.DONE])
    .optional(),
  priority: z
    .enum([Priority.LOW, Priority.MEDIUM, Priority.HIGH, Priority.CRITICAL])
    .optional(),
  dueDate: z.coerce.date().optional().nullable(),
  startDate: z.coerce.date().optional().nullable(),
  tags: z.array(z.string().min(1).max(50)).max(20).optional(),
  order: z.number().optional(),
});
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export const createSubtaskSchema = createTaskSchema.innerType().omit({ parentTaskId: true });
export type CreateSubtaskInput = z.infer<typeof createSubtaskSchema>;

export const reorderTasksSchema = z.object({
  status: z.enum([TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.IN_REVIEW, TaskStatus.DONE]),
  order: z.number(),
});
export type ReorderTaskInput = z.infer<typeof reorderTasksSchema>;

export const taskQuerySchema = z.object({
  projectId: z.string().cuid().optional(),
  areaId: z.string().cuid().optional(),
  status: z
    .enum([TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.IN_REVIEW, TaskStatus.DONE])
    .optional(),
  priority: z
    .enum([Priority.LOW, Priority.MEDIUM, Priority.HIGH, Priority.CRITICAL])
    .optional(),
  dueBefore: z.coerce.date().optional(),
  dueAfter: z.coerce.date().optional(),
  tag: z.string().optional(),
  q: z.string().optional(),
  // Defaults to true so the "All Tasks" list shows top-level tasks with
  // subtasks nested underneath, instead of a flat mix of both.
  topLevelOnly: z.coerce.boolean().default(true),
});
export type TaskQuery = z.infer<typeof taskQuerySchema>;
