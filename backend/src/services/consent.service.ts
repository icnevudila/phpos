import { prisma } from "../lib/prisma.js";
import { NotFoundError } from "../utils/errors.js";

export async function createConsentForm(clinicId: string, data: any) {
  return prisma.consentForm.create({
    data: {
      clinicId,
      patientId: data.patientId,
      title: data.title,
      content: data.content,
    },
  });
}

export async function getConsentFormsByPatient(clinicId: string, patientId: string) {
  return prisma.consentForm.findMany({
    where: { clinicId, patientId },
    orderBy: { createdAt: "desc" },
  });
}

export async function signConsentForm(clinicId: string, id: string, data: any, ip: string, ua: string) {
  const form = await prisma.consentForm.findFirst({
    where: { id, clinicId },
  });

  if (!form) throw new NotFoundError("Consent form not found");

  return prisma.consentForm.update({
    where: { id },
    data: {
      signatureUrl: data.signatureUrl,
      signedAt: new Date(),
      ipAddress: ip,
      userAgent: ua,
    },
  });
}

export async function getConsentFormById(clinicId: string, id: string) {
  const form = await prisma.consentForm.findFirst({
    where: { id, clinicId },
    include: {
      patient: true,
    },
  });

  if (!form) throw new NotFoundError("Consent form not found");
  return form;
}
