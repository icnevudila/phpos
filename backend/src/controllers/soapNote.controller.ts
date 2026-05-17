import type { Request, Response } from "express";
import { createSoapNote, listSoapNotesByPatient } from "../services/soapNote.service.js";
import { createSoapNoteSchema } from "../validation/soapNote.schemas.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const handleListPatientSoapNotes = asyncHandler(async (req: Request, res: Response) => {
  const { clinicId } = req.user!;
  const { patientId } = req.params;
  const notes = await listSoapNotesByPatient(clinicId, patientId);
  res.json(notes);
});

export const handleCreateSoapNote = asyncHandler(async (req: Request, res: Response) => {
  const { clinicId, id: userId } = req.user!;
  const data = createSoapNoteSchema.parse(req.body);
  const note = await createSoapNote(clinicId, userId, data);
  res.status(201).json(note);
});
