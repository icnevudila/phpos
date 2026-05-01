import type { Request, Response } from "express";
import { z } from "zod";

import {
  addHmoClaimAttachment,
  createHmoClaim,
  createHmoProvider,
  createPatientHmo,
  buildHmoClaimsReconciliationCsv,
  deleteHmoClaimAttachment,
  deletePatientHmo,
  getHmoClaim,
  getHmoClaimAttachmentDownload,
  listHmoClaims,
  listHmoProviders,
  listPatientHmo,
  updateHmoClaim,
  updateHmoProvider,
  updatePatientHmo,
} from "../services/hmo.service.js";
import { AppError } from "../utils/errors.js";
import {
  createHmoClaimSchema,
  createHmoProviderSchema,
  createPatientHmoSchema,
  hmoClaimAttachmentKindSchema,
  listHmoClaimsQuerySchema,
  updateHmoClaimSchema,
  updateHmoProviderSchema,
  updatePatientHmoSchema,
} from "../validation/hmo.schemas.js";

function clinicId(req: Request): string {
  const id = req.user?.clinicId;
  if (!id) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  return id;
}

export async function listHmoProvidersHandler(req: Request, res: Response): Promise<void> {
  const data = await listHmoProviders(clinicId(req));
  res.json({ success: true, data });
}

export async function createHmoProviderHandler(req: Request, res: Response): Promise<void> {
  const body = createHmoProviderSchema.parse(req.body);
  const data = await createHmoProvider(clinicId(req), body);
  res.status(201).json({ success: true, data });
}

export async function updateHmoProviderHandler(req: Request, res: Response): Promise<void> {
  const id = z.string().min(1).parse(req.params.id);
  const body = updateHmoProviderSchema.parse(req.body);
  const data = await updateHmoProvider(clinicId(req), id, body);
  res.json({ success: true, data });
}

export async function listPatientHmoHandler(req: Request, res: Response): Promise<void> {
  const patientId = z.string().min(1).parse(req.params.id);
  const data = await listPatientHmo(clinicId(req), patientId);
  res.json({ success: true, data });
}

export async function createPatientHmoHandler(req: Request, res: Response): Promise<void> {
  const patientId = z.string().min(1).parse(req.params.id);
  const body = createPatientHmoSchema.parse(req.body);
  const data = await createPatientHmo(clinicId(req), patientId, body);
  res.status(201).json({ success: true, data });
}

export async function updatePatientHmoHandler(req: Request, res: Response): Promise<void> {
  const patientId = z.string().min(1).parse(req.params.id);
  const membershipId = z.string().min(1).parse(req.params.membershipId);
  const body = updatePatientHmoSchema.parse(req.body);
  const data = await updatePatientHmo(clinicId(req), patientId, membershipId, body);
  res.json({ success: true, data });
}

export async function deletePatientHmoHandler(req: Request, res: Response): Promise<void> {
  const patientId = z.string().min(1).parse(req.params.id);
  const membershipId = z.string().min(1).parse(req.params.membershipId);
  await deletePatientHmo(clinicId(req), patientId, membershipId);
  res.json({ success: true, data: { id: membershipId } });
}

export async function listHmoClaimsHandler(req: Request, res: Response): Promise<void> {
  const q = listHmoClaimsQuerySchema.parse(req.query);
  const data = await listHmoClaims(clinicId(req), q);
  res.json({ success: true, data });
}

export async function downloadHmoClaimsReconciliationCsvHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const query = z.object({
    year: z.coerce.number().int().min(2020).max(2100),
    month: z.coerce.number().int().min(1).max(12),
    providerId: z.string().min(1).optional(),
  }).parse(req.query);
  const { fileName, csv } = await buildHmoClaimsReconciliationCsv({
    clinicId: clinicId(req),
    year: query.year,
    month: query.month,
    providerId: query.providerId,
  });
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.send(csv);
}

export async function getHmoClaimHandler(req: Request, res: Response): Promise<void> {
  const id = z.string().min(1).parse(req.params.id);
  const data = await getHmoClaim(clinicId(req), id);
  res.json({ success: true, data });
}

export async function createHmoClaimHandler(req: Request, res: Response): Promise<void> {
  const body = createHmoClaimSchema.parse(req.body);
  const data = await createHmoClaim(clinicId(req), body);
  res.status(201).json({ success: true, data });
}

export async function updateHmoClaimHandler(req: Request, res: Response): Promise<void> {
  const id = z.string().min(1).parse(req.params.id);
  const body = updateHmoClaimSchema.parse(req.body);
  const data = await updateHmoClaim(clinicId(req), id, body);
  res.json({ success: true, data });
}

export async function uploadHmoClaimAttachmentHandler(req: Request, res: Response): Promise<void> {
  const claimId = z.string().min(1).parse(req.params.id);
  const file = req.file;
  if (!file?.buffer) {
    res.status(400).json({
      success: false,
      error: "File is required (field name: file)",
      code: "FILE_REQUIRED",
    });
    return;
  }
  const kind = hmoClaimAttachmentKindSchema.parse(req.body?.kind);
  const data = await addHmoClaimAttachment(clinicId(req), claimId, file, kind);
  res.status(201).json({ success: true, data });
}

export async function downloadHmoClaimAttachmentHandler(req: Request, res: Response): Promise<void> {
  const claimId = z.string().min(1).parse(req.params.id);
  const attachmentId = z.string().min(1).parse(req.params.attachmentId);
  const { buffer, fileName, mimeType } = await getHmoClaimAttachmentDownload(
    clinicId(req),
    claimId,
    attachmentId,
  );
  res.setHeader("Content-Type", mimeType);
  res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(fileName)}"`);
  res.end(buffer);
}

export async function deleteHmoClaimAttachmentHandler(req: Request, res: Response): Promise<void> {
  const claimId = z.string().min(1).parse(req.params.id);
  const attachmentId = z.string().min(1).parse(req.params.attachmentId);
  await deleteHmoClaimAttachment(clinicId(req), claimId, attachmentId);
  res.json({ success: true, data: { id: attachmentId } });
}
