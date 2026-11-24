import type { Request, Response } from "express";
import type { DashboardQuery, ThroughputQuery } from "@mogoj/shared";
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

export const getThroughput = asyncHandler(async (req: Request, res: Response) => {
  const throughput = await dashboardService.getThroughput(req.user!.id, req.query as unknown as ThroughputQuery);
  sendSuccess(res, 200, "Throughput retrieved", throughput);
});
