import { ACCESS_TOKEN_KEY } from "../constants/auth";

import { apiFetch } from "./api";
import { apiBaseUrl } from "./index";

interface ApiEnvelope<T> {
  success: true;
  data: T;
}

export interface DashboardTodayAppointment {
  id: string;
  time: string;
  patientName: string;
  patientPhone: string;
  dentistName: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "CHECKED_IN"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED"
    | "NO_SHOW";
  type: string | null;
  chairNo: string | null;
  arrivedAt: string | null;
  waitingMinutes: number;
}

export interface DashboardWaitlistRow {
  id: string;
  patientId: string;
  patientName: string;
  note: string | null;
  createdAt: string;
  waitingMinutes: number;
}

export interface DashboardResponse {
  today: {
    appointments: number;
    completed: number;
    revenue: string;
    upcoming: DashboardTodayAppointment[];
  };
  queue: {
    total: number;
    waiting: number;
    checkedIn: number;
    inProgress: number;
    rows: DashboardTodayAppointment[];
  };
  waitlist: {
    total: number;
    rows: DashboardWaitlistRow[];
  };
  operational: {
    pendingHmoClaims: number;
    inventoryAlerts: number;
  };
  activeTreatmentPlan: {
    appointmentId: string;
    patientId: string;
    patientName: string;
    dentistName: string;
    scheduledAt: string;
    operations: Array<{ procedure: string; fee: string; toothIds: string[] }>;
  } | null;
  thisMonth: {
    appointments: number;
    newPatients: number;
    revenue: string;
  };
  topProcedures: Array<{ name: string; count: number; revenue: string }>;
  revenueByDay: Array<{ date: string; amount: string }>;
  appointmentsByStatus: {
    pending: number;
    confirmed: number;
    checkedIn: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    noShow: number;
  };
}

export interface MonthlyReport {
  year: number;
  month: number;
  totalRevenue: string;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  newPatients: number;
  returningPatients: number;
  topProcedures: Array<{ name: string; count: number; revenue: string }>;
  revenueByWeek: Array<{
    week: number;
    amount: string;
    startDate: string;
    endDate: string;
  }>;
  paymentMethods: {
    cash: string;
    gcash: string;
    maya: string;
    creditCard: string;
    cheque: string;
    philhealth: string;
  };
  byDentist: Array<{
    dentistId: string;
    name: string;
    appointments: number;
    completed: number;
    revenue: string;
  }>;
}

export type AgedBucketKey = "0_30" | "31_60" | "61_90" | "91_plus";

export interface AgedReceivablesBucket {
  key: AgedBucketKey;
  label: string;
  invoiceCount: number;
  balance: string;
}

export interface AgedReceivablesRow {
  invoiceId: string;
  orNumber: string | null;
  patientName: string;
  patientId: string;
  balance: string;
  daysOutstanding: number;
  bucket: AgedBucketKey;
  createdAt: string;
  status: "UNPAID" | "PARTIAL" | "PAID";
}

export interface AgedReceivablesResponse {
  asOf: string;
  totalOutstanding: string;
  buckets: AgedReceivablesBucket[];
  rows: AgedReceivablesRow[];
}

export async function fetchAgedReceivables(): Promise<AgedReceivablesResponse> {
  const res = await apiFetch<ApiEnvelope<AgedReceivablesResponse>>("/reports/aged-receivables");
  return res.data;
}

export async function fetchDashboard(): Promise<DashboardResponse> {
  const res = await apiFetch<ApiEnvelope<DashboardResponse>>(`/reports/dashboard`);
  return res.data;
}

export async function fetchMonthlyReport(year: number, month: number): Promise<MonthlyReport> {
  const res = await apiFetch<ApiEnvelope<MonthlyReport>>(
    `/reports/monthly?year=${year}&month=${month}`,
  );
  return res.data;
}

export async function openMonthlyReportPdf(year: number, month: number): Promise<void> {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY) ?? "";
  const res = await fetch(`${apiBaseUrl}/reports/monthly/pdf?year=${year}&month=${month}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to load PDF");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
