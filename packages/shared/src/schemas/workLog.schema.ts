import { z } from "zod";

export const createWorkLogSchema = z.object({
  body: z.string().min(1).max(5000),
});
export type CreateWorkLogInput = z.infer<typeof createWorkLogSchema>;
