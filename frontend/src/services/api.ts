import axios, { type InternalAxiosRequestConfig, AxiosError } from "axios";
import { ACCESS_TOKEN_KEY } from "../constants/auth";
import {
  clearTokens,
  getRefreshToken,
  setTokens,
  type AuthProfile,
} from "../hooks/authTokens";
import i18n from "../i18n";
import { messageFromApiError } from "../utils/apiErrorMessage";
import { apiBaseUrl } from "./index";

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens();
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${apiBaseUrl}/auth/refresh`, {
          refreshToken,
        });

        if (data.success && data.data) {
          const { accessToken, refreshToken: newRefreshToken } = data.data;
          setTokens(accessToken, newRefreshToken);
          processQueue(null, accessToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return api(originalRequest);
        } else {
          clearTokens();
          processQueue(error, null);
          return Promise.reject(error);
        }
      } catch (refreshError) {
        clearTokens();
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Network errors or offline
    if (!error.response) {
      throw new Error(i18n.t("errors.networkOffline"));
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

export async function fetchAuthMeProfile(): Promise<AuthProfile | null> {
  try {
    const res = await api.get<{ success: true; data: AuthProfile }>("/auth/me") as any;
    return res.data;
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
  const res = await api.get<{ success: true; data: PatientFileDto[] }>(`/patients/${patientId}/files`) as any;
  return res.data;
}

export async function uploadPatientXrayFile(patientId: string, file: File): Promise<PatientFileDto[]> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post(`/patients/${patientId}/files`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }) as any;
  return [res.data];
}

export async function downloadPatientXrayFile(patientId: string, fileId: string): Promise<string> {
  return `${apiBaseUrl}/patients/${patientId}/files/${fileId}/download`;
}

export async function updatePatientXrayAnnotations(patientId: string, fileId: string, annotations: any): Promise<void> {
  await api.patch(`/patients/${patientId}/files/${fileId}/annotations`, { annotations });
}

export async function openAuthedPdf(path: string): Promise<void> {
  const res = await api.get(path, { responseType: "blob" }) as any;
  const url = URL.createObjectURL(res);
  window.open(url, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export async function downloadAuthedFile(path: string, fileName: string): Promise<void> {
  const res = await api.get(path, { responseType: "blob" }) as any;
  const url = URL.createObjectURL(res);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
