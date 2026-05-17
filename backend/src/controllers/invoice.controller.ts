import type { Request, Response } from "express";
import { z } from "zod";

import {
  addPayment,
  createInvoice,
  createPaymongoCheckout,
  deleteInvoice,
  getInvoice,
  handlePaymongoWebhook,
  listInvoices,
  updateInvoice,
} from "../services/invoice.service.js";
import { generateInvoicePdf } from "../services/invoicePdf.js";
import { generatePhilhealthWorksheetPdf } from "../services/philhealthWorksheetPdf.js";
import { generateBir2307Pdf } from "../services/bir2307Pdf.js";
import type { ApiSuccess } from "../types/auth.js";
import { AppError } from "../utils/errors.js";
import { assertPaymongoWebhookRequest } from "../utils/paymongoWebhook.js";
import {
  createInvoiceBodySchema,
  createPaymentBodySchema,
  listInvoicesQuerySchema,
  paymongoBodySchema,
  updateInvoiceBodySchema,
} from "../validation/invoice.schemas.js";

function clinicId(req: Request): string {
  const id = req.user?.clinicId;
  if (!id) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  return id;
}
function userId(req: Request): string {
  const id = req.user?.id;
  if (!id) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  return id;
}

export async function listInvoicesHandler(req: Request, res: Response): Promise<void> {
  const q = listInvoicesQuerySchema.parse(req.query);
  const items = await listInvoices(clinicId(req), q);
  const payload: ApiSuccess<typeof items> = { success: true, data: items };
  res.json(payload);
}

export async function getInvoiceHandler(req: Request, res: Response): Promise<void> {
  const id = z.string().min(1).parse(req.params.id);
  const item = await getInvoice(clinicId(req), id);
  const payload: ApiSuccess<typeof item> = { success: true, data: item };
  res.json(payload);
}

export async function createInvoiceHandler(req: Request, res: Response): Promise<void> {
  const body = createInvoiceBodySchema.parse(req.body);
  const item = await createInvoice(clinicId(req), body);
  const payload: ApiSuccess<typeof item> = { success: true, data: item };
  res.status(201).json(payload);
}

export async function updateInvoiceHandler(req: Request, res: Response): Promise<void> {
  const id = z.string().min(1).parse(req.params.id);
  const body = updateInvoiceBodySchema.parse(req.body);
  const item = await updateInvoice(clinicId(req), id, body);
  const payload: ApiSuccess<typeof item> = { success: true, data: item };
  res.json(payload);
}

export async function deleteInvoiceHandler(req: Request, res: Response): Promise<void> {
  const id = z.string().min(1).parse(req.params.id);
  await deleteInvoice(clinicId(req), id);
  const payload: ApiSuccess<{ id: string }> = { success: true, data: { id } };
  res.json(payload);
}

export async function addPaymentHandler(req: Request, res: Response): Promise<void> {
  const id = z.string().min(1).parse(req.params.id);
  const body = createPaymentBodySchema.parse(req.body);
  const item = await addPayment(clinicId(req), id, body, userId(req));
  const payload: ApiSuccess<typeof item> = { success: true, data: item };
  res.status(201).json(payload);
}

export async function paymongoCheckoutHandler(req: Request, res: Response): Promise<void> {
  const id = z.string().min(1).parse(req.params.id);
  const body = paymongoBodySchema.parse(req.body);
  const result = await createPaymongoCheckout(clinicId(req), id, body);
  const payload: ApiSuccess<typeof result> = { success: true, data: result };
  res.json(payload);
}

export async function paymongoWebhookHandler(req: Request, res: Response): Promise<void> {
  assertPaymongoWebhookRequest(req);
  await handlePaymongoWebhook(req.body);
  res.json({ success: true, data: { received: true } });
}

export async function invoicePdfHandler(req: Request, res: Response): Promise<void> {
  const id = z.string().min(1).parse(req.params.id);
  const buffer = await generateInvoicePdf(clinicId(req), id);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="invoice-${id}.pdf"`);
  res.end(buffer);
}

export async function philhealthWorksheetPdfHandler(req: Request, res: Response): Promise<void> {
  const id = z.string().min(1).parse(req.params.id);
  const buffer = await generatePhilhealthWorksheetPdf(clinicId(req), id);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="philhealth-worksheet-${id}.pdf"`);
  res.end(buffer);
}

export async function simulatePaymongoPaidHandler(req: Request, res: Response): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    throw new AppError("PayMongo simulate is disabled in production", 403, "SIMULATE_DISABLED");
  }
  const id = z.string().min(1).parse(req.params.id);
  await handlePaymongoWebhook({ simulate: true, invoiceId: id });
  const item = await getInvoice(clinicId(req), id);
  res.json({ success: true, data: item });
}

export async function bir2307PdfHandler(req: Request, res: Response): Promise<void> {
  const id = z.string().min(1).parse(req.params.id);
  const buffer = await generateBir2307Pdf(clinicId(req), id);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="bir-2307-${id}.pdf"`);
  res.end(buffer);
}
