import { Router } from "express";
import { dashboardQuerySchema } from "@mogoj/shared";
import { validate } from "../../middlewares/validate.middleware.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import * as dashboardController from "./dashboard.controller.js";

export const dashboardRouter = Router();

dashboardRouter.use(authMiddleware);

dashboardRouter.get(
  "/",
  validate({ query: dashboardQuerySchema }),
  dashboardController.getHQDashboard,
);
