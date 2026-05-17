import { Router } from "express";
import {
  handleCreateSoapNote,
  handleListPatientSoapNotes,
} from "../controllers/soapNote.controller.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { roleGuard } from "../middleware/roleGuard.js";

export const soapNoteRouter = Router();

soapNoteRouter.use(authenticate);

soapNoteRouter.get("/patient/:patientId", handleListPatientSoapNotes);
soapNoteRouter.post("/", roleGuard(["ADMIN", "DENTIST"]), handleCreateSoapNote);
