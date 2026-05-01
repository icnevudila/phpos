import { HmoClaimStatus, Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma.js";
import {
  deleteLocalStorageFile,
  readLocalPatientFileBuffer,
  uploadHmoClaimAttachment,
} from "./patientFileStorage.js";
import { AppError } from "../utils/errors.js";
import type {
  CreateHmoClaimInput,
  CreateHmoProviderInput,
  CreatePatientHmoInput,
  HmoClaimAttachmentKind,
  ListHmoClaimsQuery,
  UpdateHmoClaimInput,
  UpdateHmoProviderInput,
  UpdatePatientHmoInput,
} from "../validation/hmo.schemas.js";

const MONEY_SCALE = 100;

const providerSelect = {
  id: true,
  clinicId: true,
  name: true,
  code: true,
  contactPhone: true,
  contactEmail: true,
  notes: true,
  isActive: true,
  createdAt: true,
} satisfies Prisma.HmoProviderSelect;

const claimCoreSelect = {
  id: true,
  clinicId: true,
  patientId: true,
  invoiceId: true,
  providerId: true,
  patientHmoId: true,
  claimNumber: true,
  status: true,
  requestedAmount: true,
  approvedAmount: true,
  patientCopay: true,
  externalRef: true,
  submittedAt: true,
  decidedAt: true,
  paidAt: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  provider: { select: { id: true, name: true, code: true } },
  patient: { select: { id: true, firstName: true, lastName: true } },
  invoice: { select: { id: true, total: true, status: true } },
} satisfies Prisma.HmoClaimSelect;

const claimListSelect = {
  ...claimCoreSelect,
  _count: { select: { lines: true } },
};

const claimDetailSelect = {
  ...claimCoreSelect,
  lines: {
    orderBy: { createdAt: "asc" as const },
    select: {
      id: true,
      lineAmount: true,
      createdAt: true,
      treatment: {
        select: {
          id: true,
          procedure: true,
          toothIds: true,
          quantity: true,
          unitPrice: true,
          notes: true,
        },
      },
    },
  },
  attachments: {
    orderBy: { createdAt: "desc" as const },
    select: {
      id: true,
      fileName: true,
      mimeType: true,
      sizeBytes: true,
      kind: true,
      createdAt: true,
    },
  },
};

const patientHmoSelect = {
  id: true,
  patientId: true,
  providerId: true,
  memberNumber: true,
  cardholderName: true,
  sponsor: true,
  validFrom: true,
  validUntil: true,
  isPrimary: true,
  createdAt: true,
  provider: { select: { id: true, name: true, code: true } },
} satisfies Prisma.PatientHmoSelect;

type ClaimListRow = Prisma.HmoClaimGetPayload<{ select: typeof claimListSelect }>;
type ClaimDetailRow = Prisma.HmoClaimGetPayload<{ select: typeof claimDetailSelect }>;

function toProviderDto(row: Prisma.HmoProviderGetPayload<{ select: typeof providerSelect }>) {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
  };
}

function toClaimListDto(row: ClaimListRow) {
  const { _count, requestedAmount, approvedAmount, patientCopay, invoice, ...r } = row;
  return {
    ...r,
    requestedAmount: requestedAmount.toFixed(2),
    approvedAmount: approvedAmount?.toFixed(2) ?? null,
    patientCopay: patientCopay.toFixed(2),
    invoice: { ...invoice, total: invoice.total.toFixed(2) },
    submittedAt: row.submittedAt?.toISOString() ?? null,
    decidedAt: row.decidedAt?.toISOString() ?? null,
    paidAt: row.paidAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    lineCount: _count.lines,
  };
}

