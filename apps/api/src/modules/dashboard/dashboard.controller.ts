import type { Request, Response } from "express";
import type { DashboardQuery } from "@mogoj/shared";
import * as dashboardService from "./dashboard.service.js";
import { sendSuccess } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getHQDashboard = asyncHandler(async (req: Request, res: Response) => {
  const dashboard = await dashboardService.getHQDashboard(
    req.user!.id,
    req.query as unknown as DashboardQuery,
  );
  sendSuccess(res, 200, "HQ dashboard retrieved", dashboard);
});
