import { z } from "zod";
import { ResourceType } from "../constants/enums";

const tiptapDocSchema = z.object({
  type: z.literal("doc"),
  content: z.array(z.unknown()).optional(),
}).passthrough();

export const createResourceSchema = z
  .object({
    projectId: z.string().cuid().optional(),
    areaIds: z.array(z.string().cuid()).max(20).default([]),
    title: z.string().min(1).max(300),
    type: z.enum([ResourceType.NOTE, ResourceType.PDF, ResourceType.LINK, ResourceType.IMAGE]),
    content: tiptapDocSchema.optional(),
    url: z.string().url().optional(),
    tags: z.array(z.string().min(1).max(50)).max(20).default([]),
  })
  .refine((data) => data.projectId ?? data.areaIds.length > 0, {
    message: "Resource must belong to either a project or at least one area",
    path: ["projectId"],
  })
  .refine(
    (data) => data.type === ResourceType.NOTE || Boolean(data.url),
    { message: "url is required for pdf/link/image resources", path: ["url"] },
  );
export type CreateResourceInput = z.infer<typeof createResourceSchema>;

export const updateResourceSchema = z.object({
  projectId: z.string().cuid().optional().nullable(),
  areaIds: z.array(z.string().cuid()).max(20).optional(),
  title: z.string().min(1).max(300).optional(),
  content: tiptapDocSchema.optional().nullable(),
  url: z.string().url().optional().nullable(),
  tags: z.array(z.string().min(1).max(50)).max(20).optional(),
});
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;

export const resourceQuerySchema = z.object({
  projectId: z.string().cuid().optional(),
  areaId: z.string().cuid().optional(),
  type: z
    .enum([ResourceType.NOTE, ResourceType.PDF, ResourceType.LINK, ResourceType.IMAGE])
    .optional(),
  tag: z.string().optional(),
  q: z.string().optional(),
});
export type ResourceQuery = z.infer<typeof resourceQuerySchema>;

export const presignUploadSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.enum([
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif",
  ]),
  sizeBytes: z.number().int().positive().max(25 * 1024 * 1024), // 25MB cap
});
export type PresignUploadInput = z.infer<typeof presignUploadSchema>;
