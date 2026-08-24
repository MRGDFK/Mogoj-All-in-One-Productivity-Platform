import { Router } from "express";
import {
  createTaskSchema,
  updateTaskSchema,
  createSubtaskSchema,
  createWorkLogSchema,
  taskQuerySchema,
  idParamSchema,
} from "@mogoj/shared";
import { validate } from "../../middlewares/validate.middleware.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { csrfMiddleware } from "../../middlewares/csrf.middleware.js";
import * as taskController from "./task.controller.js";

export const taskRouter = Router();

taskRouter.use(authMiddleware);

taskRouter.get("/", validate({ query: taskQuerySchema }), taskController.listTasks);
taskRouter.post(
  "/",
  csrfMiddleware,
  validate({ body: createTaskSchema }),
  taskController.createTask,
);
taskRouter.get("/:id", validate({ params: idParamSchema }), taskController.getTask);
taskRouter.patch(
  "/:id",
  csrfMiddleware,
  validate({ params: idParamSchema, body: updateTaskSchema }),
  taskController.updateTask,
);
taskRouter.delete(
  "/:id",
  csrfMiddleware,
  validate({ params: idParamSchema }),
  taskController.deleteTask,
);
taskRouter.get(
  "/:id/subtasks",
  validate({ params: idParamSchema }),
  taskController.listSubtasks,
);
taskRouter.post(
  "/:id/subtasks",
  csrfMiddleware,
  validate({ params: idParamSchema, body: createSubtaskSchema }),
  taskController.createSubtask,
);
taskRouter.post(
  "/:id/worklogs",
  csrfMiddleware,
  validate({ params: idParamSchema, body: createWorkLogSchema }),
  taskController.createWorkLog,
);
