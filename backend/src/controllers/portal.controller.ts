import type { Request, Response } from "express";
import { z } from "zod";

import { prisma } from "../lib/prisma.js";
import { createPaymongoCheckout } from "../services/invoice.service.js";
import { generateInvoicePdf } from "../services/invoicePdf.js";
import { getPatientFileDownload, listPatientFiles } from "../services/patient.service.js";
import { normalizePhPhone } from "../services/notification/phone.js";
import { sendSMS } from "../services/notification/smsService.js";
import {
  bookPortalAppointment,
  cancelPortalAppointment,
  getPortalAvailability,
  getPortalChart,
  getPortalHistory,
  getPortalHome,
  getPortalMe,
  getPortalMedicalHistory,
  listPortalAppointments,
  listPortalDentists,
  updatePortalMedicalHistory,
} from "../services/portal/portalService.js";
import { createOtp, verifyOtp } from "../services/portal/otpService.js";
import { AppError } from "../utils/errors.js";
import { signPortalToken } from "../utils/portalJwt.js";

function bearerPatient(req: Request): { patientId: string; clinicId: string } {
  if (!req.portal) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  return { patientId: req.portal.sub, clinicId: req.portal.clinicId };
}

// ───────── Auth ─────────

const requestOtpSchema = z.object({
  slug: z.string().min(1),
  phone: z.string().min(1),
});

export async function requestOtpHandler(req: Request, res: Response): Promise<void> {
  const body = requestOtpSchema.parse(req.body);
  const normalized = normalizePhPhone(body.phone);
  if (!normalized) {
    throw new AppError("Invalid PH mobile number", 400, "INVALID_PHONE");
  }

  const clinic = await prisma.clinic.findUnique({
    where: { slug: body.slug },
    select: { id: true, name: true },
  });
  if (!clinic) throw new AppError("Clinic not found", 404, "CLINIC_NOT_FOUND");

  const patient = await prisma.patient.findFirst({
    where: { clinicId: clinic.id, phone: normalized.e164, isActive: true },
    select: { id: true, firstName: true },
  });

  // Enumeration attack önleme: hasta yoksa da aynı cevabı dönüyoruz.
  if (!patient) {
    res.json({
      success: true,
      data: { sent: true, phone: normalized.e164, cooldownSec: 30 },
    });
    return;
  }

  const { code, expiresAt } = await createOtp(clinic.id, normalized.e164);
  const message = `${clinic.name}: OTP ${code}. Valid for 5 minutes. Do not share.`;
  const smsResult = await sendSMS({
    clinicId: clinic.id,
    patientId: patient.id,
    kind: "GENERIC",
    to: normalized.e164,
    message,
  });

  const debugExposeOtp =
    process.env.NODE_ENV !== "production" && !process.env.SEMAPHORE_API_KEY;

  res.json({
    success: true,
    data: {
      sent: true,
      phone: normalized.e164,
      expiresAt: expiresAt.toISOString(),
      provider: smsResult.status,
      cooldownSec: 30,
      ...(debugExposeOtp ? { devCode: code } : {}),
    },
  });
}

const verifyOtpSchema = z.object({
  slug: z.string().min(1),
  phone: z.string().min(1),
  code: z.string().regex(/^\d{6}$/, "6-digit code required"),
});

export async function verifyOtpHandler(req: Request, res: Response): Promise<void> {
  const body = verifyOtpSchema.parse(req.body);
  const normalized = normalizePhPhone(body.phone);
  if (!normalized) throw new AppError("Invalid PH mobile number", 400, "INVALID_PHONE");

  const clinic = await prisma.clinic.findUnique({
    where: { slug: body.slug },
    select: { id: true },
  });
  if (!clinic) throw new AppError("Clinic not found", 404, "CLINIC_NOT_FOUND");

  await verifyOtp(clinic.id, normalized.e164, body.code);

  const patient = await prisma.patient.findFirst({
    where: { clinicId: clinic.id, phone: normalized.e164, isActive: true },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
    },
  });
  if (!patient) throw new AppError("Patient not found", 404, "PATIENT_NOT_FOUND");

  const token = signPortalToken({
    sub: patient.id,
    clinicId: clinic.id,
    phone: patient.phone,
  });

  res.json({
    success: true,
    data: {
      token,
      patient: {
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        phone: patient.phone,
      },
    },
  });
}

// ───────── Resolve clinic ─────────

export async function resolveClinicHandler(req: Request, res: Response): Promise<void> {
  const slug = String(req.params.slug ?? "");
  const clinic = await prisma.clinic.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true, address: true, city: true, phone: true, logoUrl: true },
  });
  if (!clinic) throw new AppError("Clinic not found", 404, "CLINIC_NOT_FOUND");
  res.json({ success: true, data: clinic });
}

// ───────── Me / Home ─────────

