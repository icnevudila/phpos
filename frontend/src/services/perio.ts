import { apiFetch } from "./api";

export type PerioSiteCode = "MB" | "B" | "DB" | "ML" | "L" | "DL";

export const PERIO_SITE_CODES: PerioSiteCode[] = ["DB", "B", "MB", "ML", "L", "DL"];

export interface PerioSiteDto {
  id?: string;
  siteCode: PerioSiteCode;
  pocketDepth: number;
  recession: number;
  bleeding: boolean;
  suppuration: boolean;
  plaque: boolean;
}

export interface PerioToothDto {
  id?: string;
  toothNumber: number;
  mobility: number | null;
  furcation: number | null;
  missing: boolean;
  notes?: string | null;
  sites: PerioSiteDto[];
}

export interface PerioExamSummary {
  id: string;
  examDate: string;
  bopPercent: string | null;
  plaquePercent: string | null;
  notes: string | null;
  examinedBy: { id: string; firstName: string; lastName: string };
  _count?: { teeth: number };
  createdAt: string;
}

export interface PerioExamDetail extends PerioExamSummary {
  teeth: PerioToothDto[];
}

interface ApiEnvelope<T> {
  success: true;
  data: T;
}

export async function listPerioExams(patientId: string): Promise<PerioExamSummary[]> {
  const res = await apiFetch<ApiEnvelope<PerioExamSummary[]>>(
    `/patients/${patientId}/perio-exams`,
  );
  return res.data;
}

export async function getPerioExam(examId: string): Promise<PerioExamDetail> {
  const res = await apiFetch<ApiEnvelope<PerioExamDetail>>(`/perio-exams/${examId}`);
  return res.data;
}

export interface CreatePerioExamInput {
  examDate?: string;
  notes?: string | null;
  teeth: Array<Omit<PerioToothDto, "id">>;
}

export async function createPerioExam(
  patientId: string,
  input: CreatePerioExamInput,
): Promise<PerioExamDetail> {
  const res = await apiFetch<ApiEnvelope<PerioExamDetail>>(
    `/patients/${patientId}/perio-exams`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return res.data;
}

export async function updatePerioExam(
  examId: string,
  input: Partial<CreatePerioExamInput>,
): Promise<PerioExamDetail> {
  const res = await apiFetch<ApiEnvelope<PerioExamDetail>>(`/perio-exams/${examId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return res.data;
}

export async function deletePerioExam(examId: string): Promise<void> {
  await apiFetch<ApiEnvelope<null>>(`/perio-exams/${examId}`, { method: "DELETE" });
}
