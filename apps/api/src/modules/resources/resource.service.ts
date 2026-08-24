import crypto from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { Prisma } from "@prisma/client";
import type {
  CreateResourceInput,
  UpdateResourceInput,
  ResourceQuery,
  PresignUploadInput,
  TagInput,
} from "@mogoj/shared";
import { prisma } from "../../config/db.js";
import { r2Client } from "../../config/r2.js";
import { env } from "../../config/env.js";
import { ApiError } from "../../utils/ApiError.js";
import { writeActivityLog } from "../activity/activity.service.js";
import { toJsonInput } from "../../utils/prismaJson.js";

async function assertProjectsOwnership(userId: string, projectIds: string[]) {
  if (projectIds.length === 0) return;
  const count = await prisma.project.count({ where: { id: { in: projectIds }, userId } });
  if (count !== projectIds.length) throw ApiError.badRequest("Invalid projectIds");
}

async function assertAreasOwnership(userId: string, areaIds: string[]) {
  if (areaIds.length === 0) return;
  const count = await prisma.area.count({ where: { id: { in: areaIds }, userId } });
  if (count !== areaIds.length) throw ApiError.badRequest("Invalid areaIds");
}

async function assertTasksOwnership(userId: string, taskIds: string[]) {
  if (taskIds.length === 0) return;
  const count = await prisma.task.count({ where: { id: { in: taskIds }, userId } });
  if (count !== taskIds.length) throw ApiError.badRequest("Invalid taskIds");
}

// Tags are shared, per-user rows keyed by name — upsert each by (userId, name)
// so re-using a tag name reconnects the same row (and refreshes its color)
// instead of creating a duplicate.
async function resolveTags(userId: string, tags: TagInput[]) {
  return Promise.all(
    tags.map((tag) =>
      prisma.tag.upsert({
        where: { userId_name: { userId, name: tag.name } },
        create: { userId, name: tag.name, color: tag.color },
        update: { color: tag.color },
        select: { id: true },
      }),
    ),
  );
}

const resourceInclude = {
  projects: { select: { id: true, name: true, color: true, icon: true } },
  areas: { select: { id: true, name: true, color: true, icon: true } },
  tasks: { select: { id: true, title: true, status: true } },
  tags: { select: { id: true, name: true, color: true } },
} as const;

export async function listResources(userId: string, query: ResourceQuery) {
  const where: Prisma.ResourceWhereInput = {
    userId,
    ...(query.projectId && { projects: { some: { id: query.projectId } } }),
    ...(query.areaId && { areas: { some: { id: query.areaId } } }),
    ...(query.type && { type: query.type }),
    ...(query.q && { title: { contains: query.q, mode: "insensitive" } }),
    ...(query.tag && { tags: { some: { name: { equals: query.tag, mode: "insensitive" } } } }),
  };

  return prisma.resource.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: resourceInclude,
  });
}

export async function createResource(userId: string, input: CreateResourceInput) {
  await assertProjectsOwnership(userId, input.projectIds);
  await assertAreasOwnership(userId, input.areaIds);
  await assertTasksOwnership(userId, input.taskIds);
  const tagRecords = await resolveTags(userId, input.tags);

  const data: Prisma.ResourceUncheckedCreateInput = {
    userId,
    title: input.title,
    type: input.type,
    content: toJsonInput(input.content),
    url: input.url,
    icon: input.icon,
    projects: { connect: input.projectIds.map((id) => ({ id })) },
    areas: { connect: input.areaIds.map((id) => ({ id })) },
    tasks: { connect: input.taskIds.map((id) => ({ id })) },
    tags: { connect: tagRecords.map((t) => ({ id: t.id })) },
  };

  const resource = await prisma.resource.create({ data, include: resourceInclude });
  await writeActivityLog({ userId, entityType: "resource", entityId: resource.id, action: "created" });
  return resource;
}

export async function getResourceById(userId: string, id: string) {
  const resource = await prisma.resource.findFirst({ where: { id, userId }, include: resourceInclude });
  if (!resource) throw ApiError.notFound("Resource not found");
  return resource;
}

export async function updateResource(userId: string, id: string, input: UpdateResourceInput) {
  await getResourceById(userId, id);
  if (input.projectIds !== undefined) await assertProjectsOwnership(userId, input.projectIds);
  if (input.areaIds !== undefined) await assertAreasOwnership(userId, input.areaIds);
  if (input.taskIds !== undefined) await assertTasksOwnership(userId, input.taskIds);
  const tagRecords = input.tags !== undefined ? await resolveTags(userId, input.tags) : undefined;

  const data: Prisma.ResourceUncheckedUpdateInput = {
    ...(input.title !== undefined && { title: input.title }),
    ...(input.status !== undefined && { status: input.status }),
    ...(input.content !== undefined && { content: toJsonInput(input.content) }),
    ...(input.url !== undefined && { url: input.url }),
    ...(input.icon !== undefined && { icon: input.icon }),
    ...(input.projectIds !== undefined && {
      projects: { set: input.projectIds.map((projectId) => ({ id: projectId })) },
    }),
    ...(input.areaIds !== undefined && { areas: { set: input.areaIds.map((areaId) => ({ id: areaId })) } }),
    ...(input.taskIds !== undefined && { tasks: { set: input.taskIds.map((taskId) => ({ id: taskId })) } }),
    ...(tagRecords !== undefined && { tags: { set: tagRecords.map((t) => ({ id: t.id })) } }),
  };

  const resource = await prisma.resource.update({ where: { id }, data, include: resourceInclude });
  await writeActivityLog({ userId, entityType: "resource", entityId: resource.id, action: "updated" });
  return resource;
}

export async function deleteResource(userId: string, id: string) {
  await getResourceById(userId, id);
  await prisma.resource.delete({ where: { id } });
  await writeActivityLog({ userId, entityType: "resource", entityId: id, action: "deleted" });
}

export async function createPresignedUpload(userId: string, input: PresignUploadInput) {
  const ext = input.filename.split(".").pop() ?? "bin";
  const key = `users/${userId}/${crypto.randomUUID()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
    ContentType: input.contentType,
    ContentLength: input.sizeBytes,
  });

  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 300 });
  const publicUrl = `${env.R2_PUBLIC_URL}/${key}`;

  return { uploadUrl, publicUrl, key };
}
