import { dbTasks } from "../lib/dbTasks.js";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/errors.js";

async function assertPatient(clinicId: string, patientId: string) {
  const p = await prisma.patient.findFirst({
    where: { id: patientId, clinicId, isActive: true },
    select: { id: true, familyId: true, firstName: true, lastName: true },
  });
  if (!p) throw new AppError("Patient not found", 404, "PATIENT_NOT_FOUND");
  return p;
}

export interface PatientFamilyDto {
  id: string;
  name: string;
  patients: Array<{
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
  }>;
}

export async function getPatientFamily(
  clinicId: string,
  patientId: string,
): Promise<PatientFamilyDto | null> {
  const patient = await assertPatient(clinicId, patientId);
  if (!patient.familyId) return null;

  const family = await prisma.family.findFirst({
    where: { id: patient.familyId, clinicId },
    include: {
      patients: {
        where: { isActive: true },
        select: { id: true, firstName: true, lastName: true, phone: true },
        orderBy: { lastName: "asc" },
      },
    },
  });
  if (!family) return null;

  return { id: family.id, name: family.name, patients: family.patients };
}

export async function createFamilyForPatient(
  clinicId: string,
  patientId: string,
  name: string,
): Promise<PatientFamilyDto> {
  const patient = await assertPatient(clinicId, patientId);
  if (patient.familyId) {
    throw new AppError("Patient already belongs to a family", 409, "FAMILY_EXISTS");
  }

  const label =
    name.trim() ||
    `${patient.firstName} ${patient.lastName}`.trim() ||
    "Family";

  const family = await prisma.$transaction(async (tx) => {
    const created = await tx.family.create({
      data: { clinicId, name: label },
    });
    await tx.patient.update({
      where: { id: patientId },
      data: { familyId: created.id },
    });
    return created;
  });

  const full = await getPatientFamily(clinicId, patientId);
  return full ?? { id: family.id, name: family.name, patients: [] };
}

export async function linkPatientToFamily(
  clinicId: string,
  anchorPatientId: string,
  memberPatientId: string,
): Promise<PatientFamilyDto> {
  if (anchorPatientId === memberPatientId) {
    throw new AppError("Cannot link patient to themselves", 400, "FAMILY_SELF_LINK");
  }

  const [anchor, member] = await dbTasks([
    () => assertPatient(clinicId, anchorPatientId),
    () => assertPatient(clinicId, memberPatientId),
  ] as const);

  let familyId = anchor.familyId;

  if (!familyId) {
    const created = await prisma.family.create({
      data: {
        clinicId,
        name: `${anchor.firstName} ${anchor.lastName}`.trim() || "Family",
      },
    });
    familyId = created.id;
    await prisma.patient.update({
      where: { id: anchorPatientId },
      data: { familyId },
    });
  }

  if (member.familyId && member.familyId !== familyId) {
    throw new AppError("Patient already belongs to another family", 409, "FAMILY_CONFLICT");
  }

  if (!member.familyId) {
    await prisma.patient.update({
      where: { id: memberPatientId },
      data: { familyId },
    });
  }

  const full = await getPatientFamily(clinicId, anchorPatientId);
  if (!full) throw new AppError("Family not found", 404, "FAMILY_NOT_FOUND");
  return full;
}

export async function unlinkPatientFromFamily(
  clinicId: string,
  patientId: string,
  memberPatientId: string,
): Promise<PatientFamilyDto | null> {
  const anchor = await assertPatient(clinicId, patientId);
  if (!anchor.familyId) return null;

  const member = await prisma.patient.findFirst({
    where: { id: memberPatientId, clinicId, familyId: anchor.familyId },
    select: { id: true },
  });
  if (!member) throw new AppError("Family member not found", 404, "FAMILY_MEMBER_NOT_FOUND");

  await prisma.patient.update({
    where: { id: memberPatientId },
    data: { familyId: null },
  });

  const remaining = await prisma.patient.count({
    where: { familyId: anchor.familyId, isActive: true },
  });
  if (remaining === 0) {
    await prisma.family.delete({ where: { id: anchor.familyId } });
    return null;
  }

  return getPatientFamily(clinicId, patientId);
}
