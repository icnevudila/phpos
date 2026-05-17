import { apiBaseUrl } from "./index";

export interface PublicQueueItem {
  id: string;
  patientName: string;
  type: "WAITLIST" | "APPOINTMENT";
  status: string;
  arrivalTime: string;
  waitTime: number;
  dentistName: string;
  procedure: string;
  room: string;
  priority: "NORMAL" | "URGENT";
}

export async function fetchPublicQueue(params: {
  token: string;
  clinicId?: string;
  slug?: string;
}): Promise<PublicQueueItem[]> {
  const q = new URLSearchParams({ token: params.token });
  if (params.clinicId) q.set("clinicId", params.clinicId);
  if (params.slug) q.set("slug", params.slug);

  const res = await fetch(`${apiBaseUrl}/public/queue?${q.toString()}`);
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(body.message ?? `HTTP ${res.status}`);
  }
  const json = (await res.json()) as { data: PublicQueueItem[] };
  return json.data;
}
