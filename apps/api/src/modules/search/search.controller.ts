import type { Request, Response } from "express";
import type { SearchQuery } from "@mogoj/shared";
import * as searchService from "./search.service.js";
import { sendSuccess } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const search = asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query as unknown as SearchQuery;
  const results = await searchService.globalSearch(req.user!.id, q);
  sendSuccess(res, 200, "Search results", results);
});
