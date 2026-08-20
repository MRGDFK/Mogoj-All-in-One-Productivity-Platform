import crypto from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { Prisma } from "@prisma/client";
import type {
  CreateResourceInput,
  UpdateResourceInput,
  ResourceQuery,
  PresignUploadInput,
} from "@mogoj/shared";
import { prisma } from "../../config/db.js";
import { r2Client } from "../../config/r2.js";
import { env } from "../../config/env.js";
import { ApiError } from "../../utils/ApiError.js";
import { writeActivityLog } from "../activity/activity.service.js";
import { toJsonInput } from "../../utils/prismaJson.js";

async function assertProjectOwnership(userId: string, projectId: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
  if (!project) throw ApiError.badRequest("Invalid projectId");
}

async function assertAreasOwnership(userId: string, areaIds: string[]) {
  if (areaIds.length === 0) return;
  const count = await prisma.area.count({ where: { id: { in: areaIds }, userId } });
  if (count !== areaIds.length) throw ApiError.badRequest("Invalid areaIds");
}

const areasInclude = { areas: { select: { id: true, name: true, color: true } } } as const;

export async function listResources(userId: string, query: ResourceQuery) {
  return prisma.resource.findMany({
    where: {
      userId,
      ...(query.projectId && { projectId: query.projectId }),
      ...(query.areaId && { areas: { some: { id: query.areaId } } }),
      ...(query.type && { type: query.type }),
      ...(query.tag && { tags: { has: query.tag } }),
      ...(query.q && { title: { contains: query.q, mode: "insensitive" } }),
    },
    orderBy: { createdAt: "desc" },
    include: areasInclude,
  });
}

export async function createResource(userId: string, input: CreateResourceInput) {
  if (input.projectId) await assertProjectOwnership(userId, input.projectId);
  await assertAreasOwnership(userId, input.areaIds);

  const data: Prisma.ResourceUncheckedCreateInput = {
    userId,
    projectId: input.projectId,
    title: input.title,
    type: input.type,
    content: toJsonInput(input.content),
    url: input.url,
    tags: input.tags,
    areas: { connect: input.areaIds.map((id) => ({ id })) },
  };

  const resource = await prisma.resource.create({ data, include: areasInclude });
  await writeActivityLog({ userId, entityType: "resource", entityId: resource.id, action: "created" });
  return resource;
}

export async function getResourceById(userId: string, id: string) {
  const resource = await prisma.resource.findFirst({ where: { id, userId }, include: areasInclude });
  if (!resource) throw ApiError.notFound("Resource not found");
  return resource;
}

export async function updateResource(userId: string, id: string, input: UpdateResourceInput) {
  await getResourceById(userId, id);
  if (input.projectId) await assertProjectOwnership(userId, input.projectId);
  if (input.areaIds !== undefined) await assertAreasOwnership(userId, input.areaIds);

  const data: Prisma.ResourceUncheckedUpdateInput = {
    ...(input.title !== undefined && { title: input.title }),
    ...(input.content !== undefined && { content: toJsonInput(input.content) }),
    ...(input.url !== undefined && { url: input.url }),
    ...(input.tags !== undefined && { tags: input.tags }),
    ...(input.projectId !== undefined && { projectId: input.projectId }),
    ...(input.areaIds !== undefined && { areas: { set: input.areaIds.map((areaId) => ({ id: areaId })) } }),
  };

  const resource = await prisma.resource.update({ where: { id }, data, include: areasInclude });
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
