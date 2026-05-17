import { InvoiceStatus } from "@prisma/client";

import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/errors.js";
import { invalidateDashboardCache } from "../lib/dashboardCache.js";
import { softDeletePatient } from "./patient.service.js";

export async function executePatientDpaErasure(
  clinicId: string,
  patientId: string,
  actorUserId: string,
  reason?: string,
): Promise<{ deactivated: true; patientId: string }> {
  const patient = await prisma.patient.findFirst({
    where: { id: patientId, clinicId },
    select: { id: true, isActive: true, firstName: true, lastName: true },
  });
  if (!patient) {
    throw new AppError("Patient not found", 404, "PATIENT_NOT_FOUND");
  }
  if (!patient.isActive) {
    throw new AppError("Patient record is already inactive", 409, "PATIENT_ALREADY_INACTIVE");
  }

  const openInvoices = await prisma.invoice.count({
    where: {
      clinicId,
      patientId,
      status: { in: [InvoiceStatus.UNPAID, InvoiceStatus.PARTIAL] },
    },
  });
  if (openInvoices > 0) {
    throw new AppError(
      "Resolve or archive open invoices before DPA erasure",
      409,
      "PATIENT_HAS_OPEN_INVOICES",
    );
  }

  await softDeletePatient(clinicId, patientId);
  invalidateDashboardCache(clinicId);

  await prisma.auditLog.create({
    data: {
      clinicId,
      userId: actorUserId,
      method: "POST",
      path: `/patients/${patientId}/dpa-erasure`,
      action: "DPA_PATIENT_ERASURE",
      statusCode: 200,
      meta: {
        patientId,
        patientName: `${patient.firstName} ${patient.lastName}`,
        reason: reason?.trim().slice(0, 500) ?? null,
      },
    },
  });

  return { deactivated: true, patientId };
}
