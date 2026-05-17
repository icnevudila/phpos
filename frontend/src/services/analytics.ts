import api from "./api";

interface ApiEnvelope<T> {
  success: true;
  data: T;
}

export interface AnalyticsOverview {
  treatmentBreakdown: Array<{ name: string; value: number }>;
  categoryRevenue: Array<{ name: string; amount: number }>;
  dentistProductivity: Array<{ name: string; revenue: number; appointments: number }>;
  patientGrowth: Array<{ month: string; newPatients: number; returningPatients: number }>;
  hmoShare: Array<{ name: string; value: number }>;
}

export async function fetchAnalyticsOverview(): Promise<AnalyticsOverview> {
  const res = await api.get<ApiEnvelope<AnalyticsOverview>>("/analytics/overview") as any;
  return res.data;
}
