import api from "./api";
import { apiBaseUrl } from "./index";
import { getAccessToken } from "../hooks/authTokens";

/** DPA veri taşınabilirliği — JSON indir (ADMIN). */
export async function downloadPatientDpaExport(patientId: string): Promise<void> {
  const token = getAccessToken();
  const res = await fetch(`${apiBaseUrl}/patients/${encodeURIComponent(patientId)}/dpa-export`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    let message = "Export failed";
    try {
      const body = (await res.json()) as { error?: string };
      message = body.error ?? message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition") ?? "";
  const match = /filename="?([^";]+)"?/i.exec(disposition);
  const filename = match?.[1] ?? `patient-dpa-export-${patientId}.json`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** DPA silme talebi — kaydı pasifleştirir (ADMIN). */
export async function requestPatientDpaErasure(
  patientId: string,
  reason?: string,
): Promise<{ deactivated: true; patientId: string }> {
  const res = (await api.post(
    `/patients/${encodeURIComponent(patientId)}/dpa-erasure`,
    { confirmPatientId: patientId, reason: reason?.trim() || undefined },
  )) as { success: true; data: { deactivated: true; patientId: string } };
  return res.data;
}
