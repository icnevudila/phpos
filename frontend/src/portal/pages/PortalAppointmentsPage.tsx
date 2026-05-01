import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Link, useParams } from "react-router-dom";

import { useUiLocale } from "../../hooks/useUiLocale";
import { translatePortalError } from "../translatePortalError";
import { usePortalKioskSuffix } from "../usePortalKioskSuffix";
import {
  cancelPortalAppointment,
  fetchPortalAppointments,
  type PortalAppointment,
} from "../services/portalApi";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  CONFIRMED: "bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200",
  COMPLETED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  CANCELLED: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200",
  NO_SHOW: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
};

export function PortalAppointmentsPage(): JSX.Element {
  const { t } = useTranslation();
  const locale = useUiLocale();
  const { slug = "" } = useParams();
  const kioskSuffix = usePortalKioskSuffix();
  const [items, setItems] = useState<PortalAppointment[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [cancelling, setCancelling] = useState<string | null>(null);

  const fmtDate = useCallback(
    (iso: string): string =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: "full",
        timeZone: "Asia/Manila",
      }).format(new Date(iso)),
    [locale],
  );

  async function load(): Promise<void> {
    try {
      const res = await fetchPortalAppointments();
      setItems(res);
    } catch (e) {
      setError(translatePortalError(e, t));
    }
  }

  useEffect(() => {
    void load();
    const interval = setInterval(() => {
      fetchPortalAppointments()
        .then((res) => setItems(res))
        .catch(console.error);
    }, 15000); // Poll every 15 seconds
    return () => clearInterval(interval);
  }, [t]);

  async function onCancel(id: string): Promise<void> {
    if (!confirm(t("pages.portal.appointments.cancelConfirm"))) return;
    setCancelling(id);
    try {
      await cancelPortalAppointment(id);
      toast.success(t("pages.portal.appointments.cancelSuccess"));
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.portal.appointments.cancelFailed"));
    } finally {
      setCancelling(null);
    }
  }

  const filtered = items?.filter((i) => (tab === "upcoming" ? !i.isPast : i.isPast)) ?? [];

  const emptyMessage =
    tab === "upcoming"
      ? t("pages.portal.appointments.emptyUpcoming")
      : t("pages.portal.appointments.emptyPast");

  return (
    <div className="min-w-0 space-y-4 px-4 pt-5 dark:text-slate-100">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-black text-slate-900 dark:text-white">{t("pages.portal.appointments.title")}</h1>
        <Link
          to={`/${slug}/portal/book${kioskSuffix}`}
          className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 px-3 py-2 text-[11px] font-black uppercase tracking-wider text-white shadow-sm hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
        >
          {t("pages.portal.appointments.book")}
        </Link>
      </div>

      <div className="flex gap-1 rounded-full bg-slate-100 p-1 dark:bg-slate-800/90">
        {(["upcoming", "past"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`min-h-10 flex-1 rounded-full px-2 py-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-inset ${
              tab === k
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {k === "upcoming" ? t("pages.portal.appointments.upcoming") : t("pages.portal.appointments.past")}
          </button>
        ))}
      </div>

      {error ? (
        <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      {items === null ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">{t("pages.portal.appointments.loading")}</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400">
          {emptyMessage}
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((a) => (
            <li
              key={a.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between bg-slate-50 px-4 py-2 dark:bg-slate-800/80">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  {fmtDate(a.scheduledAt)}
                </p>
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                    STATUS_STYLES[a.status] ?? "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                  }`}
                >
                  {t(`pages.dashboard.queueStatus.${a.status}`, { defaultValue: a.status })}
                </span>
              </div>
              <div className="flex items-center gap-3 p-4">
                <div className="flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                  <span className="text-[9px] font-bold uppercase">{t("pages.portal.appointments.time")}</span>
                  <span className="font-black">{a.localTime}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-900 dark:text-slate-100">
                    {t("pages.common.drPrefix")} {a.dentistName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {a.type?.replace(/_/g, " ") ?? t("pages.portal.appointments.defaultConsultation")}
                  </p>
                </div>
                {a.canCancel ? (
                  <button
                    type="button"
                    onClick={() => onCancel(a.id)}
                    disabled={cancelling === a.id}
                    className="min-h-9 shrink-0 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] font-bold text-rose-700 hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 disabled:opacity-50 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-900/40 dark:focus-visible:ring-offset-slate-950"
                  >
                    {cancelling === a.id ? t("pages.portal.appointments.cancelling") : t("pages.portal.appointments.cancel")}
                  </button>
                ) : null}
              </div>
              {!a.canCancel && !a.isPast && a.status !== "CANCELLED" ? (
                <p className="border-t border-slate-100 bg-amber-50 px-4 py-1.5 text-[10px] font-semibold text-amber-800 dark:border-slate-700 dark:bg-amber-950/30 dark:text-amber-200">
                  {t("pages.portal.appointments.cancelWindowClosed")}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
