import { Router } from "express";
import { createNoteSchema, updateNoteSchema, noteQuerySchema, idParamSchema } from "@mogoj/shared";
import { validate } from "../../middlewares/validate.middleware.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { csrfMiddleware } from "../../middlewares/csrf.middleware.js";
import * as noteController from "./note.controller.js";

export const noteRouter = Router();

noteRouter.use(authMiddleware);

noteRouter.get("/", validate({ query: noteQuerySchema }), noteController.listNotes);
noteRouter.post(
  "/",
  csrfMiddleware,
  validate({ body: createNoteSchema }),
  noteController.createNote,
);
noteRouter.get("/:id", validate({ params: idParamSchema }), noteController.getNote);
noteRouter.patch(
  "/:id",
  csrfMiddleware,
  validate({ params: idParamSchema, body: updateNoteSchema }),
  noteController.updateNote,
);
noteRouter.delete(
  "/:id",
  csrfMiddleware,
  validate({ params: idParamSchema }),
  noteController.deleteNote,
);
