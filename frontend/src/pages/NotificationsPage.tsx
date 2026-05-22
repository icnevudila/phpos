import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  Send, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Zap, 
  Activity,
  Smartphone,
  Server,
  ChevronRight,
  MoreVertical,
  X
} from "lucide-react";

import { ListEmptyState } from "../components/ListEmptyState";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import {
  fetchNotifications,
  sendTestNotification,
  triggerNotificationCron,
  retryNotification,
  type NotificationRow,
  type NotificationStatus,
} from "../services/notifications";

type Status = NotificationStatus;

const STATUS_STYLES: Record<Status, { color: string, bg: string, icon: any, badgeClass: string }> = {
  PENDING: { color: "text-amber-500", bg: "bg-amber-50", icon: Clock, badgeClass: "badge badge-amber" },
  SENT:    { color: "text-teal-500",  bg: "bg-teal-50",  icon: CheckCircle2, badgeClass: "badge badge-teal" },
  FAILED:  { color: "text-rose-500",  bg: "bg-rose-50",  icon: AlertCircle, badgeClass: "badge badge-rose" },
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
  const [, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<Status | "">("");
  const [kindFilter] = useState("");
  const [testTo, setTestTo] = useState("");
  const [testMsg, setTestMsg] = useState("");
  const [testBusy, setTestBusy] = useState(false);
  const [cronBusy, setCronBusy] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);
  const [tableQInput, setTableQInput] = useState("");
  const tableQ = useDebouncedValue(tableQInput, 300);

  useEffect(() => {
    setTestMsg(t("pages.notifications.testMsgDefault"));
  }, [t, i18n.resolvedLanguage]);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await fetchNotifications({ status: statusFilter || undefined, kind: kindFilter || undefined });
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("pages.notifications.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, kindFilter, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const [retryingIds, setRetryingIds] = useState<Record<string, boolean>>({});

  async function handleRetry(id: string): Promise<void> {
    if (retryingIds[id]) return;
    setRetryingIds((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await retryNotification(id);
      if (res.status === "SENT") {
        setBanner({ msg: t("pages.notifications.retrySuccess", { defaultValue: "Notification successfully retried and sent." }), type: "success" });
      } else {
        setBanner({
          msg: t("pages.notifications.retryFailed", {
            defaultValue: "Retry failed: {{message}}",
            message: res.errorMessage ?? t("pages.notifications.testFailedUnknown"),
          }),
          type: "error",
        });
      }
      await load(true);
    } catch (e) {
      setBanner({ msg: e instanceof Error ? e.message : t("pages.notifications.retryFailedUnknown", { defaultValue: "Could not retry notification." }), type: "error" });
    } finally {
      setRetryingIds((prev) => ({ ...prev, [id]: false }));
    }
  }

  async function sendTest(): Promise<void> {
    setTestBusy(true);
    setBanner(null);
    try {
      const res = await sendTestNotification({ to: testTo, message: testMsg });
      if (res.status === "SENT") {
        setBanner({ msg: t("pages.notifications.testQueued"), type: 'success' });
      } else {
        setBanner({
          msg: t("pages.notifications.testFailed", { message: res.errorMessage ?? t("pages.notifications.testFailedUnknown") }),
          type: 'error'
        });
      }
      await load(true);
    } catch (e) {
      setBanner({ msg: e instanceof Error ? e.message : t("pages.notifications.testSendFailed"), type: 'error' });
    } finally {
      setTestBusy(false);
    }
  }

  async function triggerCron(kindArg: "daily" | "soon"): Promise<void> {
    setCronBusy(kindArg);
    setBanner(null);
    try {
      const res = await triggerNotificationCron(kindArg);
      setBanner({
        msg: t("pages.notifications.cronResult", {
          label: kindArg === "daily" ? t("pages.notifications.cronDailyLabel") : t("pages.notifications.cronSoonLabel"),
          found: res.found,
          sent: res.sent,
        }),
        type: 'success'
      });
      await load(true);
    } catch (e) {
      setBanner({ msg: e instanceof Error ? e.message : t("pages.notifications.cronTriggerFailed"), type: 'error' });
    } finally {
      setCronBusy(null);
    }
  }

  // kindKeys removed

  const displayRows = useMemo(() => {
    const q = tableQ.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const hay = [r.kind, r.recipient ?? "", r.message, r.errorMessage ?? ""].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [rows, tableQ]);

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
              <Bell size={15} />
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Unified Dispatch Intelligence
            </span>
          </div>
          <h1 className="page-header-title">{t("pages.notifications.title") || "Notifications"}</h1>
          <p className="page-header-sub">{t("pages.notifications.subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex flex-col items-end pr-4 border-r border-slate-100">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              {t("pages.notifications.systemLink")}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-teal-500 mt-0.5">
              <Zap size={12} className="fill-teal-500" /> {t("pages.common.syncHealthy")}
            </span>
          </div>
          <button
            onClick={() => void load()}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className={loading ? "animate-spin text-teal-500 h-4 w-4" : "h-4 w-4 text-slate-400"} />
          </button>
        </div>
      </div>

      {/* Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Send Test Panel */}
        <section className="lg:col-span-7 card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-800">{t("pages.notifications.testTitle")}</h2>
              <p className="text-sm text-slate-400 mt-0.5">{t("pages.notifications.testHint")}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Smartphone size={22} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">{t("pages.notifications.testPhonePlaceholder")}</label>
              <input
                value={testTo}
                onChange={e => setTestTo(e.target.value)}
                placeholder="+63 9xx xxx xxxx"
                className="h-11 w-full rounded-xl bg-slate-50 px-4 text-sm font-medium outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-teal-500 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">{t("pages.notifications.colMessage")}</label>
                <span className={`text-xs font-semibold ${testMsg.length > 160 ? 'text-amber-500' : 'text-slate-300'}`}>
                  {testMsg.length} / 160
                </span>
              </div>
              <textarea
                value={testMsg}
                onChange={e => setTestMsg(e.target.value)}
                className="h-32 w-full rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-teal-500 transition-all resize-none"
              />
            </div>
            <button
              disabled={testBusy || !testTo}
              onClick={sendTest}
              className="btn-primary w-full flex items-center justify-center gap-3 disabled:opacity-40"
            >
              {testBusy ? <RefreshCw className="animate-spin h-4 w-4" /> : <Send size={16} />}
              {testBusy ? "Broadcasting..." : t("pages.notifications.sendTest")}
            </button>
          </div>
        </section>

        {/* Automation Panel */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex-1 card bg-slate-800 ring-0 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-sky-400">
                <Server size={20} />
              </div>
              <h2 className="text-base font-bold text-white">{t("pages.notifications.cronTitle")}</h2>
            </div>
            <p className="text-sm font-medium text-slate-400 mb-6 leading-relaxed">{t("pages.notifications.cronHint")}</p>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => triggerCron("daily")}
                disabled={cronBusy !== null}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group/btn"
              >
                <div className="text-left">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-sky-400 mb-0.5">Morning Dispatch</p>
                  <p className="text-sm font-semibold text-white">{t("pages.notifications.cronDaily")}</p>
                </div>
                {cronBusy === 'daily' ? <RefreshCw className="animate-spin text-sky-400 h-4 w-4" /> : <ChevronRight size={18} className="text-white/20 group-hover/btn:translate-x-1 group-hover/btn:text-white transition-all" />}
              </button>

              <button
                onClick={() => triggerCron("soon")}
                disabled={cronBusy !== null}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group/btn"
              >
                <div className="text-left">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-400 mb-0.5">Live Sentinel</p>
                  <p className="text-sm font-semibold text-white">{t("pages.notifications.cronSoon")}</p>
                </div>
                {cronBusy === 'soon' ? <RefreshCw className="animate-spin text-amber-400 h-4 w-4" /> : <ChevronRight size={18} className="text-white/20 group-hover/btn:translate-x-1 group-hover/btn:text-white transition-all" />}
              </button>
            </div>
          </div>

          {/* Banner Alert */}
          <AnimatePresence>
            {banner && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`relative p-5 rounded-2xl border flex items-start gap-3 ${ banner.type === 'success' ? 'bg-teal-50 border-teal-100 text-teal-800' : 'bg-rose-50 border-rose-100 text-rose-800' }`}
              >
                <div className={`h-9 w-9 shrink-0 rounded-lg flex items-center justify-center ${banner.type === 'success' ? 'bg-teal-500 text-white' : 'bg-rose-500 text-white'}`}>
                  {banner.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                </div>
                <div className="flex-1 pr-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest opacity-50 mb-0.5">Alert</p>
                  <p className="text-sm font-medium leading-relaxed">{banner.msg}</p>
                </div>
                <button onClick={() => setBanner(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>

      {/* Notification Log */}
      <section className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center justify-between">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-white p-1.5 rounded-xl shadow-sm ring-1 ring-slate-100 overflow-x-auto">
            <button
              onClick={() => setStatusFilter("")}
              className={`flex h-9 px-4 items-center gap-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${ statusFilter === "" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-600" }`}
            >
              <Activity size={13} /> {t("pages.notifications.all")}
            </button>
            {(['PENDING', 'SENT', 'FAILED'] as Status[]).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`flex h-9 px-4 items-center gap-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${ statusFilter === s ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-600" }`}
              >
                <div className={`h-2 w-2 rounded-full ${STATUS_STYLES[s].color.replace('text', 'bg')}`} />
                {s}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input
              value={tableQInput}
              onChange={e => setTableQInput(e.target.value)}
              placeholder={t("pages.notifications.tableSearchPlaceholder")}
              className="h-11 w-full rounded-xl bg-white pl-11 pr-4 text-sm font-medium shadow-sm ring-1 ring-slate-100 outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            />
          </div>
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center py-20">
                <div className="h-8 w-8 rounded-xl bg-teal-50 flex items-center justify-center">
                  <RefreshCw className="h-4 w-4 animate-spin text-teal-500" />
                </div>
              </motion.div>
            ) : displayRows.length === 0 ? (
              <ListEmptyState
                icon="bell"
                title={t("pages.notifications.emptyTitle")}
                description={t("pages.notifications.emptyHint")}
              />
            ) : (
              displayRows.map((r, idx) => {
                const style = STATUS_STYLES[r.status] || STATUS_STYLES.PENDING;
                const StatusIcon = style.icon;
                return (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                    className="group flex flex-col lg:flex-row lg:items-center gap-5 p-5 bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 transition-all hover:shadow-md hover:scale-[1.005]"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${style.bg} ${style.color}`}>
                        <StatusIcon size={22} />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">{kindLabel(r.kind)}</span>
                          <span className="h-1 w-1 rounded-full bg-slate-200" />
                          <span className="text-xs font-semibold text-teal-500">{r.recipient}</span>
                        </div>
                        <p className="text-sm font-medium text-slate-800 line-clamp-1">{r.message}</p>
                        {r.errorMessage && (
                          <p className="text-[11px] font-medium text-rose-500 flex items-center gap-1">
                            <AlertCircle size={11} /> {r.errorMessage}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-2 px-5 lg:border-l border-slate-100">
                      <span className="text-[11px] font-medium text-slate-400">{fmt(r.createdAt)}</span>
                      <span className={style.badgeClass}>{r.status}</span>
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                      {r.status === "FAILED" && (
                        <button
                          onClick={() => void handleRetry(r.id)}
                          disabled={retryingIds[r.id]}
                          className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-500 hover:text-white transition-all text-xs font-semibold uppercase tracking-widest disabled:opacity-50"
                        >
                          <RefreshCw size={13} className={retryingIds[r.id] ? "animate-spin" : ""} />
                          {retryingIds[r.id] ? "Retrying..." : t("pages.notifications.retryBtn", { defaultValue: "Retry" })}
                        </button>
                      )}
                      <button className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-teal-500 group-hover:text-white transition-all">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
