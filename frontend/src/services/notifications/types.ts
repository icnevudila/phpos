export type NotificationStatus = "PENDING" | "SENT" | "FAILED";

export type NotificationChannel = "SMS" | "EMAIL" | "PUSH";

export interface NotificationRow {
  id: string;
  channel: NotificationChannel;
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

export interface NotificationListParams {
  status?: NotificationStatus;
  kind?: string;
}

export interface TestNotificationBody {
  to: string;
  message: string;
}

export interface TestNotificationResult {
  status: NotificationStatus;
  errorMessage?: string | null;
}

export interface CronTriggerResult {
  found: number;
  sent: number;
}
