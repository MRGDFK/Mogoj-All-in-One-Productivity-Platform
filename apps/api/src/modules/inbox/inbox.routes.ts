import { Router } from "express";
import {
  createInboxItemSchema,
  updateInboxItemSchema,
  processInboxItemSchema,
  inboxQuerySchema,
  idParamSchema,
} from "@mogoj/shared";
import { validate } from "../../middlewares/validate.middleware.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { csrfMiddleware } from "../../middlewares/csrf.middleware.js";
import * as inboxController from "./inbox.controller.js";

export const inboxRouter = Router();

inboxRouter.use(authMiddleware);

inboxRouter.get("/", validate({ query: inboxQuerySchema }), inboxController.listInboxItems);
inboxRouter.post(
  "/",
  csrfMiddleware,
  validate({ body: createInboxItemSchema }),
  inboxController.createInboxItem,
);
inboxRouter.patch(
  "/:id",
  csrfMiddleware,
  validate({ params: idParamSchema, body: updateInboxItemSchema }),
  inboxController.updateInboxItem,
);
inboxRouter.delete(
  "/:id",
  csrfMiddleware,
  validate({ params: idParamSchema }),
  inboxController.deleteInboxItem,
);
inboxRouter.post(
  "/:id/process",
  csrfMiddleware,
  validate({ params: idParamSchema, body: processInboxItemSchema }),
  inboxController.processInboxItem,
);
