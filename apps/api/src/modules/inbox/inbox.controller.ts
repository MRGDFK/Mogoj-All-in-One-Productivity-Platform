import type { Request, Response } from "express";
import type {
  CreateInboxItemInput,
  UpdateInboxItemInput,
  InboxQuery,
  ProcessInboxItemInput,
} from "@mogoj/shared";
import * as inboxService from "./inbox.service.js";
import { sendSuccess } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const listInboxItems = asyncHandler(async (req: Request, res: Response) => {
  const items = await inboxService.listInboxItems(req.user!.id, req.query as unknown as InboxQuery);
  sendSuccess(res, 200, "Inbox items retrieved", items);
});

export const createInboxItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await inboxService.createInboxItem(req.user!.id, req.body as CreateInboxItemInput);
  sendSuccess(res, 201, "Inbox item captured", item);
});

export const updateInboxItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await inboxService.updateInboxItem(
    req.user!.id,
    req.params.id as string,
    req.body as UpdateInboxItemInput,
  );
  sendSuccess(res, 200, "Inbox item updated", item);
});

export const deleteInboxItem = asyncHandler(async (req: Request, res: Response) => {
  await inboxService.deleteInboxItem(req.user!.id, req.params.id as string);
  sendSuccess(res, 200, "Inbox item deleted", null);
});

export const processInboxItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await inboxService.processInboxItem(
    req.user!.id,
    req.params.id as string,
    req.body as ProcessInboxItemInput,
  );
  sendSuccess(res, 200, "Inbox item processed", item);
});
