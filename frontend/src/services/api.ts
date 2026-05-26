import axios, { type InternalAxiosRequestConfig, AxiosError } from "axios";
import { supabase } from "../lib/supabase";
import i18n from "../i18n";
import { messageFromApiError } from "../utils/apiErrorMessage";
import { apiBaseUrl } from "./index";

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token && config.headers) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    // Network errors or offline
    if (!error.response) {
      throw new Error(i18n.t("errors.networkOffline", { defaultValue: "Network Offline" }));
    }

    const data = error.response.data as {
      code?: string;
      error?: string;
      message?: string;
      requestId?: string;
    };
    throw new Error(messageFromApiError(data));
  }
);

export default api;

export async function apiFetch<T>(
  path: string,
  init?: any
): Promise<T> {
  const method = init?.method?.toLowerCase() || "get";
  const response = await (api as any)[method](path, init?.body ? JSON.parse(init.body) : undefined, {
    headers: init?.headers,
  });
  return response;
}

export async function apiPostFormData<T>(path: string, formData: FormData): Promise<T> {
  return api.post(path, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function fetchAuthMeProfile(): Promise<any | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    
    return {
      id: user.id,
      clinicId: profile?.clinic_id,
      email: user.email,
      firstName: profile?.name?.split(" ")[0] || "",
      lastName: profile?.name?.split(" ").slice(1).join(" ") || "",
      phone: profile?.phone || null,
      role: profile?.role || "STAFF",
    };
  } catch {
    return null;
  }
}

export interface PatientFileDto {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  publicUrl: string | null;
  createdAt: string;
  annotations?: any;
}

export async function listPatientXrayFiles(patientId: string): Promise<PatientFileDto[]> {
  return []; // Demo mode fallback
}

export async function uploadPatientXrayFile(patientId: string, file: File): Promise<PatientFileDto[]> {
  throw new Error("Demo Mode: File upload not supported yet.");
}

export async function downloadPatientXrayFile(patientId: string, fileId: string): Promise<string> {
  return "";
}

export async function updatePatientXrayAnnotations(patientId: string, fileId: string, annotations: any): Promise<void> {
}

export async function openAuthedPdf(path: string): Promise<void> {
  if (path.includes("treatment-record.pdf")) {
    const parts = path.split("/");
    const patientId = parts[2];
    try {
      const { generateTreatmentRecordPdf } = await import("../utils/treatmentRecordPdf");
      const res = await api.get<any>(`/patients/${patientId}/treatments`) as any;
      const treatments = res.data || [];
      await generateTreatmentRecordPdf(patientId, treatments);
      return;
    } catch (err) {
      console.error("Failed to generate client-side treatment record PDF:", err);
      throw err;
    }
  }

  alert("Demo Mode: This PDF type is handled via local export buttons.");
}

export async function downloadAuthedFile(path: string, fileName: string): Promise<void> {
  alert("Demo Mode: File downloads not supported in this environment");
}