export async function meHandler(req: Request, res: Response): Promise<void> {
  const { patientId } = bearerPatient(req);
  const data = await getPortalMe(patientId);
  res.json({ success: true, data });
}

export async function homeHandler(req: Request, res: Response): Promise<void> {
  const { patientId } = bearerPatient(req);
  const data = await getPortalHome(patientId);
  res.json({ success: true, data });
}

// ───────── Booking ─────────

export async function dentistsHandler(req: Request, res: Response): Promise<void> {
  const { clinicId } = bearerPatient(req);
  const data = await listPortalDentists(clinicId);
  res.json({ success: true, data });
}

const availabilityQuery = z.object({
  dentistId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD"),
});

export async function availabilityHandler(req: Request, res: Response): Promise<void> {
  const { clinicId } = bearerPatient(req);
  const q = availabilityQuery.parse(req.query);
  const data = await getPortalAvailability(clinicId, q.dentistId, q.date);
  res.json({ success: true, data });
}

const bookSchema = z.object({
  dentistId: z.string().min(1),
  scheduledAt: z.string().datetime(),
  type: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export async function bookHandler(req: Request, res: Response): Promise<void> {
  const { clinicId, patientId } = bearerPatient(req);
  const body = bookSchema.parse(req.body);
  const data = await bookPortalAppointment(clinicId, patientId, {
    dentistId: body.dentistId,
    scheduledAtIso: body.scheduledAt,
    type: body.type,
    notes: body.notes,
  });
  res.status(201).json({ success: true, data });
}

// ───────── Appointments ─────────

export async function myAppointmentsHandler(req: Request, res: Response): Promise<void> {
  const { patientId } = bearerPatient(req);
  const data = await listPortalAppointments(patientId);
  res.json({ success: true, data });
}

export async function cancelAppointmentHandler(req: Request, res: Response): Promise<void> {
  const { patientId } = bearerPatient(req);
  await cancelPortalAppointment(patientId, String(req.params.id));
  res.json({ success: true, data: { cancelled: true } });
}

// ───────── History ─────────

export async function historyHandler(req: Request, res: Response): Promise<void> {
  const { patientId } = bearerPatient(req);
  const data = await getPortalHistory(patientId);
  res.json({ success: true, data });
}

export async function chartHandler(req: Request, res: Response): Promise<void> {
  const { patientId } = bearerPatient(req);
  const data = await getPortalChart(patientId);
  res.json({ success: true, data });
}

export async function medicalHistoryGetHandler(req: Request, res: Response): Promise<void> {
  const { patientId } = bearerPatient(req);
  const data = await getPortalMedicalHistory(patientId);
  res.json({ success: true, data });
}

export async function medicalHistoryUpdateHandler(req: Request, res: Response): Promise<void> {
  const { patientId } = bearerPatient(req);
  const data = await updatePortalMedicalHistory(patientId, req.body);
  res.json({ success: true, data });
}

// ───────── Files & PDFs ─────────

export async function portalPatientFilesHandler(req: Request, res: Response): Promise<void> {
  const { patientId, clinicId } = bearerPatient(req);
  const data = await listPatientFiles(clinicId, patientId);
  res.json({ success: true, data });
}

export async function portalDownloadPatientFileHandler(req: Request, res: Response): Promise<void> {
  const { patientId, clinicId } = bearerPatient(req);
  const fileId = String(req.params.fileId);
  const { buffer, mimeType, fileName } = await getPatientFileDownload(clinicId, patientId, fileId);
  res.setHeader("Content-Type", mimeType);
  res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(fileName)}"`);
  res.end(buffer);
}

export async function portalDownloadInvoicePdfHandler(req: Request, res: Response): Promise<void> {
  const { patientId, clinicId } = bearerPatient(req);
  const invoiceId = String(req.params.id);
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, patientId, clinicId },
    select: { id: true, orNumber: true },
  });
  if (!invoice) throw new AppError("Invoice not found", 404, "INVOICE_NOT_FOUND");
  const buffer = await generateInvoicePdf(clinicId, invoice.id);
  res.setHeader("Content-Type", "application/pdf");
  const filename = invoice.orNumber ? `Invoice-${invoice.orNumber}.pdf` : `Invoice-${invoice.id}.pdf`;
  res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
  res.end(buffer);
}


export async function portalPaymongoHandler(req: Request, res: Response): Promise<void> {
  const { patientId, clinicId } = bearerPatient(req);
  const invoiceId = String(req.params.id);
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, patientId, clinicId },
    select: { id: true },
  });
  if (!invoice) throw new AppError("Invoice not found", 404, "INVOICE_NOT_FOUND");
  const result = await createPaymongoCheckout(clinicId, invoice.id, { method: "GCASH" });
  res.json({
    success: true,
    data: {
      url: result.url,
      checkoutUrl: result.checkoutUrl,
      linkId: result.linkId,
      mock: result.mock,
    },
  });
}
