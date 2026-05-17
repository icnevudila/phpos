import axios from "axios";
import { apiBaseUrl } from "../../services";

const PORTAL_TOKEN_KEY = "dentease_portal_token";
const PORTAL_PATIENT_KEY = "dentease_portal_patient";

const portalApi = axios.create({
  baseURL: `${apiBaseUrl}/portal`,
  headers: {
    "Content-Type": "application/json",
  },
});

portalApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(PORTAL_TOKEN_KEY);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

portalApi.interceptors.response.use(
  (response) => response.data.data,
  (error) => {
    const data = error.response?.data;
    const message = data?.error || data?.message || error.message;
    const code = data?.code || "PORTAL_ERROR";
    const status = error.response?.status || 500;
    throw new PortalApiError(message, code, status);
  }
);

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
  return portalApi.get(`/clinics/${encodeURIComponent(slug)}`);
}

export interface RequestOtpResponse {
  sent: boolean;
  phone: string;
  expiresAt?: string;
  cooldownSec: number;
  devCode?: string;
}

export function requestOtp(slug: string, phone: string): Promise<RequestOtpResponse> {
  return portalApi.post("/auth/request-otp", { slug, phone });
}

export function registerPortalPatient(
  slug: string,
  body: {
    phone: string;
    firstName: string;
    lastName: string;
    email?: string;
    birthDate?: string;
  },
): Promise<RequestOtpResponse> {
  return portalApi.post("/auth/register", { slug, ...body });
}

export async function verifyOtp(
  slug: string,
  phone: string,
  code: string,
): Promise<{ token: string; patient: PortalPatient }> {
  const data = await portalApi.post<{ token: string; patient: PortalPatient }>(
    "/auth/verify-otp",
    { slug, phone, code },
  ) as any;
  savePortalSession(data.token, data.patient);
  return data;
}

// Protected
export function fetchPortalHome(): Promise<PortalHome> {
  return portalApi.get("/home");
}

export function fetchPortalDentists(): Promise<PortalDentist[]> {
  return portalApi.get("/dentists");
}

export function fetchPortalAvailability(
  dentistId: string,
  date: string,
): Promise<PortalAvailability> {
  return portalApi.get("/availability", { params: { dentistId, date } });
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
  return portalApi.post("/appointments", body);
}

export function fetchPortalAppointments(): Promise<PortalAppointment[]> {
  return portalApi.get("/appointments");
}

export function cancelPortalAppointment(id: string): Promise<{ cancelled: boolean }> {
  return portalApi.post(`/appointments/${id}/cancel`);
}

export function fetchPortalHistory(): Promise<PortalHistory> {
  return portalApi.get("/history");
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
  return portalApi.get("/files");
}

export function getPortalInvoicePdfUrl(invoiceId: string): string {
  const token = localStorage.getItem(PORTAL_TOKEN_KEY);
  return `${apiBaseUrl}/portal/invoices/${invoiceId}/pdf?portalToken=${token}`;
}

export function getPortalFileDownloadUrl(fileId: string): string {
  const token = localStorage.getItem(PORTAL_TOKEN_KEY);
  return `${apiBaseUrl}/portal/files/${fileId}/download?portalToken=${encodeURIComponent(token ?? "")}`;
}

export interface PortalFileSignedUrl {
  downloadUrl: string;
  expiresAt: string;
}

/** Süre sınırlı HMAC indirme bağlantısı (img src / paylaşım). */
export function fetchPortalFileSignedUrl(fileId: string): Promise<PortalFileSignedUrl> {
  return portalApi.get(`/files/${encodeURIComponent(fileId)}/signed-url`);
}

/** PayMongo checkout — staff `/invoices` değil, portal JWT ile `/portal/invoices/...` */
export interface PortalPaymongoCheckout {
  url: string;
  checkoutUrl: string;
  linkId: string | null;
  mock: boolean;
}

export function startPortalInvoicePaymongo(invoiceId: string): Promise<PortalPaymongoCheckout> {
  return portalApi.post(`/invoices/${encodeURIComponent(invoiceId)}/paymongo`);
}

export function fetchPortalMedicalHistory(): Promise<any> {
  return portalApi.get("/medical-history");
}

export function updatePortalMedicalHistory(data: any): Promise<any> {
  return portalApi.put("/medical-history", data);
}
