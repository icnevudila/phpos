import api from "../api";
import type {
  CronTriggerResult,
  NotificationListParams,
  NotificationRow,
  TestNotificationBody,
  TestNotificationResult,
} from "./types";

interface ApiEnvelope<T> {
  success: true;
  data: T;
}

export const notificationQueryKeys = {
  all: ["notifications"] as const,
  list: (params?: NotificationListParams) => ["notifications", params] as const,
};

export async function fetchNotifications(
  params: NotificationListParams = {},
): Promise<NotificationRow[]> {
  const res = (await api.get<ApiEnvelope<NotificationRow[]>>("/notifications", {
    params,
  })) as unknown as ApiEnvelope<NotificationRow[]>;
  return res.data;
}

export async function sendTestNotification(
  body: TestNotificationBody,
): Promise<TestNotificationResult> {
  const res = (await api.post<ApiEnvelope<TestNotificationResult>>(
    "/notifications/test",
    body,
  )) as unknown as ApiEnvelope<TestNotificationResult>;
  return res.data;
}

export async function triggerNotificationCron(
  kind: "daily" | "soon",
): Promise<CronTriggerResult> {
  const res = (await api.post<ApiEnvelope<CronTriggerResult>>(
    `/notifications/cron/${kind}`,
    {},
  )) as unknown as ApiEnvelope<CronTriggerResult>;
  return res.data;
}

export async function retryNotification(
  id: string,
): Promise<TestNotificationResult> {
  const res = (await api.post<ApiEnvelope<TestNotificationResult>>(
    `/notifications/retry/${id}`,
    {},
  )) as unknown as ApiEnvelope<TestNotificationResult>;
  return res.data;
}
