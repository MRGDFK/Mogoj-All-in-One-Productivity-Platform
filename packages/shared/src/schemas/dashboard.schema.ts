import { z } from "zod";

export const dashboardQuerySchema = z.object({
  recentResourcesLimit: z.coerce.number().int().min(1).max(50).default(5),
  activityLimit: z.coerce.number().int().min(1).max(100).default(20),
});
export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;
