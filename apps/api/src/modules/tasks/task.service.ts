import type { Prisma } from "@prisma/client";
import type {
  CreateTaskInput,
  UpdateTaskInput,
  TaskQuery,
  CreateSubtaskInput,
  CreateWorkLogInput,
} from "@mogoj/shared";
import { prisma } from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";
import { writeActivityLog } from "../activity/activity.service.js";
import { toJsonInput } from "../../utils/prismaJson.js";

async function assertAreaOwnership(userId: string, areaId: string) {
  const area = await prisma.area.findFirst({ where: { id: areaId, userId } });
  if (!area) throw ApiError.badRequest("Invalid areaId");
}

export async function listTasks(userId: string, query: TaskQuery) {
  const where: Prisma.TaskWhereInput = {
    userId,
    ...(query.topLevelOnly && { parentTaskId: null }),
    ...(query.projectId && { projectId: query.projectId }),
    ...(query.areaId && { areaId: query.areaId }),
    ...(query.status && { status: query.status }),
    ...(query.priority && { priority: query.priority }),
    ...(query.q && { title: { contains: query.q, mode: "insensitive" } }),
    ...((query.dueBefore || query.dueAfter) && {
      dueDate: {
        ...(query.dueBefore && { lte: query.dueBefore }),
        ...(query.dueAfter && { gte: query.dueAfter }),
      },
    }),
  };

  if (query.tag) {
    where.AND = [
      { tags: { path: ["$", "*", "name"], string_contains: query.tag } },
    ];
  }

  return prisma.task.findMany({
    where,
    orderBy: [{ status: "asc" }, { order: "asc" }],
    include: {
      subtasks: { orderBy: { order: "asc" } },
      project: { select: { id: true, name: true, color: true, icon: true } },
      area: { select: { id: true, name: true, color: true, icon: true } },
    },
  });
}

async function nextOrder(userId: string, status: string, projectId?: string, areaId?: string) {
  const last = await prisma.task.findFirst({
    where: { userId, status: status as never, ...(projectId && { projectId }), ...(areaId && { areaId }) },
    orderBy: { order: "desc" },
  });
  return (last?.order ?? 0) + 1;
}

// A task's areaId always mirrors its project's area when a project is set
// (so area rollups need only filter on areaId, never join through project),
// and is only directly settable once the task has no project.
async function resolveAreaId(userId: string, projectId: string | null | undefined, requestedAreaId: string | null | undefined) {
  if (projectId) {
    const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
    if (!project) throw ApiError.badRequest("Invalid projectId");
    return project.areaId;
  }
  if (requestedAreaId) await assertAreaOwnership(userId, requestedAreaId);
  return requestedAreaId ?? null;
}

export async function createTask(userId: string, input: CreateTaskInput) {
  const areaId = await resolveAreaId(userId, input.projectId, input.areaId);

  if (input.parentTaskId) {
    const parent = await prisma.task.findFirst({ where: { id: input.parentTaskId, userId } });
    if (!parent) throw ApiError.badRequest("Invalid parentTaskId");
    if (parent.parentTaskId) {
      throw ApiError.badRequest("Subtasks cannot be nested more than one level deep");
    }
  }

  const order = input.order ?? (await nextOrder(userId, input.status, input.projectId, areaId ?? undefined));

  const data: Prisma.TaskUncheckedCreateInput = {
    userId,
    projectId: input.projectId,
    areaId,
    parentTaskId: input.parentTaskId,
    title: input.title,
    description: toJsonInput(input.description),
    status: input.status,
    priority: input.priority,
    dueDate: input.dueDate,
    startDate: input.startDate,
    tags: toJsonInput(input.tags),
    isRecurring: input.isRecurring,
    order,
  };

  const task = await prisma.task.create({ data });
  await writeActivityLog({ userId, entityType: "task", entityId: task.id, action: "created" });
  return task;
}

