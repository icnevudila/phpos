import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { ListEmptyState } from "../components/ListEmptyState";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import {
  fetchNotifications,
  sendTestNotification,
  triggerNotificationCron,
  type NotificationRow,
  type NotificationStatus,
} from "../services/notifications";

type Status = NotificationStatus;

const fieldFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus-visible:ring-offset-slate-950";

const STATUS_STYLES: Record<Status, string> = {
  PENDING: "bg-amber-100 text-amber-800 ring-amber-200",
  SENT: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  FAILED: "bg-rose-100 text-rose-800 ring-rose-200",
};

function fmt(iso: string): string {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function NotificationsPage(): JSX.Element {
  const { t, i18n } = useTranslation();
  const kindLabel = useCallback(
    (k: string) => t(`pages.notifications.kind.${k}`, { defaultValue: k }),
    [t],
  );

  const [rows, setRows] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status | "">("");
  const [kind, setKind] = useState("");
  const [testTo, setTestTo] = useState("");
  const [testMsg, setTestMsg] = useState("");
  const [testBusy, setTestBusy] = useState(false);
  const [cronBusy, setCronBusy] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [tableQInput, setTableQInput] = useState("");
  const tableQ = useDebouncedValue(tableQInput, 300);

  useEffect(() => {
    setTestMsg(t("pages.notifications.testMsgDefault"));
  }, [t, i18n.resolvedLanguage]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchNotifications({ status: status || undefined, kind: kind || undefined });
      setRows(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("pages.notifications.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [status, kind, t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function sendTest(): Promise<void> {
    setTestBusy(true);
    setBanner(null);
    try {
      const res = await sendTestNotification({ to: testTo, message: testMsg });
      setBanner(
        res.status === "SENT"
          ? t("pages.notifications.testQueued")
          : t("pages.notifications.testFailed", {
              message: res.errorMessage ?? t("pages.notifications.testFailedUnknown"),
            }),
      );
      await load();
    } catch (e) {
      setBanner(e instanceof Error ? e.message : t("pages.notifications.testSendFailed"));
    } finally {
      setTestBusy(false);
    }
  }

  async function triggerCron(kindArg: "daily" | "soon"): Promise<void> {
    setCronBusy(kindArg);
    setBanner(null);
    try {
      const res = await triggerNotificationCron(kindArg);
      setBanner(
        t("pages.notifications.cronResult", {
          label: kindArg === "daily" ? t("pages.notifications.cronDailyLabel") : t("pages.notifications.cronSoonLabel"),
          found: res.found,
          sent: res.sent,
        }),
      );
      await load();
    } catch (e) {
      setBanner(e instanceof Error ? e.message : t("pages.notifications.cronTriggerFailed"));
    } finally {
      setCronBusy(null);
    }
  }

  const kindKeys = useMemo(
    () =>
      [
        "APPOINTMENT_REMINDER",
        "APPOINTMENT_REMINDER_SOON",
        "APPOINTMENT_CONFIRMED",
        "APPOINTMENT_CANCELLED",
        "APPOINTMENT_RESCHEDULED",
        "PAYMENT_RECEIVED",
        "BALANCE_DUE",
        "GENERIC",
      ] as const,
    [],
  );

  const displayRows = useMemo(() => {
    const q = tableQ.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const hay = [r.kind, r.recipient ?? "", r.message, r.errorMessage ?? ""].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [rows, tableQ]);

  return (
    <div className="min-w-0 space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{t("pages.notifications.title")}</h1>
        <p className="text-xs text-slate-500">{t("pages.notifications.subtitle")}</p>
      </div>

      <div>
        <section id="notifications-test" className="grid gap-4 scroll-mt-28 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              {t("pages.notifications.testTitle")}
            </h2>
            <p className="mt-1 text-xs text-slate-500">{t("pages.notifications.testHint")}</p>
            <div className="mt-3 space-y-2">
              <input
                type="text"
                value={testTo}
                onChange={(e) => setTestTo(e.target.value)}
                placeholder={t("pages.notifications.testPhonePlaceholder")}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <textarea
                value={testMsg}
                onChange={(e) => setTestMsg(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{t("pages.notifications.chars", { count: testMsg.length })}</span>
                {testMsg.length > 160 ? (
                  <span className="font-semibold text-amber-700">{t("pages.notifications.smsSplitWarning")}</span>
                ) : null}
              </div>
              <button
                type="button"
                onClick={sendTest}
                disabled={testBusy || !testTo}
                className="min-h-11 w-full rounded-lg bg-gradient-to-br from-emerald-500 to-sky-500 px-4 py-2 text-sm font-bold text-white shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-slate-950"
              >
                {testBusy ? t("pages.notifications.sendTestSending") : t("pages.notifications.sendTest")}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              {t("pages.notifications.cronTitle")}
            </h2>
            <p className="mt-1 text-xs text-slate-500">{t("pages.notifications.cronHint")}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => triggerCron("daily")}
                disabled={cronBusy !== null}
                className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800 hover:bg-emerald-100 disabled:opacity-60"
              >
                {cronBusy === "daily" ? t("pages.notifications.cronDailyRunning") : t("pages.notifications.cronDaily")}
              </button>
              <button
                type="button"
                onClick={() => triggerCron("soon")}
                disabled={cronBusy !== null}
                className="rounded-lg border border-sky-300 bg-sky-50 px-3 py-2 text-sm font-bold text-sky-800 hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:opacity-60 dark:focus-visible:ring-offset-slate-950"
              >
                {cronBusy === "soon" ? t("pages.notifications.cronSoonRunning") : t("pages.notifications.cronSoon")}
              </button>
            </div>
          </div>
        </section>

        {banner ? (
          <div className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm">
            {banner}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {t("pages.notifications.filterStatus")}
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Status | "")}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">{t("pages.notifications.all")}</option>
              <option value="PENDING">{t("pages.notifications.statusOptionPending")}</option>
              <option value="SENT">{t("pages.notifications.statusOptionSent")}</option>
              <option value="FAILED">{t("pages.notifications.statusOptionFailed")}</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {t("pages.notifications.filterKind")}
            </label>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              className={`rounded-lg border border-slate-300 px-3 py-2 text-sm ${fieldFocus}`}
            >
              <option value="">{t("pages.notifications.all")}</option>
              {kindKeys.map((k) => (
                <option key={k} value={k}>
                  {kindLabel(k)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex w-full min-w-[200px] flex-1 flex-wrap items-stretch gap-2 sm:max-w-md">
            <input
              type="search"
              value={tableQInput}
              onChange={(e) => setTableQInput(e.target.value)}
              placeholder={t("pages.notifications.tableSearchPlaceholder")}
              aria-label={t("pages.notifications.tableSearchLabel")}
              className={`min-h-11 min-w-[160px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 ${fieldFocus}`}
            />
            {tableQInput.trim() ? (
              <button
                type="button"
                onClick={() => setTableQInput("")}
                className={`min-h-11 shrink-0 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 ${fieldFocus}`}
              >
                {t("pages.notifications.clearSearch")}
              </button>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="ml-auto rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {t("pages.notifications.refresh")}
          </button>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-[720px] w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">{t("pages.notifications.colWhen")}</th>
                <th className="px-4 py-3">{t("pages.notifications.colKind")}</th>
                <th className="px-4 py-3">{t("pages.notifications.colTo")}</th>
                <th className="px-4 py-3">{t("pages.notifications.colMessage")}</th>
                <th className="px-4 py-3">{t("pages.notifications.colStatus")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                    {t("pages.common.loading")}
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-rose-700">
                    {error}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-0 align-top">
                    <ListEmptyState
                      icon="bell"
                      title={t("pages.notifications.emptyTitle")}
                      description={t("pages.notifications.emptyHint")}
                      primary={{
                        kind: "hash",
                        href: "#notifications-test",
                        label: t("pages.notifications.emptyCtaTest"),
                      }}
                    />
                  </td>
                </tr>
              ) : displayRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                    {t("pages.notifications.noTableMatches")}
                  </td>
                </tr>
              ) : (
                displayRows.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 align-top">
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                      {fmt(r.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-800">
                      {kindLabel(r.kind)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-700">
                      {r.recipient ?? t("pages.common.empty")}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-700">
                      <div className="max-w-md whitespace-pre-wrap">{r.message}</div>
                      {r.errorMessage ? (
                        <div className="mt-1 text-[11px] text-rose-700">⚠ {r.errorMessage}</div>
                      ) : null}
                      {r.providerRef ? (
                        <div className="mt-1 text-[10px] text-slate-400">
                          {t("pages.common.refPrefix")} {r.providerRef}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ${STATUS_STYLES[r.status]}`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