function toClaimDetailDto(row: ClaimDetailRow) {
  return {
    id: row.id,
    clinicId: row.clinicId,
    patientId: row.patientId,
    invoiceId: row.invoiceId,
    providerId: row.providerId,
    patientHmoId: row.patientHmoId,
    claimNumber: row.claimNumber,
    status: row.status,
    requestedAmount: row.requestedAmount.toFixed(2),
    approvedAmount: row.approvedAmount?.toFixed(2) ?? null,
    patientCopay: row.patientCopay.toFixed(2),
    externalRef: row.externalRef,
    submittedAt: row.submittedAt?.toISOString() ?? null,
    decidedAt: row.decidedAt?.toISOString() ?? null,
    paidAt: row.paidAt?.toISOString() ?? null,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    provider: row.provider,
    patient: row.patient,
    invoice: { ...row.invoice, total: row.invoice.total.toFixed(2) },
    lineCount: row.lines.length,
    lines: row.lines.map((ln) => ({
      id: ln.id,
      lineAmount: ln.lineAmount.toFixed(2),
      createdAt: ln.createdAt.toISOString(),
      treatment: {
        id: ln.treatment.id,
        procedure: ln.treatment.procedure,
        toothIds: ln.treatment.toothIds,
        quantity: ln.treatment.quantity,
        unitPrice: ln.treatment.unitPrice.toFixed(2),
        notes: ln.treatment.notes,
      },
    })),
    attachments: row.attachments.map((a) => ({
      id: a.id,
      fileName: a.fileName,
      mimeType: a.mimeType,
      sizeBytes: a.sizeBytes,
      kind: a.kind as HmoClaimAttachmentKind,
      createdAt: a.createdAt.toISOString(),
    })),
  };
}

