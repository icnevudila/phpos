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

export async function getSterilizationLogs(): Promise<SterilizationLog[]> {
  // Demo Mode: Not Configured
  return [];
}

export async function createSterilizationLog(body: any): Promise<SterilizationLog> {
  throw new Error("Demo Mode: Sterilization logging is not yet configured for this clinic.");
}
