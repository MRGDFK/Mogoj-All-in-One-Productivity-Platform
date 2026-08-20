import type { Request, Response } from "express";
import type {
  CreateTaskInput,
  UpdateTaskInput,
  TaskQuery,
  CreateSubtaskInput,
} from "@mogoj/shared";
import * as taskService from "./task.service.js";
import { sendSuccess } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const listTasks = asyncHandler(async (req: Request, res: Response) => {
  const tasks = await taskService.listTasks(req.user!.id, req.query as unknown as TaskQuery);
  sendSuccess(res, 200, "Tasks retrieved", tasks);
});

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.createTask(req.user!.id, req.body as CreateTaskInput);
  sendSuccess(res, 201, "Task created", task);
});

export const getTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.getTaskById(req.user!.id, req.params.id as string);
  sendSuccess(res, 200, "Task retrieved", task);
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.updateTask(
    req.user!.id,
    req.params.id as string,
    req.body as UpdateTaskInput,
  );
  sendSuccess(res, 200, "Task updated", task);
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  await taskService.deleteTask(req.user!.id, req.params.id as string);
  sendSuccess(res, 200, "Task deleted", null);
});

export const listSubtasks = asyncHandler(async (req: Request, res: Response) => {
  const subtasks = await taskService.listSubtasks(req.user!.id, req.params.id as string);
  sendSuccess(res, 200, "Subtasks retrieved", subtasks);
});

export const createSubtask = asyncHandler(async (req: Request, res: Response) => {
  const subtask = await taskService.createSubtask(
    req.user!.id,
    req.params.id as string,
    req.body as CreateSubtaskInput,
  );
  sendSuccess(res, 201, "Subtask created", subtask);
});
