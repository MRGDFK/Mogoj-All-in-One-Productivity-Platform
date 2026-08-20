import { Router } from "express";
import {
  createResourceSchema,
  updateResourceSchema,
  resourceQuerySchema,
  presignUploadSchema,
  idParamSchema,
} from "@mogoj/shared";
import { validate } from "../../middlewares/validate.middleware.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { csrfMiddleware } from "../../middlewares/csrf.middleware.js";
import * as resourceController from "./resource.controller.js";

export const resourceRouter = Router();

resourceRouter.use(authMiddleware);

resourceRouter.get(
  "/",
  validate({ query: resourceQuerySchema }),
  resourceController.listResources,
);
resourceRouter.post(
  "/",
  csrfMiddleware,
  validate({ body: createResourceSchema }),
  resourceController.createResource,
);
resourceRouter.post(
  "/upload-url",
  csrfMiddleware,
  validate({ body: presignUploadSchema }),
  resourceController.createPresignedUpload,
);
resourceRouter.get("/:id", validate({ params: idParamSchema }), resourceController.getResource);
resourceRouter.patch(
  "/:id",
  csrfMiddleware,
  validate({ params: idParamSchema, body: updateResourceSchema }),
  resourceController.updateResource,
);
resourceRouter.delete(
  "/:id",
  csrfMiddleware,
  validate({ params: idParamSchema }),
  resourceController.deleteResource,
);
