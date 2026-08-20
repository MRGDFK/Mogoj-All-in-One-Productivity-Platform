import type { DashboardQuery } from "@mogoj/shared";
import { prisma } from "../../config/db.js";
import { getUnprocessedCount } from "../inbox/inbox.service.js";

function endOfToday(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

export async function getHQDashboard(userId: string, query: DashboardQuery) {
  const [todayTasks, activeProjects, recentResources, recentActivity, inboxUnprocessedCount] =
    await Promise.all([
      prisma.task.findMany({
        where: {
          userId,
          status: { not: "done" },
          dueDate: { lte: endOfToday() },
        },
        orderBy: [{ dueDate: "asc" }, { priority: "desc" }],
        include: { project: { select: { id: true, name: true, color: true } } },
      }),
      prisma.project.findMany({
        where: { userId, status: "active" },
        orderBy: { updatedAt: "desc" },
        take: 10,
        include: { area: { select: { id: true, name: true, color: true } } },
      }),
      prisma.resource.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: query.recentResourcesLimit,
      }),
      prisma.activityLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: query.activityLimit,
      }),
      getUnprocessedCount(userId),
    ]);

  return { todayTasks, activeProjects, recentResources, recentActivity, inboxUnprocessedCount };
}
