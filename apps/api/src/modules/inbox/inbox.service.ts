import type { Prisma } from "@prisma/client";
import type {
  CreateInboxItemInput,
  UpdateInboxItemInput,
  InboxQuery,
  ProcessInboxItemInput,
} from "@mogoj/shared";
import { prisma } from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";
import { writeActivityLog } from "../activity/activity.service.js";
import { toJsonInput } from "../../utils/prismaJson.js";

async function assertProjectOwnership(userId: string, projectId: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
  if (!project) throw ApiError.badRequest("Invalid projectId");
}

async function assertAreaOwnership(userId: string, areaId: string) {
  const area = await prisma.area.findFirst({ where: { id: areaId, userId } });
  if (!area) throw ApiError.badRequest("Invalid areaId");
}

export async function listInboxItems(userId: string, query: InboxQuery) {
  return prisma.inboxItem.findMany({
    where: {
      userId,
      ...(query.status && { status: query.status }),
      ...(query.type && { type: query.type }),
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUnprocessedCount(userId: string) {
  return prisma.inboxItem.count({ where: { userId, status: "captured" } });
}

export async function createInboxItem(userId: string, input: CreateInboxItemInput) {
  const data: Prisma.InboxItemUncheckedCreateInput = {
    userId,
    title: input.title,
    body: toJsonInput(input.body),
    type: input.type,
    attachments: input.attachments,
  };

  const item = await prisma.inboxItem.create({ data });
  await writeActivityLog({ userId, entityType: "inbox", entityId: item.id, action: "created" });
  return item;
}

export async function getInboxItemById(userId: string, id: string) {
  const item = await prisma.inboxItem.findFirst({ where: { id, userId } });
  if (!item) throw ApiError.notFound("Inbox item not found");
  return item;
}

export async function updateInboxItem(userId: string, id: string, input: UpdateInboxItemInput) {
  await getInboxItemById(userId, id);

  const data: Prisma.InboxItemUncheckedUpdateInput = {
    ...(input.title !== undefined && { title: input.title }),
    ...(input.body !== undefined && { body: toJsonInput(input.body) }),
    ...(input.type !== undefined && { type: input.type }),
    ...(input.attachments !== undefined && { attachments: input.attachments }),
  };

  const item = await prisma.inboxItem.update({ where: { id }, data });
  await writeActivityLog({ userId, entityType: "inbox", entityId: item.id, action: "updated" });
  return item;
}

export async function deleteInboxItem(userId: string, id: string) {
  await getInboxItemById(userId, id);
  await prisma.inboxItem.delete({ where: { id } });
  await writeActivityLog({ userId, entityType: "inbox", entityId: id, action: "deleted" });
}

export async function processInboxItem(userId: string, id: string, input: ProcessInboxItemInput) {
  const item = await getInboxItemById(userId, id);
  if (item.status === "processed") {
    throw ApiError.conflict("This inbox item has already been processed");
  }

  if (input.target === "discard") {
    const updated = await prisma.inboxItem.update({
      where: { id },
      data: { status: "processed", processedAt: new Date() },
    });
    await writeActivityLog({ userId, entityType: "inbox", entityId: id, action: "promoted" });
    return updated;
  }

  if (input.target === "task") {
    if (!input.areaId && !input.projectId) {
      throw ApiError.badRequest("A task must be assigned to a project or an area");
    }

    // areaId always mirrors the project's area once a project is chosen —
    // same rule as task.service.ts's createTask/updateTask.
    let areaId = input.areaId;
    if (input.projectId) {
      const project = await prisma.project.findFirst({ where: { id: input.projectId, userId } });
      if (!project) throw ApiError.badRequest("Invalid projectId");
      areaId = project.areaId;
    } else if (input.areaId) {
      await assertAreaOwnership(userId, input.areaId);
    }

    const taskData: Prisma.TaskUncheckedCreateInput = {
      userId,
      title: item.title,
      description: toJsonInput(item.body),
      projectId: input.projectId,
      areaId,
    };
    const task = await prisma.task.create({ data: taskData });
    const updated = await prisma.inboxItem.update({
      where: { id },
      data: { status: "processed", processedAt: new Date(), promotedToTaskId: task.id },
    });

    await writeActivityLog({ userId, entityType: "task", entityId: task.id, action: "created" });
    await writeActivityLog({ userId, entityType: "inbox", entityId: id, action: "promoted" });
    return updated;
  }

  if (input.target === "project") {
    await assertAreaOwnership(userId, input.areaId);

    const project = await prisma.project.create({
      data: { userId, areaId: input.areaId, name: item.title },
    });
    const updated = await prisma.inboxItem.update({
      where: { id },
      data: { status: "processed", processedAt: new Date(), promotedToProjectId: project.id },
    });

    await writeActivityLog({ userId, entityType: "project", entityId: project.id, action: "created" });
    await writeActivityLog({ userId, entityType: "inbox", entityId: id, action: "promoted" });
    return updated;
  }

  // target === "resource"
  if (!input.areaId && !input.projectId) {
    throw ApiError.badRequest("A resource must be assigned to a project or an area");
  }
  if (input.projectId) await assertProjectOwnership(userId, input.projectId);
  if (input.areaId) await assertAreaOwnership(userId, input.areaId);

  const resourceData: Prisma.ResourceUncheckedCreateInput = {
    userId,
    title: item.title,
    type: "note",
    content: toJsonInput(item.body),
    projects: input.projectId ? { connect: [{ id: input.projectId }] } : undefined,
    areas: input.areaId ? { connect: [{ id: input.areaId }] } : undefined,
  };
  const resource = await prisma.resource.create({ data: resourceData });
  const updated = await prisma.inboxItem.update({
    where: { id },
    data: { status: "processed", processedAt: new Date(), promotedToResourceId: resource.id },
  });

  await writeActivityLog({ userId, entityType: "resource", entityId: resource.id, action: "created" });
  await writeActivityLog({ userId, entityType: "inbox", entityId: id, action: "promoted" });
  return updated;
}
