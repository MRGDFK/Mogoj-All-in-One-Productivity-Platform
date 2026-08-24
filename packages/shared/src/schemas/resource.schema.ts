import { z } from "zod";
import { ResourceType, ResourceStatus } from "../constants/enums";

const tiptapDocSchema = z.object({
  type: z.literal("doc"),
  content: z.array(z.unknown()).optional(),
}).passthrough();

export const tagSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().min(1),
});
export type TagInput = z.infer<typeof tagSchema>;

export const createResourceSchema = z
  .object({
    projectIds: z.array(z.string().cuid()).max(20).default([]),
    areaIds: z.array(z.string().cuid()).max(20).default([]),
    taskIds: z.array(z.string().cuid()).max(20).default([]),
    title: z.string().min(1).max(300),
    type: z.enum([ResourceType.NOTE, ResourceType.PDF, ResourceType.LINK, ResourceType.IMAGE]),
    content: tiptapDocSchema.optional(),
    url: z.string().url().optional(),
    icon: z.string().max(500).optional(),
    tags: z.array(tagSchema).max(20).default([]),
  })
  .refine((data) => data.projectIds.length > 0 || data.areaIds.length > 0, {
    message: "Resource must belong to at least one project or area",
    path: ["projectIds"],
  })
  .refine(
    (data) => data.type === ResourceType.NOTE || Boolean(data.url),
    { message: "url is required for pdf/link/image resources", path: ["url"] },
  );
export type CreateResourceInput = z.infer<typeof createResourceSchema>;

export const updateResourceSchema = z.object({
  projectIds: z.array(z.string().cuid()).max(20).optional(),
  areaIds: z.array(z.string().cuid()).max(20).optional(),
  taskIds: z.array(z.string().cuid()).max(20).optional(),
  title: z.string().min(1).max(300).optional(),
  status: z.enum([ResourceStatus.OPEN, ResourceStatus.CLOSED]).optional(),
  content: tiptapDocSchema.optional().nullable(),
  url: z.string().url().optional().nullable(),
  icon: z.string().max(500).optional().nullable(),
  tags: z.array(tagSchema).max(20).optional(),
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
