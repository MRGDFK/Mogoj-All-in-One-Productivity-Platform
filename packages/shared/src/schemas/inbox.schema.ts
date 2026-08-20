import { z } from "zod";
import { InboxType } from "../constants/enums";

const tiptapDocSchema = z.object({
  type: z.literal("doc"),
  content: z.array(z.unknown()).optional(),
}).passthrough();

export const createInboxItemSchema = z.object({
  title: z.string().min(1).max(300),
  body: tiptapDocSchema.optional(),
  type: z
    .enum([InboxType.TASK, InboxType.PROJECT, InboxType.NOTE, InboxType.IDEA])
    .default(InboxType.TASK),
  attachments: z.array(z.string().url()).max(10).default([]),
});
export type CreateInboxItemInput = z.infer<typeof createInboxItemSchema>;

export const updateInboxItemSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  body: tiptapDocSchema.optional().nullable(),
  type: z.enum([InboxType.TASK, InboxType.PROJECT, InboxType.NOTE, InboxType.IDEA]).optional(),
  attachments: z.array(z.string().url()).max(10).optional(),
});
export type UpdateInboxItemInput = z.infer<typeof updateInboxItemSchema>;

// Discriminated union: the process payload shape depends on what the item is
// being promoted to. `target` picks the branch; every branch always yields a
// new entity except `discard`, which just marks the item processed.
export const processInboxItemSchema = z.discriminatedUnion("target", [
  z.object({
    target: z.literal("task"),
    areaId: z.string().cuid().optional(),
    projectId: z.string().cuid().optional(),
  }),
  z.object({
    target: z.literal("project"),
    areaId: z.string().cuid(),
  }),
  z.object({
    target: z.literal("resource"),
    areaId: z.string().cuid().optional(),
    projectId: z.string().cuid().optional(),
  }),
  z.object({
    target: z.literal("discard"),
  }),
]);
export type ProcessInboxItemInput = z.infer<typeof processInboxItemSchema>;

export const inboxQuerySchema = z.object({
  status: z.enum(["captured", "processed"]).optional(),
  type: z.enum([InboxType.TASK, InboxType.PROJECT, InboxType.NOTE, InboxType.IDEA]).optional(),
});
export type InboxQuery = z.infer<typeof inboxQuerySchema>;
