import { KANBAN_COLUMNS, type TaskStatus } from "@mogoj/shared";
import type { CreateProjectInput, UpdateProjectInput, ProjectQuery } from "@mogoj/shared";
import { prisma } from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";
import { writeActivityLog } from "../activity/activity.service.js";

async function assertAreaOwnership(userId: string, areaId: string) {
  const area = await prisma.area.findFirst({ where: { id: areaId, userId } });
  if (!area) throw ApiError.badRequest("Invalid areaId");
}

export async function listProjects(userId: string, query: ProjectQuery) {
  return prisma.project.findMany({
    where: {
      userId,
      ...(query.areaId && { areaId: query.areaId }),
      ...(query.status && { status: query.status }),
      ...(query.priority && { priority: query.priority }),
    },
    orderBy: { order: "asc" },
  });
}

export async function createProject(userId: string, input: CreateProjectInput) {
  await assertAreaOwnership(userId, input.areaId);

  let order = input.order;
  if (order === undefined) {
    const last = await prisma.project.findFirst({
      where: { userId, areaId: input.areaId },
      orderBy: { order: "desc" },
    });
    order = (last?.order ?? 0) + 1;
  }

  const project = await prisma.project.create({ data: { userId, ...input, order } });
  await writeActivityLog({ userId, entityType: "project", entityId: project.id, action: "created" });
  return project;
}

export async function getProjectById(userId: string, id: string) {
  const project = await prisma.project.findFirst({ where: { id, userId } });
  if (!project) throw ApiError.notFound("Project not found");
  return project;
}

export async function updateProject(userId: string, id: string, input: UpdateProjectInput) {
  await getProjectById(userId, id);
  if (input.areaId) {
    await assertAreaOwnership(userId, input.areaId);
  }

  const project = await prisma.project.update({ where: { id }, data: input });

  await writeActivityLog({
    userId,
    entityType: "project",
    entityId: project.id,
    action:
      input.status === "archived"
        ? "archived"
        : input.status === "completed"
          ? "completed"
          : input.areaId
            ? "moved"
            : "updated",
  });

  return project;
}

export async function deleteProject(userId: string, id: string) {
  await getProjectById(userId, id);
  // Cascades to the project's tasks and resources at the DB level.
  await prisma.project.delete({ where: { id } });
  await writeActivityLog({ userId, entityType: "project", entityId: id, action: "deleted" });
}

export async function getProjectKanban(userId: string, id: string) {
  await getProjectById(userId, id);

  const tasks = await prisma.task.findMany({
    where: { userId, projectId: id, parentTaskId: null },
    orderBy: { order: "asc" },
    include: { subtasks: { orderBy: { order: "asc" } } },
  });

  const columns: Record<TaskStatus, typeof tasks> = {
    todo: [],
    in_progress: [],
    in_review: [],
    done: [],
  };

  for (const task of tasks) {
    columns[task.status].push(task);
  }

  return KANBAN_COLUMNS.map((status) => ({ status, tasks: columns[status] }));
}
