import { ACCESS_TOKEN_KEY } from "../constants/auth";
import {
  clearTokens,
  getRefreshToken,
  setTokens,
  type AuthProfile,
} from "../hooks/authTokens";
import i18n from "../i18n";

import { apiBaseUrl } from "./index";

export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

/** Paralel 401 durumunda tek yenileme */
let refreshPromise: Promise<boolean> | null = null;

function isLikelyNetworkFailure(e: unknown): boolean {
  if (typeof navigator !== "undefined" && !navigator.onLine) return true;
  if (e instanceof TypeError) return true;
  if (e instanceof Error) {
    const m = e.message.toLowerCase();
    return m.includes("failed to fetch") || m.includes("networkerror") || m.includes("load failed");
  }
  return false;
}

async function readJsonBody<T>(res: Response): Promise<T & { success?: boolean; error?: string }> {
  const text = await res.text();
  if (!text.trim()) {
    return {} as T & { success?: boolean; error?: string };
  }
  try {
    return JSON.parse(text) as T & { success?: boolean; error?: string };
  } catch {
    if (res.status >= 500) {
      throw new Error(i18n.t("errors.serverError"));
    }
    throw new Error(res.statusText || `HTTP ${res.status}`);
  }
}

async function tryRefreshTokens(): Promise<boolean> {
  const rt = getRefreshToken();
  if (!rt) return false;
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: rt }),
        });
        const json = (await res.json()) as {
          success?: boolean;
          data?: { accessToken?: string; refreshToken?: string };
        };
        if (
          !res.ok ||
          json.success === false ||
          !json.data?.accessToken ||
          !json.data?.refreshToken
        ) {
          clearTokens();
          return false;
        }
        setTokens(json.data.accessToken, json.data.refreshToken);
        return true;
      } catch {
        clearTokens();
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

/**
 * Korumalı PDF endpoint'ini indirir ve yeni bir sekmede açar.
 * `<a href>` doğrudan Authorization header taşıyamadığı için blob + object URL kullanılır.
 */
export async function openAuthedPdf(path: string): Promise<void> {
  const fetchPdf = async (): Promise<Response> =>
    fetch(`${apiBaseUrl}${path}`, {
      headers: { ...getAuthHeaders() },
    });

  let res = await fetchPdf();
  if (res.status === 401) {
    const ok = await tryRefreshTokens();
    if (ok) res = await fetchPdf();
  }
  if (!res.ok) {
    throw new Error(`Download failed (${res.status})`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/** Blob indirme (Authorization header; `Content-Disposition` tarayıcıda güvenilir değil). */
export async function downloadAuthedFile(path: string, suggestedName: string): Promise<void> {
  const fetchBlob = async (): Promise<Response> =>
    fetch(`${apiBaseUrl}${path}`, {
      headers: { ...getAuthHeaders() },
    });

  let res = await fetchBlob();
  if (res.status === 401) {
    const ok = await tryRefreshTokens();
    if (ok) res = await fetchBlob();
  }
  if (!res.ok) {
    throw new Error(`Download failed (${res.status})`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = suggestedName || "download";
  a.rel = "noopener";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/** `multipart/form-data` (Authorization; Content-Type set etme). */
export async function apiPostFormData<T>(
  path: string,
  formData: FormData,
  _alreadyRetried = false,
): Promise<T> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw new Error(i18n.t("errors.networkOffline"));
  }
  let res: Response;
  try {
    res = await fetch(`${apiBaseUrl}${path}`, {
      method: "POST",
      headers: { ...getAuthHeaders() },
      body: formData,
    });
  } catch (e) {
    if (isLikelyNetworkFailure(e)) {
      throw new Error(i18n.t("errors.networkOffline"));
    }
    throw e;
  }
  const json = await readJsonBody<T>(res);
  if (res.status === 401 && path !== "/auth/refresh" && !_alreadyRetried) {
    const refreshed = await tryRefreshTokens();
    if (refreshed) {
      return apiPostFormData<T>(path, formData, true);
    }
  }
  if (!res.ok || ("success" in json && json.success === false)) {
    const raw = "error" in json && typeof json.error === "string" ? json.error : res.statusText;
    if (res.status >= 500) {
      throw new Error(raw?.trim() ? raw : i18n.t("errors.serverError"));
    }
    throw new Error(raw || res.statusText || String(res.status));
  }
  return json as T;
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  _alreadyRetried = false,
): Promise<T> {
  const run = async (): Promise<T> => {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      throw new Error(i18n.t("errors.networkOffline"));
    }
    const headers: Record<string, string> = {
      ...getAuthHeaders(),
      ...((init?.headers as Record<string, string>) ?? {}),
    };
    if (init?.body !== undefined && typeof init.body === "string" && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }
    let res: Response;
    try {
      res = await fetch(`${apiBaseUrl}${path}`, {
        ...init,
        headers,
      });
    } catch (e) {
      if (isLikelyNetworkFailure(e)) {
        throw new Error(i18n.t("errors.networkOffline"));
      }
      throw e;
    }
    const json = await readJsonBody<T>(res);

    if (res.status === 401 && path !== "/auth/refresh" && !_alreadyRetried) {
      const refreshed = await tryRefreshTokens();
      if (refreshed) {
        return apiFetch<T>(path, init, true);
      }
    }

    if (!res.ok || ("success" in json && json.success === false)) {
      const raw = "error" in json && typeof json.error === "string" ? json.error : res.statusText;
      if (res.status >= 500) {
        throw new Error(raw?.trim() ? raw : i18n.t("errors.serverError"));
      }
      throw new Error(raw || res.statusText || String(res.status));
    }
    return json as T;
  };

  try {
    return await run();
  } catch (e) {
    if (isLikelyNetworkFailure(e)) {
      throw new Error(i18n.t("errors.networkOffline"));
    }
    throw e;
  }
}

/** Aynı anda tek istek (React StrictMode çift effect / hızlı yeniden mount için). */
let authMeInflight: Promise<AuthProfile | null> | null = null;

/** Oturum açıkken backend profil ile `localStorage` profilini eşitler */
export async function fetchAuthMeProfile(): Promise<AuthProfile | null> {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!token) {
    authMeInflight = null;
    return null;
  }
  if (authMeInflight) return authMeInflight;
  authMeInflight = (async () => {
    try {
      const json = await apiFetch<{ success: true; data: AuthProfile }>("/auth/me");
      return json.data;
    } catch {
      return null;
    } finally {
      authMeInflight = null;
    }
  })();
  return authMeInflight;
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
  const res = await apiFetch<{ success: true; data: PatientFileDto[] }>(`/patients/${patientId}/files`);
  return res.data;
}

export async function uploadPatientXrayFile(patientId: string, file: File): Promise<PatientFileDto[]> {
  const formData = new FormData();
  formData.append("file", file);
  
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  const res = await fetch(`${apiBaseUrl}/patients/${patientId}/files`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to upload file");
  }
  
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Upload failed");
  return [json.data];
}

export async function downloadPatientXrayFile(patientId: string, fileId: string): Promise<string> {
  return `${apiBaseUrl}/patients/${patientId}/files/${fileId}/download`;
}

export async function updatePatientXrayAnnotations(patientId: string, fileId: string, annotations: any): Promise<void> {
  await apiFetch(`/patients/${patientId}/files/${fileId}/annotations`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ annotations }),
  });
}

