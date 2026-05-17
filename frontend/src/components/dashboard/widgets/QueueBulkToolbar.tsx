import { useTranslation } from "react-i18next";
import { Bell, CheckCircle2, UserCheck } from "lucide-react";
import type { DashboardTodayAppointment } from "../../../services/reports";

interface QueueBulkToolbarProps {
  overdue: DashboardTodayAppointment[];
  pendingNext: DashboardTodayAppointment[];
  lastSyncedAt?: number;
  disabled: boolean;
  onBulkCheckInOverdue: () => void | Promise<void>;
  onBulkAlertOverdue: () => void | Promise<void>;
  onBulkCheckInNext: () => void | Promise<void>;
}

export function QueueBulkToolbar({
  overdue,
  pendingNext,
  lastSyncedAt,
  disabled,
  onBulkCheckInOverdue,
  onBulkAlertOverdue,
  onBulkCheckInNext,
}: QueueBulkToolbarProps): JSX.Element {
  const { t } = useTranslation();
  const hasOverdue = overdue.length > 0;
  const hasNext = pendingNext.length > 0;
  const syncLabel =
    lastSyncedAt && lastSyncedAt > 0
      ? t("pages.dashboard.queueLastSync", {
          time: new Date(lastSyncedAt).toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
          }),
        })
      : null;

  if (!hasOverdue && !hasNext) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-3 text-center text-xs font-bold uppercase tracking-widest text-slate-400 dark:border-slate-700 dark:bg-slate-900/40">
        {t("pages.dashboard.bulkNone")}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <span className="mr-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
        {t("pages.dashboard.bulkLabel")}
      </span>
      {syncLabel ? (
        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{syncLabel}</span>
      ) : null}
      {hasOverdue ? (
        <>
          <button
            type="button"
            disabled={disabled}
            onClick={() => void onBulkCheckInOverdue()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-50"
          >
            <UserCheck size={14} />
            {t("pages.dashboard.bulkCheckInOverdue", { count: overdue.length })}
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => void onBulkAlertOverdue()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-700 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Bell size={14} />
            {t("pages.dashboard.bulkAlertOverdue", { count: overdue.length })}
          </button>
        </>
      ) : null}
      {hasNext ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => void onBulkCheckInNext()}
          className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-50"
        >
          <CheckCircle2 size={14} />
          {t("pages.dashboard.bulkCheckInNext", { count: pendingNext.length })}
        </button>
      ) : null}
    </div>
  );
}
