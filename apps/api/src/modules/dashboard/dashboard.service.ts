import type { DashboardQuery } from "@mogoj/shared";
import { prisma } from "../../config/db.js";
import { getUnprocessedCount } from "../inbox/inbox.service.js";
import { withTaskCounts } from "../projects/project.service.js";

const THROUGHPUT_WEEKS = 8;

/** Monday 00:00 (server local time) of the week containing `d`. */
function startOfWeek(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  out.setDate(out.getDate() - ((out.getDay() + 6) % 7));
  return out;
}

/** Buckets task created/completed activity into consecutive weeks, oldest first. */
export function bucketThroughput(
  logs: { action: string; createdAt: Date }[],
  firstWeek: Date,
  weeks: number,
): { weekStart: string; created: number; completed: number }[] {
  const buckets = Array.from({ length: weeks }, (_, i) => {
    const start = new Date(firstWeek);
    start.setDate(start.getDate() + i * 7);
    return { weekStart: start.toISOString(), created: 0, completed: 0 };
  });
  for (const log of logs) {
    const i = Math.floor((startOfWeek(log.createdAt).getTime() - firstWeek.getTime()) / (7 * 86400000) + 0.5);
    const bucket = buckets[i];
    if (!bucket) continue;
    if (log.action === "created") bucket.created++;
    else if (log.action === "completed") bucket.completed++;
  }
  return buckets;
}

function endOfToday(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

export async function getHQDashboard(userId: string, query: DashboardQuery) {
  const firstWeek = startOfWeek(new Date());
  firstWeek.setDate(firstWeek.getDate() - (THROUGHPUT_WEEKS - 1) * 7);

  const [todayTasks, activeProjects, recentResources, recentActivity, inboxUnprocessedCount, activeProjectCount, throughputLogs] =
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
        include: { area: { select: { id: true, name: true, color: true } }, tasks: { select: { status: true } } },
      }),
      prisma.resource.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: query.recentResourcesLimit,
        include: {
          projects: { select: { id: true, name: true, color: true, icon: true } },
          areas: { select: { id: true, name: true, color: true, icon: true } },
          tasks: { select: { id: true, title: true, status: true } },
        },
      }),
      prisma.activityLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: query.activityLimit,
      }),
      getUnprocessedCount(userId),
      prisma.project.count({ where: { userId, status: "active" } }),
      prisma.activityLog.findMany({
        where: { userId, entityType: "task", action: { in: ["created", "completed"] }, createdAt: { gte: firstWeek } },
        select: { action: true, createdAt: true },
      }),
    ]);

  return {
    todayTasks,
    activeProjects: activeProjects.map(withTaskCounts),
    recentResources,
    recentActivity,
    inboxUnprocessedCount,
    activeProjectCount,
    weeklyThroughput: bucketThroughput(throughputLogs, firstWeek, THROUGHPUT_WEEKS),
  };
}
