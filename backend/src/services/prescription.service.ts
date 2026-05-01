import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/errors.js";

export async function createPrescription(
  clinicId: string,
  dentistId: string,
  data: {
    patientId: string;
    appointmentId?: string;
    notes?: string;
    items: {
      medicineName: string;
      dosage: string;
      frequency: string;
      quantity: number;
      specialInstructions?: string;
    }[];
  },
) {
  // Ensure patient exists and belongs to clinic
  const patient = await prisma.patient.findFirst({
    where: { id: data.patientId, clinicId },
  });
  if (!patient) throw new AppError("Patient not found", 404, "NOT_FOUND");

  const prescription = await prisma.prescription.create({
    data: {
      clinicId,
      dentistId,
      patientId: data.patientId,
      appointmentId: data.appointmentId,
      notes: data.notes,
      status: "FINALIZED", // For MVP, we can just set it directly to finalized
      items: {
        create: data.items,
      },
    },
    include: {
      items: true,
    },
  });

  return prescription;
}

export async function getPrescriptionsByPatient(clinicId: string, patientId: string) {
  return prisma.prescription.findMany({
    where: { clinicId, patientId },
    include: {
      dentist: {
        select: { id: true, firstName: true, lastName: true },
      },
      items: true,
    },
    orderBy: { prescriptionDate: "desc" },
  });
}

export async function getPrescriptionById(clinicId: string, prescriptionId: string) {
  const prescription = await prisma.prescription.findFirst({
    where: { id: prescriptionId, clinicId },
    include: {
      patient: true,
      dentist: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          prcNumber: true,
          ptrNumber: true,
          s2License: true,
          tinNumber: true,
        },
      },
      clinic: true,
      items: true,
    },
  });
  if (!prescription) throw new AppError("Prescription not found", 404, "NOT_FOUND");
  return prescription;
}

export async function updateDentistLicenses(
  userId: string,
  clinicId: string,
  data: {
    prcNumber?: string;
    ptrNumber?: string;
    s2License?: string;
    tinNumber?: string;
  },
) {
  const user = await prisma.user.update({
    where: { id: userId, clinicId },
    data,
  });
  return user;
}
