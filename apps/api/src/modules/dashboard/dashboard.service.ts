import type { DashboardQuery, Throughput, ThroughputQuery } from "@mogoj/shared";
import { prisma } from "../../config/db.js";
import { getUnprocessedCount } from "../inbox/inbox.service.js";
import { withTaskCounts } from "../projects/project.service.js";
import { bucketByPeriod, periodStarts } from "./throughput.js";

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

function endOfToday(daysAhead = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  d.setHours(23, 59, 59, 999);
  return d;
}

const UPCOMING_DAYS = 3;

export async function getHQDashboard(userId: string, query: DashboardQuery) {
  const firstWeek = startOfWeek(new Date());
  firstWeek.setDate(firstWeek.getDate() - (THROUGHPUT_WEEKS - 1) * 7);

  const [todayTasks, upcomingTasks, activeProjects, recentResources, recentActivity, inboxUnprocessedCount, activeProjectCount, throughputLogs] =
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
      prisma.task.findMany({
        where: {
          userId,
          status: { not: "done" },
          dueDate: { gt: endOfToday(), lte: endOfToday(UPCOMING_DAYS) },
        },
        orderBy: [{ dueDate: "asc" }, { priority: "desc" }],
        take: 5,
        include: { project: { select: { id: true, name: true, color: true } } },
      }),
      prisma.project.findMany({
        where: { userId, status: "active" },
        orderBy: { updatedAt: "desc" },
        take: 10,
        include: { area: { select: { id: true, name: true, color: true, icon: true } }, tasks: { select: { status: true } } },
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
    upcomingTasks,
    activeProjects: activeProjects.map(withTaskCounts),
    recentResources,
    recentActivity,
    inboxUnprocessedCount,
    activeProjectCount,
    weeklyThroughput: bucketThroughput(throughputLogs, firstWeek, THROUGHPUT_WEEKS),
  };
}

const TASK_THROUGHPUT = { entityType: "task" as const, action: { in: ["created" as const, "completed" as const] } };

/** Task created vs completed for the HQ activity chart, bucketed by week (2w/8w) or month (6m/all). */
export async function getThroughput(userId: string, query: ThroughputQuery): Promise<Throughput> {
  const earliest =
    query.range === "all"
      ? ((
          await prisma.activityLog.findFirst({
            where: { userId, ...TASK_THROUGHPUT },
            orderBy: { createdAt: "asc" },
            select: { createdAt: true },
          })
        )?.createdAt ?? null)
      : null;
  const { unit, starts } = periodStarts(query.range, new Date(), earliest);
  const logs = await prisma.activityLog.findMany({
    where: { userId, ...TASK_THROUGHPUT, createdAt: { gte: starts[0] } },
    select: { action: true, createdAt: true },
  });
  return { unit, points: bucketByPeriod(logs, starts, unit) };
}
