import { prisma } from "../lib/prisma.js";
import { NotFoundError } from "../utils/errors.js";

export type CreateSoapNoteInput = {
  patientId: string;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
};

export async function listSoapNotesByPatient(clinicId: string, patientId: string) {
  const patient = await prisma.patient.findFirst({
    where: { id: patientId, clinicId },
    select: { id: true },
  });
  if (!patient) throw new NotFoundError("Patient not found");

  return prisma.soapNote.findMany({
    where: { clinicId, patientId },
    include: {
      author: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createSoapNote(
  clinicId: string,
  authorId: string,
  data: CreateSoapNoteInput,
) {
  const patient = await prisma.patient.findFirst({
    where: { id: data.patientId, clinicId },
    select: { id: true },
  });
  if (!patient) throw new NotFoundError("Patient not found");

  return prisma.soapNote.create({
    data: {
      clinicId,
      patientId: data.patientId,
      authorId,
      subjective: data.subjective?.trim() ?? "",
      objective: data.objective?.trim() ?? "",
      assessment: data.assessment?.trim() ?? "",
      plan: data.plan?.trim() ?? "",
    },
    include: {
      author: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}
