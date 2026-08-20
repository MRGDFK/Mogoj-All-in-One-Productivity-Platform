import { Router } from "express";
import { createAreaSchema, updateAreaSchema, areaQuerySchema, idParamSchema } from "@mogoj/shared";
import { validate } from "../../middlewares/validate.middleware.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { csrfMiddleware } from "../../middlewares/csrf.middleware.js";
import * as areaController from "./area.controller.js";

export const areaRouter = Router();

areaRouter.use(authMiddleware);

areaRouter.get("/", validate({ query: areaQuerySchema }), areaController.listAreas);
areaRouter.post("/", csrfMiddleware, validate({ body: createAreaSchema }), areaController.createArea);
areaRouter.get("/:id", validate({ params: idParamSchema }), areaController.getArea);
areaRouter.get(
  "/:id/dashboard",
  validate({ params: idParamSchema }),
  areaController.getAreaDashboard,
);
areaRouter.patch(
  "/:id",
  csrfMiddleware,
  validate({ params: idParamSchema, body: updateAreaSchema }),
  areaController.updateArea,
);
areaRouter.delete(
  "/:id",
  csrfMiddleware,
  validate({ params: idParamSchema }),
  areaController.deleteArea,
);
