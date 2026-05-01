import type { InvoiceDto, InvoiceStatus, PaymentMethod } from "../types/invoice";

import { apiFetch, openAuthedPdf } from "./api";

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
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") search.set(k, v);
  }
  const suffix = search.toString() ? `?${search.toString()}` : "";
  const res = await apiFetch<ApiEnvelope<InvoiceDto[]>>(`/invoices${suffix}`);
  return res.data;
}

export async function fetchInvoice(id: string): Promise<InvoiceDto> {
  const res = await apiFetch<ApiEnvelope<InvoiceDto>>(`/invoices/${id}`);
  return res.data;
}

export async function createInvoiceFromAppointment(
  appointmentId: string,
  options: { discount?: number; notes?: string } = {},
): Promise<InvoiceDto> {
  const res = await apiFetch<ApiEnvelope<InvoiceDto>>(`/invoices`, {
    method: "POST",
    body: JSON.stringify({ appointmentId, ...options }),
  });
  return res.data;
}

export async function updateInvoice(
  id: string,
  body: { discount?: number; notes?: string; dueDate?: string },
): Promise<InvoiceDto> {
  const res = await apiFetch<ApiEnvelope<InvoiceDto>>(`/invoices/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return res.data;
}

export async function addInvoicePayment(
  id: string,
  body: { amount: number; method: PaymentMethod; referenceNo?: string; notes?: string },
): Promise<InvoiceDto> {
  const res = await apiFetch<ApiEnvelope<InvoiceDto>>(`/invoices/${id}/payments`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return res.data;
}

export async function createPaymongoLink(
  id: string,
  method: "GCASH" | "MAYA" = "GCASH",
): Promise<{ url: string; checkoutUrl: string; mock: boolean; linkId: string | null }> {
  const res = await apiFetch<
    ApiEnvelope<{ url: string; checkoutUrl: string; mock: boolean; linkId: string | null }>
  >(`/invoices/${id}/paymongo`, {
    method: "POST",
    body: JSON.stringify({ method }),
  });
  return res.data;
}

export async function simulatePaymongoPaid(id: string): Promise<InvoiceDto> {
  const res = await apiFetch<ApiEnvelope<InvoiceDto>>(`/invoices/${id}/paymongo/simulate`, {
    method: "POST",
    body: "{}",
  });
  return res.data;
}

export async function deleteInvoice(id: string): Promise<void> {
  await apiFetch<ApiEnvelope<{ id: string }>>(`/invoices/${id}`, { method: "DELETE" });
}

/**
 * PDF dosyasını indir ve yeni sekmede aç. 401’de refresh token ile bir kez yeniden dener (`openAuthedPdf`).
 */
export async function openInvoicePdf(id: string): Promise<void> {
  await openAuthedPdf(`/invoices/${id}/pdf`);
}

/** PhilHealth numarası olan hastalar için; resmi CF1/2 değil, iç çalışma özeti. */
export async function openPhilhealthWorksheetPdf(id: string): Promise<void> {
  await openAuthedPdf(`/invoices/${id}/philhealth-worksheet`);
}
