import type { CreateAreaInput, UpdateAreaInput, AreaQuery } from "@mogoj/shared";
import { prisma } from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";
import { writeActivityLog } from "../activity/activity.service.js";

export async function listAreas(userId: string, query: AreaQuery) {
  const topLevel = { where: { parentTaskId: null }, select: { status: true } } as const;
  const areas = await prisma.area.findMany({
    where: { userId, ...(query.status && { status: query.status }) },
    orderBy: { order: "asc" },
    include: {
      // projectId: null so a task with both an area and a project isn't counted twice
      tasks: { where: { parentTaskId: null, projectId: null }, select: { status: true } },
      projects: { where: { status: { not: "archived" } }, select: { tasks: topLevel } },
    },
  });

  return areas.map(({ tasks, projects, ...area }) => {
    const all = [...tasks, ...projects.flatMap((p) => p.tasks)];
    const doneTaskCount = all.filter((t) => t.status === "done").length;
    return { ...area, projectCount: projects.length, openTaskCount: all.length - doneTaskCount, doneTaskCount };
  });
}

export async function createArea(userId: string, input: CreateAreaInput) {
  let order = input.order;
  if (order === undefined) {
    const last = await prisma.area.findFirst({ where: { userId }, orderBy: { order: "desc" } });
    order = (last?.order ?? 0) + 1;
  }

  const area = await prisma.area.create({
    data: { userId, ...input, order },
  });

  await writeActivityLog({ userId, entityType: "area", entityId: area.id, action: "created" });
  return area;
}

export async function getAreaById(userId: string, id: string) {
  const area = await prisma.area.findFirst({ where: { id, userId } });
  if (!area) throw ApiError.notFound("Area not found");
  return area;
}

export async function updateArea(userId: string, id: string, input: UpdateAreaInput) {
  await getAreaById(userId, id);

  const area = await prisma.area.update({
    where: { id },
    data: input,
  });

  await writeActivityLog({
    userId,
    entityType: "area",
    entityId: area.id,
    action: input.status === "archived" ? "archived" : "updated",
  });

  return area;
}

export async function deleteArea(userId: string, id: string) {
  await getAreaById(userId, id);

  const [activeProjectCount, directTaskCount, directResourceCount] = await Promise.all([
    prisma.project.count({ where: { areaId: id, status: { not: "archived" } } }),
    prisma.task.count({ where: { areaId: id } }),
    prisma.resource.count({ where: { areas: { some: { id } } } }),
  ]);

  if (activeProjectCount > 0) {
    throw ApiError.conflict(
      "This area has active projects. Archive or move them before deleting the area.",
    );
  }
  if (directTaskCount > 0 || directResourceCount > 0) {
    throw ApiError.conflict(
      "This area has tasks or resources attached directly to it. Move or delete them before deleting the area.",
    );
  }

  await prisma.area.delete({ where: { id } });
  await writeActivityLog({ userId, entityType: "area", entityId: id, action: "deleted" });
}

export async function getAreaDashboard(userId: string, id: string) {
  await getAreaById(userId, id);

  const [projects, tasks, resources] = await Promise.all([
    prisma.project.findMany({ where: { userId, areaId: id }, orderBy: { order: "asc" } }),
    prisma.task.findMany({
      where: { userId, areaId: id, parentTaskId: null },
      orderBy: [{ status: "asc" }, { order: "asc" }],
      include: {
        project: { select: { id: true, name: true, color: true, icon: true } },
        subtasks: { orderBy: { order: "asc" } },
      },
    }),
    prisma.resource.findMany({
      where: { userId, areas: { some: { id } } },
      orderBy: { createdAt: "desc" },
      include: {
        projects: { select: { id: true, name: true, color: true, icon: true } },
        areas: { select: { id: true, name: true, color: true, icon: true } },
        tasks: { select: { id: true, title: true, status: true } },
      },
    }),
  ]);

  return { projects, tasks, resources };
}
