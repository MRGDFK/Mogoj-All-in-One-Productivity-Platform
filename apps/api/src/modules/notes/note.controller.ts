import type { Request, Response } from "express";
import type { CreateNoteInput, UpdateNoteInput, NoteQuery } from "@mogoj/shared";
import * as noteService from "./note.service.js";
import { sendSuccess } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const listNotes = asyncHandler(async (req: Request, res: Response) => {
  const notes = await noteService.listNotes(req.user!.id, req.query as unknown as NoteQuery);
  sendSuccess(res, 200, "Notes retrieved", notes);
});

export const createNote = asyncHandler(async (req: Request, res: Response) => {
  const note = await noteService.createNote(req.user!.id, req.body as CreateNoteInput);
  sendSuccess(res, 201, "Note created", note);
});

export const getNote = asyncHandler(async (req: Request, res: Response) => {
  const note = await noteService.getNoteById(req.user!.id, req.params.id as string);
  sendSuccess(res, 200, "Note retrieved", note);
});

export const updateNote = asyncHandler(async (req: Request, res: Response) => {
  const note = await noteService.updateNote(
    req.user!.id,
    req.params.id as string,
    req.body as UpdateNoteInput,
  );
  sendSuccess(res, 200, "Note updated", note);
});

export const deleteNote = asyncHandler(async (req: Request, res: Response) => {
  await noteService.deleteNote(req.user!.id, req.params.id as string);
  sendSuccess(res, 200, "Note deleted", null);
});
