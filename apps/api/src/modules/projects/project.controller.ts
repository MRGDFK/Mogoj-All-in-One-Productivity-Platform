import type { Request, Response } from "express";
import type { CreateProjectInput, UpdateProjectInput, ProjectQuery } from "@mogoj/shared";
import * as projectService from "./project.service.js";
import { sendSuccess } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const listProjects = asyncHandler(async (req: Request, res: Response) => {
  const projects = await projectService.listProjects(
    req.user!.id,
    req.query as unknown as ProjectQuery,
  );
  sendSuccess(res, 200, "Projects retrieved", projects);
});

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.createProject(req.user!.id, req.body as CreateProjectInput);
  sendSuccess(res, 201, "Project created", project);
});

export const getProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.getProjectById(req.user!.id, req.params.id as string);
  sendSuccess(res, 200, "Project retrieved", project);
});

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.updateProject(
    req.user!.id,
    req.params.id as string,
    req.body as UpdateProjectInput,
  );
  sendSuccess(res, 200, "Project updated", project);
});

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  await projectService.deleteProject(req.user!.id, req.params.id as string);
  sendSuccess(res, 200, "Project deleted", null);
});

export const getProjectKanban = asyncHandler(async (req: Request, res: Response) => {
  const kanban = await projectService.getProjectKanban(req.user!.id, req.params.id as string);
  sendSuccess(res, 200, "Kanban board retrieved", kanban);
});
