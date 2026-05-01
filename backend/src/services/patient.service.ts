import { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/errors.js";
import type { CreatePatientInput, ListPatientsQuery, UpdatePatientInput } from "../validation/patient.schemas.js";
import { readLocalPatientFileBuffer, uploadPatientFile } from "./patientFileStorage.js";

function medicalJson(text: string | undefined): Prisma.InputJsonValue | undefined {
  if (text === undefined) return undefined;
  const t = text.trim();
  if (t === "") return undefined;
  return { text: t } as Prisma.InputJsonValue;
}

export async function listPatients(clinicId: string, query: ListPatientsQuery) {
  const { page, limit, q } = query;
  const trimmed = q?.trim();

  const where: Prisma.PatientWhereInput = {
    clinicId,
    isActive: true,
    ...(trimmed
      ? {
          OR: [
            { firstName: { contains: trimmed, mode: "insensitive" } },
            { lastName: { contains: trimmed, mode: "insensitive" } },
            { phone: { contains: trimmed, mode: "insensitive" } },
            { philhealthNo: { contains: trimmed, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const skip = (page - 1) * limit;

  const [rows, total] = await prisma.$transaction([
    prisma.patient.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      include: {
        appointments: {
          orderBy: { scheduledAt: "desc" },
          take: 1,
          select: { scheduledAt: true, status: true },
        },
        hmoMemberships: {
          select: {
            id: true,
            isPrimary: true,
            provider: { select: { code: true, name: true } },
          },
        },
      },
    }),
    prisma.patient.count({ where }),
  ]);

  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  const data = rows.map((p) => {
    const lastVisit = p.appointments[0]?.scheduledAt ?? null;
    return {
      id: p.id,
      firstName: p.firstName,
      lastName: p.lastName,
      phone: p.phone,
      birthDate: p.birthDate,
      philhealthNo: p.philhealthNo,
      lastVisitAt: lastVisit,
      createdAt: p.createdAt,
      hmoMemberships: p.hmoMemberships.map((m) => ({
        id: m.id,
        isPrimary: m.isPrimary,
        providerCode: m.provider.code,
        providerName: m.provider.name,
      })),
    };
  });

  return { data, total, page, totalPages };
}

export async function getPatientById(clinicId: string, patientId: string) {
  const patient = await prisma.patient.findFirst({
    where: { id: patientId, clinicId },
    include: {
      teeth: { orderBy: { toothNumber: "asc" } },
      appointments: {
        orderBy: { scheduledAt: "desc" },
        take: 50,
        include: {
          dentist: { select: { id: true, firstName: true, lastName: true } },
        },
      },
      invoices: {
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          orNumber: true,
          subtotal: true,
          discount: true,
          total: true,
          status: true,
          dueDate: true,
          paidAt: true,
          createdAt: true,
        },
      },
      files: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          fileName: true,
          mimeType: true,
          sizeBytes: true,
          publicUrl: true,
          createdAt: true,
        },
      },
      medicalRecord: {
        include: {
          recordedBy: { select: { id: true, firstName: true, lastName: true } },
        },
      },
    },
  });

  if (!patient) {
    throw new AppError("Patient not found", 404, "PATIENT_NOT_FOUND");
  }

  const medicalText =
    patient.medicalHistory &&
    typeof patient.medicalHistory === "object" &&
    patient.medicalHistory !== null &&
    "text" in patient.medicalHistory &&
    typeof (patient.medicalHistory as { text?: unknown }).text === "string"
      ? (patient.medicalHistory as { text: string }).text
      : null;

  const invoices = patient.invoices.map((inv) => ({
    ...inv,
    subtotal: inv.subtotal.toString(),
    discount: inv.discount.toString(),
    total: inv.total.toString(),
  }));

  return {
    ...patient,
    invoices,
    medicalHistoryText: medicalText,
  };
}

function buildPatientData(input: Partial<CreatePatientInput>): Prisma.PatientUncheckedUpdateInput {
  const data: Prisma.PatientUncheckedUpdateInput = {};
  const assign = <K extends keyof Prisma.PatientUncheckedUpdateInput>(
    key: K,
    value: Prisma.PatientUncheckedUpdateInput[K] | undefined,
  ): void => {
    if (value !== undefined) data[key] = value;
  };
  assign("firstName", input.firstName);
  assign("middleName", input.middleName);
  assign("lastName", input.lastName);
  assign("nickname", input.nickname);
  assign("phone", input.phone);
  assign("email", input.email);
  assign("birthDate", input.birthDate);
  assign("gender", input.gender);
  assign("civilStatus", input.civilStatus);
  assign("religion", input.religion);
  assign("nationality", input.nationality);
  assign("occupation", input.occupation);
  assign("address", input.address);
  assign("city", input.city);
  assign("province", input.province);
  assign("guardianName", input.guardianName);
  assign("guardianRelation", input.guardianRelation);
  assign("guardianPhone", input.guardianPhone);
  assign("referralSource", input.referralSource);
  assign("previousDentist", input.previousDentist);
  assign("lastDentalVisit", input.lastDentalVisit);
  assign("reasonForVisit", input.reasonForVisit);
  assign("bloodPressureSystolic", input.bloodPressureSystolic);
  assign("bloodPressureDiastolic", input.bloodPressureDiastolic);
  assign("pulseRate", input.pulseRate);
  assign("bloodType", input.bloodType);
  assign("philhealthNo", input.philhealthNo);
  assign("isSeniorCitizen", input.isSeniorCitizen);
  assign("oscaIdNo", input.oscaIdNo);
  assign("pwdIdNo", input.pwdIdNo);
  assign("emergencyContactName", input.emergencyContactName);
  assign("emergencyContactPhone", input.emergencyContactPhone);
  if (input.allergies !== undefined) data.allergies = input.allergies;
  if (input.medicalHistory !== undefined) {
    const mj = medicalJson(input.medicalHistory);
    data.medicalHistory = mj === undefined ? Prisma.JsonNull : mj;
  }
  return data;
}

export async function createPatient(clinicId: string, input: CreatePatientInput) {
  const dup = await prisma.patient.findFirst({
    where: {
      clinicId,
      phone: input.phone,
      isActive: true,
    },
  });
  if (dup) {
    throw new AppError("A patient with this phone already exists", 409, "PHONE_IN_USE");
  }

  const data = buildPatientData(input);
  return prisma.patient.create({
    data: {
      ...(data as Prisma.PatientUncheckedCreateInput),
      clinicId,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      allergies: input.allergies ?? [],
      isActive: true,
    },
  });
}

export async function updatePatient(clinicId: string, patientId: string, input: UpdatePatientInput) {
  const existing = await prisma.patient.findFirst({
    where: { id: patientId, clinicId },
  });
  if (!existing) {
    throw new AppError("Patient not found", 404, "PATIENT_NOT_FOUND");
  }
  if (!existing.isActive) {
    throw new AppError("Cannot update inactive patient", 400, "PATIENT_INACTIVE");
  }

  if (input.phone && input.phone !== existing.phone) {
    const dup = await prisma.patient.findFirst({
      where: {
        clinicId,
        phone: input.phone,
        isActive: true,
        NOT: { id: patientId },
      },
    });
    if (dup) {
      throw new AppError("A patient with this phone already exists", 409, "PHONE_IN_USE");
    }
  }

  return prisma.patient.update({
    where: { id: patientId },
    data: buildPatientData(input),
  });
}

export async function softDeletePatient(clinicId: string, patientId: string) {
  const existing = await prisma.patient.findFirst({
    where: { id: patientId, clinicId },
  });
  if (!existing) {
    throw new AppError("Patient not found", 404, "PATIENT_NOT_FOUND");
  }
  await prisma.patient.update({
    where: { id: patientId },
    data: { isActive: false },
  });
}

export async function getPatientFileDownload(
  clinicId: string,
  patientId: string,
  fileId: string,
): Promise<{ buffer: Buffer; fileName: string; mimeType: string }> {
  await assertPatientInClinic(clinicId, patientId);
  const row = await prisma.patientFile.findFirst({
    where: { id: fileId, patientId, clinicId },
    select: { storageKey: true, fileName: true, mimeType: true },
  });
  if (!row) {
    throw new AppError("File not found", 404, "FILE_NOT_FOUND");
  }
  const driver = (process.env.STORAGE_DRIVER ?? "local") as string;
  if (driver !== "local") {
    throw new AppError(
      "Download for this storage driver is not implemented yet; use cloud console or add GetObject",
      501,
      "STORAGE_DOWNLOAD_NOT_IMPLEMENTED",
    );
  }
  const buffer = await readLocalPatientFileBuffer(row.storageKey);
  return { buffer, fileName: row.fileName, mimeType: row.mimeType };
}

export async function listPatientFiles(clinicId: string, patientId: string) {
  await assertPatientInClinic(clinicId, patientId);
  return prisma.patientFile.findMany({
    where: { patientId, clinicId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fileName: true,
      mimeType: true,
      sizeBytes: true,
      publicUrl: true,
      createdAt: true,
    },
  });
}

export async function updatePatientFileAnnotations(
  clinicId: string,
  patientId: string,
  fileId: string,
  annotations: any,
) {
  await assertPatientInClinic(clinicId, patientId);
  const row = await prisma.patientFile.findFirst({
    where: { id: fileId, patientId, clinicId },
  });
  if (!row) throw new AppError("File not found", 404, "FILE_NOT_FOUND");
  return prisma.patientFile.update({
    where: { id: fileId },
    data: { annotations: annotations ? annotations : null },
  });
}

export async function addPatientFile(
  clinicId: string,
  patientId: string,
  file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
) {
  await assertPatientInClinic(clinicId, patientId);

  const allowed =
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/pdf" ||
    file.mimetype === "application/dicom";
  if (!allowed) {
    throw new AppError("Unsupported file type", 400, "INVALID_FILE_TYPE");
  }
  const maxBytes = 15 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new AppError("File too large (max 15MB)", 400, "FILE_TOO_LARGE");
  }

  const uploaded = await uploadPatientFile({
    buffer: file.buffer,
    originalName: file.originalname,
    mimeType: file.mimetype,
    patientId,
    clinicId,
  });

  return prisma.patientFile.create({
    data: {
      clinicId,
      patientId,
      fileName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      storageKey: uploaded.storageKey,
      publicUrl: uploaded.publicUrl,
    },
    select: {
      id: true,
      fileName: true,
      mimeType: true,
      sizeBytes: true,
      publicUrl: true,
      createdAt: true,
    },
  });
}

async function assertPatientInClinic(clinicId: string, patientId: string): Promise<void> {
  const p = await prisma.patient.findFirst({
    where: { id: patientId, clinicId },
    select: { id: true },
  });
  if (!p) {
    throw new AppError("Patient not found", 404, "PATIENT_NOT_FOUND");
  }
}
