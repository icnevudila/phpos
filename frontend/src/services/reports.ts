import api, { downloadAuthedFile, openAuthedPdf } from "./api";

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
  revenueByMonth: Array<{ month: string; amount: string }>;
  recentTreatments: Array<{
    id: string;
    procedure: string;
    patientName: string;
    dentistName: string;
    createdAt: string;
  }>;
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
  const res = await api.get<ApiEnvelope<AgedReceivablesResponse>>("/reports/aged-receivables") as any;
  return res.data;
}

export interface DashboardSummary {
  today: { appointments: number; completed: number; revenue: string };
  thisMonth: { appointments: number; newPatients: number; revenue: string };
  operational: { pendingHmoClaims: number; inventoryAlerts: number };
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const res = await api.get<ApiEnvelope<DashboardSummary>>("/reports/dashboard/summary") as any;
  return res.data;
}

/** Hızlı KPI kartları — tam dashboard yüklenene kadar iskelet doldurur. */
export function dashboardFromSummary(summary: DashboardSummary): DashboardResponse {
  return {
    today: {
      appointments: summary.today.appointments,
      completed: summary.today.completed,
      revenue: summary.today.revenue,
      upcoming: [],
    },
    queue: { total: 0, waiting: 0, checkedIn: 0, inProgress: 0, rows: [] },
    waitlist: { total: 0, rows: [] },
    operational: summary.operational,
    activeTreatmentPlan: null,
    thisMonth: summary.thisMonth,
    topProcedures: [],
    revenueByDay: [],
    revenueByMonth: [],
    recentTreatments: [],
    appointmentsByStatus: {
      pending: 0,
      confirmed: 0,
      checkedIn: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
      noShow: 0,
    },
  };
}

export type DashboardQueuePayload = Pick<
  DashboardResponse,
  "queue" | "waitlist" | "activeTreatmentPlan"
> & { today: { upcoming: DashboardTodayAppointment[] } };

export type DashboardChartsPayload = Pick<
  DashboardResponse,
  "topProcedures" | "revenueByDay" | "revenueByMonth" | "appointmentsByStatus" | "recentTreatments"
>;

export async function fetchDashboardQueue(): Promise<DashboardQueuePayload> {
  const res = await api.get<ApiEnvelope<DashboardQueuePayload>>("/reports/dashboard/queue") as any;
  return res.data;
}

export async function fetchDashboardCharts(): Promise<DashboardChartsPayload> {
  const res = await api.get<ApiEnvelope<DashboardChartsPayload>>("/reports/dashboard/charts") as any;
  return res.data;
}

export function mergeDashboardParts(
  summary: DashboardSummary,
  queue?: DashboardQueuePayload | null,
  charts?: DashboardChartsPayload | null,
): DashboardResponse {
  const base = dashboardFromSummary(summary);
  if (queue) {
    base.today.upcoming = queue.today.upcoming;
    base.queue = queue.queue;
    base.waitlist = queue.waitlist;
    base.activeTreatmentPlan = queue.activeTreatmentPlan;
  }
  if (charts) {
    base.topProcedures = charts.topProcedures;
    base.revenueByDay = charts.revenueByDay;
    base.revenueByMonth = charts.revenueByMonth;
    base.appointmentsByStatus = charts.appointmentsByStatus;
    base.recentTreatments = charts.recentTreatments;
  }
  return base;
}

export async function fetchDashboard(): Promise<DashboardResponse> {
  const res = await api.get<ApiEnvelope<DashboardResponse>>(`/reports/dashboard`) as any;
  return res.data;
}

export async function fetchMonthlyReport(year: number, month: number): Promise<MonthlyReport> {
  const res = await api.get<ApiEnvelope<MonthlyReport>>(
    `/reports/monthly`, { params: { year, month } }
  ) as any;
  return res.data;
}

export async function openMonthlyReportPdf(year: number, month: number): Promise<void> {
  await openAuthedPdf(`/reports/monthly/pdf?year=${year}&month=${month}`);
}

export interface CustomReportResponse {
  labels: string[];
  values: number[];
  dimension: string;
  metric: string;
}

export async function fetchCustomReport(params: { dimension: string; metric: string }): Promise<CustomReportResponse> {
  const res = await api.get<ApiEnvelope<CustomReportResponse>>("/reports/custom", { params }) as any;
  return res.data;
}

export async function downloadBirJournalCsv(year: number, month: number): Promise<void> {
  const mm = String(month).padStart(2, "0");
  await downloadAuthedFile(`/reports/bir-journal.csv?year=${year}&month=${month}`, `bir-journal-${year}-${mm}.csv`);
}

export interface OrGapAuditResult {
  year: number;
  totalIssued: number;
  expectedCount: number;
  missingCount: number;
  missingSequences: string[];
}

export async function fetchOrGapAudit(year: number): Promise<OrGapAuditResult> {
  const res = await api.get<ApiEnvelope<OrGapAuditResult>>(`/reports/or-gap-audit`, { params: { year } }) as any;
  return res.data;
}
