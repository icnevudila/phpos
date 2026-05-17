import api, { openAuthedPdf } from "./api";
import type { InvoiceDto, InvoiceStatus, PaymentMethod } from "../types/invoice";

interface ApiEnvelope<T> {
  success: true;
  data: T;
}

export interface ListInvoicesParams {
  patientId?: string;
  status?: InvoiceStatus;
  from?: string;
  to?: string;
  q?: string;
  /** Backend: `1` veya `true` — açık HMO talebi olan faturalar */
  openHmoClaim?: "1" | "true";
}

export async function fetchInvoices(params: ListInvoicesParams = {}): Promise<InvoiceDto[]> {
  const res = await api.get<ApiEnvelope<InvoiceDto[]>>("/invoices", { params }) as any;
  return res.data;
}

export async function fetchInvoice(id: string): Promise<InvoiceDto> {
  const res = await api.get<ApiEnvelope<InvoiceDto>>(`/invoices/${id}`) as any;
  return res.data;
}

export async function createInvoiceFromAppointment(
  appointmentId: string,
  options: { discount?: number; notes?: string } = {},
): Promise<InvoiceDto> {
  const res = await api.post<ApiEnvelope<InvoiceDto>>(`/invoices`, { appointmentId, ...options }) as any;
  return res.data;
}

export async function updateInvoice(
  id: string,
  body: { discount?: number; notes?: string; dueDate?: string },
): Promise<InvoiceDto> {
  const res = await api.put<ApiEnvelope<InvoiceDto>>(`/invoices/${id}`, body) as any;
  return res.data;
}

export async function addInvoicePayment(
  id: string,
  body: { amount: number; method: PaymentMethod; referenceNo?: string; notes?: string },
): Promise<InvoiceDto> {
  const res = await api.post<ApiEnvelope<InvoiceDto>>(`/invoices/${id}/payments`, body) as any;
  return res.data;
}

export async function createPaymongoLink(
  id: string,
  method: "GCASH" | "MAYA" = "GCASH",
): Promise<{ url: string; checkoutUrl: string; mock: boolean; linkId: string | null }> {
  const res = await api.post<
    ApiEnvelope<{ url: string; checkoutUrl: string; mock: boolean; linkId: string | null }>
  >(`/invoices/${id}/paymongo`, { method }) as any;
  return res.data;
}

export async function simulatePaymongoPaid(id: string): Promise<InvoiceDto> {
  const res = await api.post<ApiEnvelope<InvoiceDto>>(`/invoices/${id}/paymongo/simulate`, {}) as any;
  return res.data;
}

export async function deleteInvoice(id: string): Promise<void> {
  await api.delete(`/invoices/${id}`);
}

/**
 * PDF dosyasını indir ve yeni sekmede aç. 401’de refresh token ile bir kez yeniden dener (`openAuthedPdf`).
 */
export async function openInvoicePdf(id: string): Promise<void> {
  await openAuthedPdf(`/invoices/${id}/pdf`);
}

export async function openPhilhealthWorksheetPdf(id: string): Promise<void> {
  await openAuthedPdf(`/invoices/${id}/philhealth-worksheet`);
}

/** BIR Form 2307 (Certificate of Creditable Tax Withheld at Source). */
export async function openBir2307Pdf(id: string): Promise<void> {
  await openAuthedPdf(`/invoices/${id}/bir-2307`);
}
