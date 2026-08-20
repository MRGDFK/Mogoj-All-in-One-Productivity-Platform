import type { Request, Response } from "express";
import type {
  CreateResourceInput,
  UpdateResourceInput,
  ResourceQuery,
  PresignUploadInput,
} from "@mogoj/shared";
import * as resourceService from "./resource.service.js";
import { sendSuccess } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const listResources = asyncHandler(async (req: Request, res: Response) => {
  const resources = await resourceService.listResources(
    req.user!.id,
    req.query as unknown as ResourceQuery,
  );
  sendSuccess(res, 200, "Resources retrieved", resources);
});

export const createResource = asyncHandler(async (req: Request, res: Response) => {
  const resource = await resourceService.createResource(
    req.user!.id,
    req.body as CreateResourceInput,
  );
  sendSuccess(res, 201, "Resource created", resource);
});

export const getResource = asyncHandler(async (req: Request, res: Response) => {
  const resource = await resourceService.getResourceById(req.user!.id, req.params.id as string);
  sendSuccess(res, 200, "Resource retrieved", resource);
});

export const updateResource = asyncHandler(async (req: Request, res: Response) => {
  const resource = await resourceService.updateResource(
    req.user!.id,
    req.params.id as string,
    req.body as UpdateResourceInput,
  );
  sendSuccess(res, 200, "Resource updated", resource);
});

export const deleteResource = asyncHandler(async (req: Request, res: Response) => {
  await resourceService.deleteResource(req.user!.id, req.params.id as string);
  sendSuccess(res, 200, "Resource deleted", null);
});

export const createPresignedUpload = asyncHandler(async (req: Request, res: Response) => {
  const result = await resourceService.createPresignedUpload(
    req.user!.id,
    req.body as PresignUploadInput,
  );
  sendSuccess(res, 200, "Upload URL generated", result);
});
