import { z } from "zod";

const tiptapDocSchema = z.object({
  type: z.literal("doc"),
  content: z.array(z.unknown()).optional(),
}).passthrough();

export const createNoteSchema = z
  .object({
    projectId: z.string().cuid().optional(),
    areaId: z.string().cuid().optional(),
    resourceId: z.string().cuid().optional(),
    title: z.string().min(1).max(300),
    content: tiptapDocSchema.optional(),
  })
  .refine((data) => Boolean(data.projectId ?? data.areaId ?? data.resourceId), {
    message: "Note must belong to a project, area, or resource",
    path: ["projectId"],
  });
export type CreateNoteInput = z.infer<typeof createNoteSchema>;

export const updateNoteSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  content: tiptapDocSchema.optional().nullable(),
  resourceId: z.string().cuid().optional().nullable(),
});
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

export const noteQuerySchema = z.object({
  projectId: z.string().cuid().optional(),
  areaId: z.string().cuid().optional(),
  resourceId: z.string().cuid().optional(),
});
export type NoteQuery = z.infer<typeof noteQuerySchema>;
