import { Router } from "express";
import { searchQuerySchema } from "@mogoj/shared";
import { validate } from "../../middlewares/validate.middleware.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import * as searchController from "./search.controller.js";

export const searchRouter = Router();

searchRouter.use(authMiddleware);
searchRouter.get("/", validate({ query: searchQuerySchema }), searchController.search);