export async function getTaskById(userId: string, id: string) {
  const task = await prisma.task.findFirst({
    where: { id, userId },
    include: {
      subtasks: { orderBy: { order: "asc" } },
      workLogs: { orderBy: { createdAt: "desc" } },
      project: { select: { id: true, name: true, color: true, icon: true } },
      area: { select: { id: true, name: true, color: true, icon: true } },
    },
  });
  if (!task) throw ApiError.notFound("Task not found");
  return task;
}

export async function updateTask(userId: string, id: string, input: UpdateTaskInput) {
  const existing = await getTaskById(userId, id);

  // Recompute areaId whenever the project changes, or whenever the task still
  // has a project (even if this update doesn't touch it) — this keeps areaId
  // pinned to the project's area and stops a stray client-sent areaId (see the
  // inbox ProcessModal bug) from ever drifting a project task's area out of sync.
  const projectId = input.projectId !== undefined ? input.projectId : existing.projectId;
  const needsAreaResolution = input.projectId !== undefined || input.areaId !== undefined || Boolean(projectId);
  const areaId = needsAreaResolution
    ? await resolveAreaId(userId, projectId, input.areaId !== undefined ? input.areaId : existing.areaId)
    : existing.areaId;

  const data: Prisma.TaskUncheckedUpdateInput = {
    ...(input.title !== undefined && { title: input.title }),
    ...(input.description !== undefined && { description: toJsonInput(input.description) }),
    ...(input.status !== undefined && { status: input.status }),
    ...(input.priority !== undefined && { priority: input.priority }),
    ...(input.dueDate !== undefined && { dueDate: input.dueDate }),
    ...(input.startDate !== undefined && { startDate: input.startDate }),
    ...(input.tags !== undefined && { tags: toJsonInput(input.tags) }),
    ...(input.isRecurring !== undefined && { isRecurring: input.isRecurring }),
    ...(input.order !== undefined && { order: input.order }),
    ...(input.projectId !== undefined && { projectId: input.projectId }),
    ...(needsAreaResolution && { areaId }),
  };

  const task = await prisma.task.update({ where: { id }, data });

  let action: "updated" | "completed" | "moved" = "updated";
  if (input.status === "done" && existing.status !== "done") action = "completed";
  else if (input.projectId !== undefined || input.areaId !== undefined) action = "moved";

  await writeActivityLog({ userId, entityType: "task", entityId: task.id, action });
  return task;
}

export async function deleteTask(userId: string, id: string) {
  await getTaskById(userId, id);
  // Cascades to subtasks at the DB level.
  await prisma.task.delete({ where: { id } });
  await writeActivityLog({ userId, entityType: "task", entityId: id, action: "deleted" });
}

export async function listSubtasks(userId: string, parentTaskId: string) {
  await getTaskById(userId, parentTaskId);
  return prisma.task.findMany({ where: { userId, parentTaskId }, orderBy: { order: "asc" } });
}

export async function createSubtask(userId: string, parentTaskId: string, input: CreateSubtaskInput) {
  const parent = await getTaskById(userId, parentTaskId);
  if (parent.parentTaskId) {
    throw ApiError.badRequest("Subtasks cannot be nested more than one level deep");
  }

  const order = input.order ?? (await nextOrder(userId, input.status));

  const data: Prisma.TaskUncheckedCreateInput = {
    userId,
    parentTaskId,
    projectId: parent.projectId,
    areaId: parent.areaId,
    title: input.title,
    description: toJsonInput(input.description),
    status: input.status,
    priority: input.priority,
    dueDate: input.dueDate,
    startDate: input.startDate,
    tags: toJsonInput(input.tags),
    order,
  };

  const subtask = await prisma.task.create({ data });

  await writeActivityLog({ userId, entityType: "task", entityId: subtask.id, action: "created" });
  return subtask;
}

export async function createWorkLog(userId: string, taskId: string, input: CreateWorkLogInput) {
  await getTaskById(userId, taskId);
  return prisma.workLog.create({ data: { userId, taskId, body: input.body } });
}
