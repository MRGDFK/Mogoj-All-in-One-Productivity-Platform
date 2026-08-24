import type { Prisma } from "@prisma/client";
import { KANBAN_COLUMNS, type TaskStatus } from "@mogoj/shared";
import type { CreateProjectInput, UpdateProjectInput, ProjectQuery } from "@mogoj/shared";
import { prisma } from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";
import { writeActivityLog } from "../activity/activity.service.js";

async function assertAreaOwnership(userId: string, areaId: string) {
  const area = await prisma.area.findFirst({ where: { id: areaId, userId } });
  if (!area) throw ApiError.badRequest("Invalid areaId");
}

function withTaskCounts<T extends { tasks: { status: TaskStatus }[] }>(project: T) {
  const { tasks, ...rest } = project;
  return {
    ...rest,
    totalTasks: tasks.length,
    completedTasks: tasks.filter((task) => task.status === "done").length,
  };
}

export async function listProjects(userId: string, query: ProjectQuery) {
  const projects = await prisma.project.findMany({
    where: {
      userId,
      ...(query.areaId && { areaId: query.areaId }),
      ...(query.status && { status: query.status }),
      ...(query.priority && { priority: query.priority }),
    },
    orderBy: { order: "asc" },
    include: {
      area: { select: { id: true, name: true, color: true, icon: true } },
      tasks: { where: { parentTaskId: null }, select: { status: true } },
    },
  });

  return projects.map(withTaskCounts);
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

  const data: Prisma.ProjectUncheckedCreateInput = {
    userId,
    areaId: input.areaId,
    name: input.name,
    description: input.description,
    color: input.color,
    icon: input.icon,
    priority: input.priority,
    startDate: input.startDate,
    endDate: input.endDate,
    coverImage: input.coverImage,
    order,
  };

  const project = await prisma.project.create({ data });
  await writeActivityLog({ userId, entityType: "project", entityId: project.id, action: "created" });
  return project;
}

export async function getProjectById(userId: string, id: string) {
  const project = await prisma.project.findFirst({
    where: { id, userId },
    include: {
      area: { select: { id: true, name: true, color: true, icon: true } },
      tasks: { where: { parentTaskId: null }, select: { status: true } },
    },
  });
  if (!project) throw ApiError.notFound("Project not found");
  return withTaskCounts(project);
}

export async function updateProject(userId: string, id: string, input: UpdateProjectInput) {
  await getProjectById(userId, id);
  if (input.areaId) {
    await assertAreaOwnership(userId, input.areaId);
  }

  const data: Prisma.ProjectUncheckedUpdateInput = {
    ...(input.areaId !== undefined && { areaId: input.areaId }),
    ...(input.name !== undefined && { name: input.name }),
    ...(input.description !== undefined && { description: input.description }),
    ...(input.color !== undefined && { color: input.color }),
    ...(input.icon !== undefined && { icon: input.icon }),
    ...(input.priority !== undefined && { priority: input.priority }),
    ...(input.startDate !== undefined && { startDate: input.startDate }),
    ...(input.endDate !== undefined && { endDate: input.endDate }),
    ...(input.coverImage !== undefined && { coverImage: input.coverImage }),
    ...(input.order !== undefined && { order: input.order }),
    ...(input.status !== undefined && { status: input.status }),
  };

  const project = await prisma.project.update({ where: { id }, data });

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
