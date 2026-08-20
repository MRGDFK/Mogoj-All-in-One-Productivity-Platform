import { prisma } from "../../config/db.js";

const RESULT_LIMIT = 5;

export async function globalSearch(userId: string, q: string) {
  const [tasks, projects, areas, resources] = await Promise.all([
    prisma.task.findMany({
      where: { userId, title: { contains: q, mode: "insensitive" } },
      take: RESULT_LIMIT,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.project.findMany({
      where: { userId, name: { contains: q, mode: "insensitive" } },
      take: RESULT_LIMIT,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.area.findMany({
      where: { userId, name: { contains: q, mode: "insensitive" } },
      take: RESULT_LIMIT,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.resource.findMany({
      where: { userId, title: { contains: q, mode: "insensitive" } },
      take: RESULT_LIMIT,
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return { tasks, projects, areas, resources };
}
