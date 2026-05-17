import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/errors.js";

/** NPC / DPA veri taşınabilirliği — hasta başına JSON dışa aktarma (metadata; dosya içeriği hariç). */
export async function buildPatientDpaExport(clinicId: string, patientId: string) {
  const patient = await prisma.patient.findFirst({
    where: { id: patientId, clinicId },
    include: {
      medicalRecord: true,
      teeth: true,
      appointments: {
        orderBy: { scheduledAt: "desc" },
        include: {
          dentist: { select: { id: true, firstName: true, lastName: true } },
          treatments: true,
          invoice: {
            include: {
              items: true,
              payments: { select: { id: true, amount: true, method: true, paidAt: true } },
            },
          },
        },
      },
      invoices: {
        orderBy: { createdAt: "desc" },
        include: {
          items: true,
          payments: { select: { id: true, amount: true, method: true, paidAt: true } },
        },
      },
      files: {
        select: {
          id: true,
          fileName: true,
          mimeType: true,
          sizeBytes: true,
          createdAt: true,
        },
      },
      hmoMemberships: {
        include: { provider: { select: { code: true, name: true } } },
      },
      perioExams: { orderBy: { examDate: "desc" }, include: { teeth: true } },
      prescriptions: { orderBy: { createdAt: "desc" } },
      labOrders: { orderBy: { createdAt: "desc" } },
      soapNotes: { orderBy: { createdAt: "desc" } },
      referrals: { orderBy: { createdAt: "desc" } },
      consentForms: { orderBy: { createdAt: "desc" } },
      family: {
        include: {
          patients: { select: { id: true, firstName: true, lastName: true, phone: true } },
        },
      },
    },
  });

  if (!patient) {
    throw new AppError("Patient not found", 404, "PATIENT_NOT_FOUND");
  }

  const {
    appointments,
    invoices,
    files,
    hmoMemberships,
    perioExams,
    prescriptions,
    labOrders,
    soapNotes,
    referrals,
    consentForms,
    family,
    teeth,
    medicalRecord,
    ...demographics
  } = patient;

  return {
    exportedAt: new Date().toISOString(),
    schemaVersion: "1.0",
    clinicId,
    patientId,
    demographics,
    medicalRecord,
    teeth,
    appointments,
    invoices,
    files,
    hmoMemberships,
    perioExams,
    prescriptions,
    labOrders,
    soapNotes,
    referrals,
    consentForms,
    family,
    notice:
      "Binary file contents are not included. Use authenticated file download endpoints per file id.",
  };
}
