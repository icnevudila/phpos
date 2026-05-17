import api from "./api";

export interface SterilizationLog {
  id: string;
  clinicId: string;
  operatorId: string;
  autoclaveName: string;
  cycleNumber: number;
  temperature: string;
  pressure: string;
  durationMinutes: number;
  status: "SUCCESS" | "FAILED" | "ABORTED";
  biologicalIndicator: boolean;
  notes: string | null;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  operator: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export async function getSterilizationLogs() {
  const { data } = await api.get<{ data: SterilizationLog[] }>("/sterilization");
  return data.data;
}

export async function createSterilizationLog(body: any) {
  const { data } = await api.post<{ data: SterilizationLog }>("/sterilization", body);
  return data.data;
}
