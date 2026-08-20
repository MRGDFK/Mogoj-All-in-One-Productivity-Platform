import { z } from "zod";

export const idParamSchema = z.object({
  id: z.string().cuid(),
});
export type IdParam = z.infer<typeof idParamSchema>;

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export const sortOrderSchema = z.enum(["asc", "desc"]).default("asc");

export const reorderSchema = z.object({
  id: z.string().cuid(),
  order: z.number(),
});
export type ReorderInput = z.infer<typeof reorderSchema>;

export const searchQuerySchema = z.object({
  q: z.string().min(1).max(200),
});
export type SearchQuery = z.infer<typeof searchQuerySchema>;
