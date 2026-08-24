import type { Prisma } from "@prisma/client";
import type { CreateNoteInput, UpdateNoteInput, NoteQuery } from "@mogoj/shared";
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

async function assertResourceOwnership(userId: string, resourceId: string) {
  const resource = await prisma.resource.findFirst({ where: { id: resourceId, userId } });
  if (!resource) throw ApiError.badRequest("Invalid resourceId");
}

export async function listNotes(userId: string, query: NoteQuery) {
  return prisma.note.findMany({
    where: {
      userId,
      ...(query.projectId && { projectId: query.projectId }),
      ...(query.areaId && { areaId: query.areaId }),
      ...(query.resourceId && { resourceId: query.resourceId }),
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function createNote(userId: string, input: CreateNoteInput) {
  if (input.projectId) await assertProjectOwnership(userId, input.projectId);
  if (input.areaId) await assertAreaOwnership(userId, input.areaId);
  if (input.resourceId) await assertResourceOwnership(userId, input.resourceId);

  const data: Prisma.NoteUncheckedCreateInput = {
    userId,
    projectId: input.projectId,
    areaId: input.areaId,
    resourceId: input.resourceId,
    title: input.title,
    content: toJsonInput(input.content),
  };

  const note = await prisma.note.create({ data });
  await writeActivityLog({ userId, entityType: "note", entityId: note.id, action: "created" });
  return note;
}

export async function getNoteById(userId: string, id: string) {
  const note = await prisma.note.findFirst({ where: { id, userId } });
  if (!note) throw ApiError.notFound("Note not found");
  return note;
}

export async function updateNote(userId: string, id: string, input: UpdateNoteInput) {
  await getNoteById(userId, id);

  if (input.resourceId !== undefined && input.resourceId !== null) {
    await assertResourceOwnership(userId, input.resourceId);
  }

  const data: Prisma.NoteUncheckedUpdateInput = {
    ...(input.title !== undefined && { title: input.title }),
    ...(input.content !== undefined && { content: toJsonInput(input.content) }),
    ...(input.resourceId !== undefined && { resourceId: input.resourceId }),
  };

  const note = await prisma.note.update({ where: { id }, data });
  await writeActivityLog({ userId, entityType: "note", entityId: note.id, action: "updated" });
  return note;
}

export async function deleteNote(userId: string, id: string) {
  await getNoteById(userId, id);
  await prisma.note.delete({ where: { id } });
  await writeActivityLog({ userId, entityType: "note", entityId: id, action: "deleted" });
}