function toPatientHmoDto(row: Prisma.PatientHmoGetPayload<{ select: typeof patientHmoSelect }>) {
  return {
    ...row,
    validFrom: row.validFrom?.toISOString() ?? null,
    validUntil: row.validUntil?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

async function assertPatientInClinic(clinicId: string, patientId: string): Promise<void> {
  const p = await prisma.patient.findFirst({ where: { id: patientId, clinicId }, select: { id: true } });
  if (!p) throw new AppError("Patient not found", 404, "PATIENT_NOT_FOUND");
}

async function assertProviderInClinic(clinicId: string, providerId: string): Promise<void> {
  const p = await prisma.hmoProvider.findFirst({
    where: { id: providerId, clinicId },
    select: { id: true },
  });
  if (!p) throw new AppError("HMO provider not found", 404, "HMO_PROVIDER_NOT_FOUND");
}

async function nextClaimNumber(tx: Prisma.TransactionClient, clinicId: string): Promise<string> {
  const year = new Date().getFullYear();
  const seq = await tx.hmoClaimSequence.upsert({
    where: { clinicId_year: { clinicId, year } },
    update: { lastNumber: { increment: 1 } },
    create: { clinicId, year, lastNumber: 1 },
    select: { lastNumber: true },
  });
  return `CLM-${year}-${String(seq.lastNumber).padStart(4, "0")}`;
}

export async function listHmoProviders(clinicId: string) {
  const rows = await prisma.hmoProvider.findMany({
    where: { clinicId },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    select: providerSelect,
  });
  return rows.map(toProviderDto);
}

export async function createHmoProvider(clinicId: string, body: CreateHmoProviderInput) {
  const row = await prisma.hmoProvider.create({
    data: {
      clinicId,
      name: body.name.trim(),
      code: body.code.trim().toUpperCase(),
      contactPhone: body.contactPhone?.trim() || null,
      contactEmail: body.contactEmail?.trim() || null,
      notes: body.notes?.trim() || null,
      isActive: body.isActive ?? true,
    },
    select: providerSelect,
  });
  return toProviderDto(row);
}

export async function updateHmoProvider(clinicId: string, id: string, body: UpdateHmoProviderInput) {
  await assertProviderInClinic(clinicId, id);
  const row = await prisma.hmoProvider.update({
    where: { id },
    data: {
      ...(body.name !== undefined ? { name: body.name.trim() } : {}),
      ...(body.code !== undefined ? { code: body.code.trim().toUpperCase() } : {}),
      ...(body.contactPhone !== undefined ? { contactPhone: body.contactPhone?.trim() || null } : {}),
      ...(body.contactEmail !== undefined ? { contactEmail: body.contactEmail?.trim() || null } : {}),
      ...(body.notes !== undefined ? { notes: body.notes?.trim() || null } : {}),
      ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
    },
    select: providerSelect,
  });
  return toProviderDto(row);
}

export async function listPatientHmo(clinicId: string, patientId: string) {
  await assertPatientInClinic(clinicId, patientId);
  const rows = await prisma.patientHmo.findMany({
    where: { patientId, patient: { clinicId } },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
    select: patientHmoSelect,
  });
  return rows.map(toPatientHmoDto);
}

export async function createPatientHmo(clinicId: string, patientId: string, body: CreatePatientHmoInput) {
  await assertPatientInClinic(clinicId, patientId);
  await assertProviderInClinic(clinicId, body.providerId);
  const row = await prisma.$transaction(async (tx) => {
    if (body.isPrimary) {
      await tx.patientHmo.updateMany({ where: { patientId }, data: { isPrimary: false } });
    }
    return tx.patientHmo.create({
      data: {
        patientId,
        providerId: body.providerId,
        memberNumber: body.memberNumber.trim(),
        cardholderName: body.cardholderName?.trim() || null,
        sponsor: body.sponsor?.trim() || null,
        validFrom: body.validFrom ?? null,
        validUntil: body.validUntil ?? null,
        isPrimary: body.isPrimary,
      },
      select: patientHmoSelect,
    });
  });
  return toPatientHmoDto(row);
}

export async function updatePatientHmo(
  clinicId: string,
  patientId: string,
  membershipId: string,
  body: UpdatePatientHmoInput,
) {
  await assertPatientInClinic(clinicId, patientId);
  const membership = await prisma.patientHmo.findFirst({
    where: { id: membershipId, patientId, patient: { clinicId } },
    select: { id: true },
  });
  if (!membership) throw new AppError("Patient HMO membership not found", 404, "PATIENT_HMO_NOT_FOUND");
  if (body.providerId) await assertProviderInClinic(clinicId, body.providerId);

  const row = await prisma.$transaction(async (tx) => {
    if (body.isPrimary === true) {
      await tx.patientHmo.updateMany({
        where: { patientId, id: { not: membershipId } },
        data: { isPrimary: false },
      });
    }
    return tx.patientHmo.update({
      where: { id: membershipId },
      data: {
        ...(body.providerId !== undefined ? { providerId: body.providerId } : {}),
        ...(body.memberNumber !== undefined ? { memberNumber: body.memberNumber.trim() } : {}),
        ...(body.cardholderName !== undefined
          ? { cardholderName: body.cardholderName?.trim() || null }
          : {}),
        ...(body.sponsor !== undefined ? { sponsor: body.sponsor?.trim() || null } : {}),
        ...(body.validFrom !== undefined ? { validFrom: body.validFrom ?? null } : {}),
        ...(body.validUntil !== undefined ? { validUntil: body.validUntil ?? null } : {}),
        ...(body.isPrimary !== undefined ? { isPrimary: body.isPrimary } : {}),
      },
      select: patientHmoSelect,
    });
  });
  return toPatientHmoDto(row);
}

export async function deletePatientHmo(clinicId: string, patientId: string, membershipId: string): Promise<void> {
  await assertPatientInClinic(clinicId, patientId);
  const membership = await prisma.patientHmo.findFirst({
    where: { id: membershipId, patientId, patient: { clinicId } },
    select: { id: true },
  });
  if (!membership) throw new AppError("Patient HMO membership not found", 404, "PATIENT_HMO_NOT_FOUND");
  await prisma.patientHmo.delete({ where: { id: membershipId } });
}

/** Yeni kayıt = DRAFT’tan başlar; güncellemede `from` mevcut durumdur. PAID yalnızca onay sonrası. */
function assertAllowedHmoClaimStatusTransition(from: HmoClaimStatus, to: HmoClaimStatus): void {
  if (from === to) return;
  const allowed: Record<HmoClaimStatus, HmoClaimStatus[]> = {
    DRAFT: [HmoClaimStatus.SUBMITTED],
    SUBMITTED: [
      HmoClaimStatus.DRAFT,
      HmoClaimStatus.APPROVED,
      HmoClaimStatus.PARTIAL_APPROVED,
      HmoClaimStatus.REJECTED,
    ],
    APPROVED: [HmoClaimStatus.PAID],
    PARTIAL_APPROVED: [HmoClaimStatus.PAID, HmoClaimStatus.APPROVED],
    REJECTED: [HmoClaimStatus.SUBMITTED],
    PAID: [],
  };
  if (!allowed[from].includes(to)) {
    throw new AppError(
      `Invalid HMO claim status transition (${from} → ${to})`,
      422,
      "HMO_CLAIM_INVALID_STATUS_TRANSITION",
    );
  }
}

export async function listHmoClaims(clinicId: string, q: ListHmoClaimsQuery) {
  const rows = await prisma.hmoClaim.findMany({
    where: {
      clinicId,
      ...(q.status ? { status: q.status } : {}),
      ...(q.providerId ? { providerId: q.providerId } : {}),
      ...(q.patientId ? { patientId: q.patientId } : {}),
    },
    orderBy: [{ createdAt: "desc" }],
    take: q.limit,
    select: claimListSelect,
  });
  return rows.map(toClaimListDto);
}

function csvEscape(value: string | number | null): string {
  const raw = value === null ? "" : String(value);
  if (raw.includes(",") || raw.includes('"') || raw.includes("\n")) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

export async function buildHmoClaimsReconciliationCsv(params: {
  clinicId: string;
  year: number;
  month: number;
  providerId?: string;
}): Promise<{ fileName: string; csv: string }> {
  const mm = String(params.month).padStart(2, "0");
  const from = new Date(`${params.year}-${mm}-01T00:00:00+08:00`);
  const nextMonth = params.month === 12 ? 1 : params.month + 1;
  const nextYear = params.month === 12 ? params.year + 1 : params.year;
  const to = new Date(`${nextYear}-${String(nextMonth).padStart(2, "0")}-01T00:00:00+08:00`);

  const rows = await prisma.hmoClaim.findMany({
    where: {
      clinicId: params.clinicId,
      createdAt: { gte: from, lt: to },
      ...(params.providerId ? { providerId: params.providerId } : {}),
    },
    orderBy: [{ createdAt: "asc" }],
    select: {
      claimNumber: true,
      status: true,
      requestedAmount: true,
      approvedAmount: true,
      patientCopay: true,
      createdAt: true,
      paidAt: true,
      provider: { select: { code: true, name: true } },
      patient: { select: { firstName: true, lastName: true } },
    },
  });

  let pendingTotal = 0;
  let paidTotal = 0;
  const pendingStatuses: HmoClaimStatus[] = [
    HmoClaimStatus.DRAFT,
    HmoClaimStatus.SUBMITTED,
    HmoClaimStatus.PARTIAL_APPROVED,
  ];

  const dataRows = rows.map((r) => {
    const approved = Number(r.approvedAmount ?? 0);
    if (r.status === HmoClaimStatus.PAID) paidTotal += approved;
    if (pendingStatuses.includes(r.status)) {
      pendingTotal += approved || Number(r.requestedAmount);
    }

    return [
      r.claimNumber,
      r.provider.code,
      r.provider.name,
      `${r.patient.firstName} ${r.patient.lastName}`.trim(),
      r.status,
      Number(r.requestedAmount).toFixed(2),
      r.approvedAmount ? Number(r.approvedAmount).toFixed(2) : "",
      Number(r.patientCopay).toFixed(2),
      r.createdAt.toISOString().slice(0, 10),
      r.paidAt ? r.paidAt.toISOString().slice(0, 10) : "",
    ]
      .map(csvEscape)
      .join(",");
  });

  const header = [
    "claimNumber",
    "providerCode",
    "providerName",
    "patientName",
    "status",
    "requestedAmount",
    "approvedAmount",
    "patientCopay",
    "createdDate",
    "paidDate",
  ].join(",");
  const summaryHeader = "summaryKey,amount";
  const summaryRows = [
    `pendingTotal,${pendingTotal.toFixed(2)}`,
    `paidTotal,${paidTotal.toFixed(2)}`,
  ];
  const csv = [header, ...dataRows, "", summaryHeader, ...summaryRows].join("\n");

  const fileName = `hmo-reconciliation-${params.year}-${mm}${params.providerId ? `-${params.providerId}` : ""}.csv`;
  return { fileName, csv };
}

export async function getHmoClaim(clinicId: string, id: string) {
  const row = await prisma.hmoClaim.findFirst({
    where: { id, clinicId },
    select: claimDetailSelect,
  });
  if (!row) throw new AppError("HMO claim not found", 404, "HMO_CLAIM_NOT_FOUND");
  return toClaimDetailDto(row);
}

export async function createHmoClaim(clinicId: string, body: CreateHmoClaimInput) {
  await assertPatientInClinic(clinicId, body.patientId);
  await assertProviderInClinic(clinicId, body.providerId);

  const inv = await prisma.invoice.findFirst({
    where: { id: body.invoiceId, clinicId },
    select: { id: true, patientId: true, appointmentId: true },
  });
  if (!inv) throw new AppError("Invoice not found", 404, "INVOICE_NOT_FOUND");
  if (inv.patientId !== body.patientId) {
    throw new AppError("Invoice does not belong to this patient", 422, "PATIENT_INVOICE_MISMATCH");
  }

  let patientHmoId: string | null = body.patientHmoId ?? null;
  if (patientHmoId) {
    const ph = await prisma.patientHmo.findFirst({
      where: {
        id: patientHmoId,
        patientId: body.patientId,
        providerId: body.providerId,
        patient: { clinicId },
      },
      select: { id: true },
    });
    if (!ph) {
      throw new AppError(
        "Patient HMO membership not found or does not match provider",
        422,
        "PATIENT_HMO_MISMATCH",
      );
    }
  }

  const treatmentIds = body.treatmentIds ?? [];
  let lineCreates: { treatmentId: string; lineAmount: Prisma.Decimal }[] = [];

  if (inv.appointmentId) {
    const allTreatments = await prisma.treatment.findMany({
      where: { appointmentId: inv.appointmentId },
      select: { id: true, quantity: true, unitPrice: true, patientId: true },
    });
    if (allTreatments.some((t) => t.patientId !== body.patientId)) {
      throw new AppError("Treatment data inconsistent with patient", 500, "TREATMENT_PATIENT_MISMATCH");
    }
    if (allTreatments.length > 0 && treatmentIds.length === 0) {
      throw new AppError(
        "Select at least one treatment line for this invoice",
        422,
        "HMO_CLAIM_TREATMENTS_REQUIRED",
      );
    }
    if (treatmentIds.length > 0) {
      const idSet = new Set(allTreatments.map((t) => t.id));
      if (!treatmentIds.every((tid) => idSet.has(tid))) {
        throw new AppError(
          "One or more treatments are not on this invoice",
          422,
          "HMO_CLAIM_TREATMENT_INVALID",
        );
      }
      const selected = allTreatments.filter((t) => treatmentIds.includes(t.id));
      let sumCents = 0;
      lineCreates = selected.map((t) => {
        const cents = Math.round(Number(t.unitPrice) * MONEY_SCALE) * t.quantity;
        sumCents += cents;
        return { treatmentId: t.id, lineAmount: new Prisma.Decimal((cents / MONEY_SCALE).toFixed(2)) };
      });
      const reqCents = Math.round(body.requestedAmount * MONEY_SCALE);
      if (Math.abs(reqCents - sumCents) > 1) {
        throw new AppError(
          "Requested amount must match the sum of selected treatment lines",
          422,
          "HMO_CLAIM_AMOUNT_MISMATCH",
        );
      }
    }
  } else if (treatmentIds.length > 0) {
    throw new AppError(
      "This invoice has no appointment; treatment lines cannot be attached to a claim",
      422,
      "HMO_CLAIM_NO_APPOINTMENT",
    );
  }

  const row = await prisma.$transaction(async (tx) => {
    const claimNumber = await nextClaimNumber(tx, clinicId);
    const now = new Date();
    return tx.hmoClaim.create({
      data: {
        clinicId,
        patientId: body.patientId,
        invoiceId: body.invoiceId,
        providerId: body.providerId,
        patientHmoId,
        claimNumber,
        status: body.status,
        requestedAmount: new Prisma.Decimal(body.requestedAmount.toFixed(2)),
        approvedAmount:
          body.approvedAmount !== undefined
            ? new Prisma.Decimal(body.approvedAmount.toFixed(2))
            : null,
        patientCopay: new Prisma.Decimal(body.patientCopay.toFixed(2)),
        externalRef: body.externalRef?.trim() || null,
        notes: body.notes?.trim() || null,
        submittedAt:
          body.status === HmoClaimStatus.SUBMITTED ||
          body.status === HmoClaimStatus.APPROVED ||
          body.status === HmoClaimStatus.PARTIAL_APPROVED ||
          body.status === HmoClaimStatus.PAID
            ? now
            : null,
        decidedAt:
          body.status === HmoClaimStatus.APPROVED ||
          body.status === HmoClaimStatus.PARTIAL_APPROVED ||
          body.status === HmoClaimStatus.REJECTED ||
          body.status === HmoClaimStatus.PAID
            ? now
            : null,
        paidAt: body.status === HmoClaimStatus.PAID ? now : null,
        ...(lineCreates.length
          ? {
              lines: {
                create: lineCreates.map((lc) => ({
                  treatmentId: lc.treatmentId,
                  lineAmount: lc.lineAmount,
                })),
              },
            }
          : {}),
      },
      select: claimDetailSelect,
    });
  });
  return toClaimDetailDto(row);
}

export async function updateHmoClaim(clinicId: string, id: string, body: UpdateHmoClaimInput) {
  const existing = await prisma.hmoClaim.findFirst({
    where: { id, clinicId },
    select: { id: true, status: true, submittedAt: true, decidedAt: true, paidAt: true, _count: { select: { lines: true } } },
  });
  if (!existing) throw new AppError("HMO claim not found", 404, "HMO_CLAIM_NOT_FOUND");

  if (body.requestedAmount !== undefined && existing._count.lines > 0) {
    throw new AppError(
      "Cannot change requested amount when claim has treatment lines",
      422,
      "HMO_CLAIM_LINES_LOCKED",
    );
  }

  if (body.status !== undefined) {
    assertAllowedHmoClaimStatusTransition(existing.status, body.status);
  }

  const withdrawToDraft =
    body.status === HmoClaimStatus.DRAFT && existing.status === HmoClaimStatus.SUBMITTED;
  const resubmitFromRejected =
    body.status === HmoClaimStatus.SUBMITTED && existing.status === HmoClaimStatus.REJECTED;

  const now = new Date();
  const decisionStatuses: HmoClaimStatus[] = [
    HmoClaimStatus.APPROVED,
    HmoClaimStatus.PARTIAL_APPROVED,
    HmoClaimStatus.REJECTED,
    HmoClaimStatus.PAID,
  ];
  const row = await prisma.hmoClaim.update({
    where: { id },
    data: {
      ...(withdrawToDraft ? { submittedAt: null, decidedAt: null, paidAt: null } : {}),
      ...(resubmitFromRejected ? { decidedAt: null, paidAt: null } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.requestedAmount !== undefined
        ? { requestedAmount: new Prisma.Decimal(body.requestedAmount.toFixed(2)) }
        : {}),
      ...(body.approvedAmount !== undefined
        ? {
            approvedAmount:
              body.approvedAmount === null ? null : new Prisma.Decimal(body.approvedAmount.toFixed(2)),
          }
        : {}),
      ...(body.patientCopay !== undefined
        ? { patientCopay: new Prisma.Decimal(body.patientCopay.toFixed(2)) }
        : {}),
      ...(body.externalRef !== undefined ? { externalRef: body.externalRef?.trim() || null } : {}),
      ...(body.notes !== undefined ? { notes: body.notes?.trim() || null } : {}),
      ...(body.status !== undefined && body.status !== HmoClaimStatus.DRAFT && !existing.submittedAt
        ? { submittedAt: now }
        : {}),
      ...(body.status !== undefined &&
      decisionStatuses.includes(body.status) &&
      !existing.decidedAt
        ? { decidedAt: now }
        : {}),
      ...(body.status === HmoClaimStatus.PAID && !existing.paidAt ? { paidAt: now } : {}),
    },
    select: claimDetailSelect,
  });
  return toClaimDetailDto(row);
}

function allowedHmoClaimAttachmentMime(mimetype: string): boolean {
  return mimetype.startsWith("image/") || mimetype === "application/pdf";
}

export async function addHmoClaimAttachment(
  clinicId: string,
  claimId: string,
  file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
  kind: HmoClaimAttachmentKind,
) {
  const claim = await prisma.hmoClaim.findFirst({
    where: { id: claimId, clinicId },
    select: { id: true },
  });
  if (!claim) throw new AppError("HMO claim not found", 404, "HMO_CLAIM_NOT_FOUND");
  if (!allowedHmoClaimAttachmentMime(file.mimetype)) {
    throw new AppError("Unsupported file type", 400, "INVALID_FILE_TYPE");
  }
  const maxBytes = 15 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new AppError("File too large (max 15MB)", 400, "FILE_TOO_LARGE");
  }

  const uploaded = await uploadHmoClaimAttachment({
    buffer: file.buffer,
    originalName: file.originalname,
    mimeType: file.mimetype,
    claimId,
    clinicId,
  });

  const row = await prisma.hmoClaimAttachment.create({
    data: {
      clinicId,
      claimId,
      fileName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      storageKey: uploaded.storageKey,
      kind,
    },
    select: {
      id: true,
      fileName: true,
      mimeType: true,
      sizeBytes: true,
      kind: true,
      createdAt: true,
    },
  });

  return {
    id: row.id,
    fileName: row.fileName,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    kind: row.kind as HmoClaimAttachmentKind,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function deleteHmoClaimAttachment(
  clinicId: string,
  claimId: string,
  attachmentId: string,
): Promise<void> {
  const att = await prisma.hmoClaimAttachment.findFirst({
    where: { id: attachmentId, claimId, clinicId },
    select: { id: true, storageKey: true },
  });
  if (!att) throw new AppError("Attachment not found", 404, "ATTACHMENT_NOT_FOUND");
  await prisma.hmoClaimAttachment.delete({ where: { id: attachmentId } });
  const driver = (process.env.STORAGE_DRIVER ?? "local") as string;
  if (driver === "local") {
    await deleteLocalStorageFile(att.storageKey);
  }
}

export async function getHmoClaimAttachmentDownload(
  clinicId: string,
  claimId: string,
  attachmentId: string,
): Promise<{ buffer: Buffer; fileName: string; mimeType: string }> {
  const att = await prisma.hmoClaimAttachment.findFirst({
    where: { id: attachmentId, claimId, clinicId },
    select: { storageKey: true, fileName: true, mimeType: true },
  });
  if (!att) throw new AppError("Attachment not found", 404, "ATTACHMENT_NOT_FOUND");
  const driver = (process.env.STORAGE_DRIVER ?? "local") as string;
  if (driver !== "local") {
    throw new AppError(
      "Download for this storage driver is not implemented yet; use cloud console or add GetObject",
      501,
      "STORAGE_DOWNLOAD_NOT_IMPLEMENTED",
    );
  }
  const buffer = await readLocalPatientFileBuffer(att.storageKey);
  return { buffer, fileName: att.fileName, mimeType: att.mimeType };
}
