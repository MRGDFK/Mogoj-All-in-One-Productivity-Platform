import type { Request, Response } from "express";
import type { CreateAreaInput, UpdateAreaInput, AreaQuery } from "@mogoj/shared";
import * as areaService from "./area.service.js";
import { sendSuccess } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const listAreas = asyncHandler(async (req: Request, res: Response) => {
  const areas = await areaService.listAreas(req.user!.id, req.query as unknown as AreaQuery);
  sendSuccess(res, 200, "Areas retrieved", areas);
});

export const createArea = asyncHandler(async (req: Request, res: Response) => {
  const area = await areaService.createArea(req.user!.id, req.body as CreateAreaInput);
  sendSuccess(res, 201, "Area created", area);
});

export const getArea = asyncHandler(async (req: Request, res: Response) => {
  const area = await areaService.getAreaById(req.user!.id, req.params.id as string);
  sendSuccess(res, 200, "Area retrieved", area);
});

export const updateArea = asyncHandler(async (req: Request, res: Response) => {
  const area = await areaService.updateArea(
    req.user!.id,
    req.params.id as string,
    req.body as UpdateAreaInput,
  );
  sendSuccess(res, 200, "Area updated", area);
});

export const deleteArea = asyncHandler(async (req: Request, res: Response) => {
  await areaService.deleteArea(req.user!.id, req.params.id as string);
  sendSuccess(res, 200, "Area deleted", null);
});

export const getAreaDashboard = asyncHandler(async (req: Request, res: Response) => {
  const dashboard = await areaService.getAreaDashboard(req.user!.id, req.params.id as string);
  sendSuccess(res, 200, "Area dashboard retrieved", dashboard);
});
