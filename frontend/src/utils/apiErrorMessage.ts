import i18n from "../i18n";

const CODE_I18N: Record<string, string> = {
  APPOINTMENT_CONFLICT: "pages.appointments.slotConflict",
  APPOINTMENT_IN_PAST: "pages.appointments.pastConflict",
  APPOINTMENT_LOCKED: "pages.appointments.lockedConflict",
  APPOINTMENT_NOT_FOUND: "pages.appointments.notFound",
};

export function messageFromApiError(data: {
  code?: string;
  error?: string;
  message?: string;
  requestId?: string;
}): string {
  const key = data.code ? CODE_I18N[data.code] : undefined;
  const base = key ? i18n.t(key) : data.error ?? data.message ?? i18n.t("errors.requestFailed");
  const rid = data.requestId?.trim();
  if (!rid) return base;
  return `${base} (${rid.slice(0, 8)})`;
}
