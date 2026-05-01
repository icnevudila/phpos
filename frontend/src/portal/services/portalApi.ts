import { apiBaseUrl } from "../../services";

const PORTAL_TOKEN_KEY = "dentease_portal_token";
const PORTAL_PATIENT_KEY = "dentease_portal_patient";

export interface PortalPatient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface PortalClinic {
  id: string;
  slug: string;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  logoUrl: string | null;
}

export interface PortalHome {
  patient: { firstName: string; lastName: string };
  nextAppointment: {
    id: string;
    scheduledAt: string;
    localDate: string;
    localTime: string;
    dentistName: string;
    type: string | null;
    status: string;
    canCancel: boolean;
  } | null;
  lastInvoice: {
    id: string;
    orNumber: string | null;
    total: string;
    status: string;
    remaining: string;
    createdAt: string;
  } | null;
  unpaidCount: number;
}

export interface PortalDentist {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  initials: string;
}

export interface PortalAvailability {
  date: string;
  closed: boolean;
  reason?: string;
  slots: Array<{ time: string; iso: string; available: boolean }>;
}

export interface PortalAppointment {
  id: string;
  scheduledAt: string;
  localDate: string;
  localTime: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  type: string | null;
  dentistName: string;
  canCancel: boolean;
  isPast: boolean;
}

export interface PortalHistory {
  treatments: Array<{
    id: string;
    localDate: string;
    procedure: string;
    quantity: number;
    total: string;
    dentistName: string;
    appointmentId: string;
  }>;
  invoices: Array<{
    id: string;
    orNumber: string | null;
    status: string;
    total: string;
    remaining: string;
    createdAt: string;
    isPayable: boolean;
  }>;
  totals: { paidAllTime: string; outstanding: string };
}

export function savePortalSession(token: string, patient: PortalPatient): void {
  localStorage.setItem(PORTAL_TOKEN_KEY, token);
  localStorage.setItem(PORTAL_PATIENT_KEY, JSON.stringify(patient));
}

export function loadPortalPatient(): PortalPatient | null {
  const raw = localStorage.getItem(PORTAL_PATIENT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PortalPatient;
  } catch {
    return null;
  }
}

export function clearPortalSession(): void {
  localStorage.removeItem(PORTAL_TOKEN_KEY);
  localStorage.removeItem(PORTAL_PATIENT_KEY);
}

export function hasPortalToken(): boolean {
  return Boolean(localStorage.getItem(PORTAL_TOKEN_KEY));
}

interface ApiEnvelopeSuccess<T> {
  success: true;
  data: T;
}
interface ApiEnvelopeFailure {
  success: false;
  error: string;
  code: string;
}

async function portalFetch<T>(
  path: string,
  init: RequestInit = {},
  auth = true,
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (auth) {
    const token = localStorage.getItem(PORTAL_TOKEN_KEY);
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(`${apiBaseUrl}/portal${path}`, { ...init, headers });
  const json = (await res.json().catch(() => ({}))) as
    | ApiEnvelopeSuccess<T>
    | ApiEnvelopeFailure;
  if (!res.ok || !("success" in json) || !json.success) {
    const err = json as ApiEnvelopeFailure;
    throw new PortalApiError(
      err?.error ?? `Request failed: ${res.status}`,
      err?.code ?? "PORTAL_ERROR",
      res.status,
    );
  }
  return json.data;
}

export class PortalApiError extends Error {
  readonly code: string;
  readonly status: number;
  constructor(message: string, code: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

// Public
export function resolveClinic(slug: string): Promise<PortalClinic> {
  return portalFetch<PortalClinic>(`/clinics/${encodeURIComponent(slug)}`, {}, false);
}

export interface RequestOtpResponse {
  sent: boolean;
  phone: string;
  expiresAt?: string;
  cooldownSec: number;
  devCode?: string;
}

export function requestOtp(slug: string, phone: string): Promise<RequestOtpResponse> {
  return portalFetch<RequestOtpResponse>(
    "/auth/request-otp",
    { method: "POST", body: JSON.stringify({ slug, phone }) },
    false,
  );
}

export async function verifyOtp(
  slug: string,
  phone: string,
  code: string,
): Promise<{ token: string; patient: PortalPatient }> {
  const data = await portalFetch<{ token: string; patient: PortalPatient }>(
    "/auth/verify-otp",
    { method: "POST", body: JSON.stringify({ slug, phone, code }) },
    false,
  );
  savePortalSession(data.token, data.patient);
  return data;
}

// Protected
export function fetchPortalHome(): Promise<PortalHome> {
  return portalFetch<PortalHome>("/home");
}

export function fetchPortalDentists(): Promise<PortalDentist[]> {
  return portalFetch<PortalDentist[]>("/dentists");
}

export function fetchPortalAvailability(
  dentistId: string,
  date: string,
): Promise<PortalAvailability> {
  const q = new URLSearchParams({ dentistId, date }).toString();
  return portalFetch<PortalAvailability>(`/availability?${q}`);
}

export interface BookResult {
  id: string;
  scheduledAt: string;
  status: string;
}

export function bookAppointment(body: {
  dentistId: string;
  scheduledAt: string;
  type?: string;
  notes?: string;
}): Promise<BookResult> {
  return portalFetch<BookResult>("/appointments", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function fetchPortalAppointments(): Promise<PortalAppointment[]> {
  return portalFetch<PortalAppointment[]>("/appointments");
}

export function cancelPortalAppointment(id: string): Promise<{ cancelled: boolean }> {
  return portalFetch<{ cancelled: boolean }>(`/appointments/${id}/cancel`, {
    method: "POST",
  });
}

export function fetchPortalHistory(): Promise<PortalHistory> {
  return portalFetch<PortalHistory>("/history");
}

export interface PortalPatientFile {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  publicUrl: string | null;
  createdAt: string;
}

export function fetchPortalFiles(): Promise<PortalPatientFile[]> {
  return portalFetch<PortalPatientFile[]>("/files");
}

export function getPortalInvoicePdfUrl(invoiceId: string): string {
  const token = localStorage.getItem(PORTAL_TOKEN_KEY);
  const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";
  return `${baseUrl}/portal/invoices/${invoiceId}/pdf?portalToken=${token}`;
}

export function getPortalFileDownloadUrl(fileId: string): string {
  const token = localStorage.getItem(PORTAL_TOKEN_KEY);
  const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";
  return `${baseUrl}/portal/files/${fileId}/download?portalToken=${token}`;
}

/** PayMongo checkout — staff `/invoices` değil, portal JWT ile `/portal/invoices/...` */
export interface PortalPaymongoCheckout {
  url: string;
  checkoutUrl: string;
  linkId: string | null;
  mock: boolean;
}

export function startPortalInvoicePaymongo(invoiceId: string): Promise<PortalPaymongoCheckout> {
  return portalFetch<PortalPaymongoCheckout>(`/invoices/${encodeURIComponent(invoiceId)}/paymongo`, {
    method: "POST",
  });
}

export function fetchPortalMedicalHistory(): Promise<any> {
  return portalFetch<any>("/medical-history");
}

export function updatePortalMedicalHistory(data: any): Promise<any> {
  return portalFetch<any>("/medical-history", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
