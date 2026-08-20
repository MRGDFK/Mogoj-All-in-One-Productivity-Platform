import { Router } from "express";
import {
  createProjectSchema,
  updateProjectSchema,
  projectQuerySchema,
  idParamSchema,
} from "@mogoj/shared";
import { validate } from "../../middlewares/validate.middleware.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { csrfMiddleware } from "../../middlewares/csrf.middleware.js";
import * as projectController from "./project.controller.js";

export const projectRouter = Router();

projectRouter.use(authMiddleware);

projectRouter.get("/", validate({ query: projectQuerySchema }), projectController.listProjects);
projectRouter.post(
  "/",
  csrfMiddleware,
  validate({ body: createProjectSchema }),
  projectController.createProject,
);
projectRouter.get("/:id", validate({ params: idParamSchema }), projectController.getProject);
projectRouter.get(
  "/:id/kanban",
  validate({ params: idParamSchema }),
  projectController.getProjectKanban,
);
projectRouter.patch(
  "/:id",
  csrfMiddleware,
  validate({ params: idParamSchema, body: updateProjectSchema }),
  projectController.updateProject,
);
projectRouter.delete(
  "/:id",
  csrfMiddleware,
  validate({ params: idParamSchema }),
  projectController.deleteProject,
);
