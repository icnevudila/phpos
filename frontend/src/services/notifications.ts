import { apiFetch } from "./api";

export type NotificationStatus = "PENDING" | "SENT" | "FAILED";

export interface NotificationRow {
  id: string;
  channel: "SMS" | "EMAIL" | "PUSH";
  kind: string;
  status: NotificationStatus;
  recipient: string | null;
  message: string;
  errorMessage: string | null;
  providerRef: string | null;
  sentAt: string | null;
  createdAt: string;
  appointmentId: string | null;
  patientId: string | null;
  invoiceId: string | null;
}

interface ApiEnvelope<T> {
  success: true;
  data: T;
}

export async function fetchNotifications(params: {
  status?: NotificationStatus;
  kind?: string;
}): Promise<NotificationRow[]> {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.kind) qs.set("kind", params.kind);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  const res = await apiFetch<ApiEnvelope<NotificationRow[]>>(`/notifications${suffix}`);
  return res.data;
}

export async function sendTestNotification(body: {
  to: string;
  message: string;
}): Promise<{ status: NotificationStatus; errorMessage?: string | null }> {
  const res = await apiFetch<
    ApiEnvelope<{ status: NotificationStatus; errorMessage?: string | null }>
  >("/notifications/test", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return res.data;
}

export async function triggerNotificationCron(
  kind: "daily" | "soon",
): Promise<{ found: number; sent: number }> {
  const res = await apiFetch<ApiEnvelope<{ found: number; sent: number }>>(
    `/notifications/cron/${kind}`,
    { method: "POST", body: "{}" },
  );
  return res.data;
}
