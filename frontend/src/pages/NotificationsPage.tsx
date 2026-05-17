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
  type NotificationRow,
  type NotificationStatus,
} from "../services/notifications";

type Status = NotificationStatus;

const STATUS_STYLES: Record<Status, { color: string, bg: string, icon: any }> = {
  PENDING: { color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/20", icon: Clock },
  SENT: { color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/20", icon: CheckCircle2 },
  FAILED: { color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/20", icon: AlertCircle },
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
    <div className="min-h-screen w-full pb-24 bg-[#fafbfc] dark:bg-slate-950">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 space-y-12 pt-10">
        
        {/* Cinematic Header */}
        <header className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400 shadow-sm">
                   <Bell size={20} />
                </span>
                <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                   Unified Dispatch Intelligence
                </span>
             </div>
             <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white lg:text-7xl">
               Notifications <span className="text-sky-500 italic">Hub</span>
             </h1>
             <p className="max-w-2xl text-lg font-medium text-slate-400 leading-relaxed">
               {t("pages.notifications.subtitle")}
             </p>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden lg:flex flex-col items-end px-6 py-3 border-r border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {t("pages.notifications.systemLink")}
                </span>
                <span className="flex items-center gap-2 text-xs font-bold text-emerald-500 mt-1">
                   <Zap size={14} className="fill-emerald-500" /> {t("pages.common.syncHealthy")}
                </span>
             </div>
             <button 
               onClick={() => void load()}
               className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-800 transition-all hover:scale-105 active:scale-95"
             >
               <RefreshCw className={loading ? "animate-spin text-sky-500" : "text-slate-400"} size={24} />
             </button>
          </div>
        </header>

        {/* Intelligence Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           {/* Direct Dispatch Panel */}
           <section className="lg:col-span-7 rounded-[3.5rem] bg-white dark:bg-slate-900 p-10 lg:p-14 shadow-2xl shadow-slate-200/40 dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-800">
              <div className="flex items-center justify-between mb-12">
                 <div className="space-y-1">
                    <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{t("pages.notifications.testTitle")}</h2>
                    <p className="text-sm font-medium text-slate-400">{t("pages.notifications.testHint")}</p>
                 </div>
                 <div className="h-14 w-14 rounded-2xl bg-sky-50 dark:bg-sky-950/30 text-sky-600 flex items-center justify-center">
                    <Smartphone size={28} />
                 </div>
              </div>

              <div className="space-y-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">{t("pages.notifications.testPhonePlaceholder")}</label>
                    <input 
                      value={testTo}
                      onChange={e => setTestTo(e.target.value)}
                      placeholder="+63 9xx xxx xxxx"
                      className="h-16 w-full rounded-2xl bg-slate-50 dark:bg-slate-800/50 px-8 text-sm font-bold outline-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-sky-500 transition-all"
                    />
                 </div>
                 <div className="space-y-3">
                    <div className="flex items-center justify-between ml-4">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("pages.notifications.colMessage")}</label>
                       <span className={`text-[10px] font-black ${testMsg.length > 160 ? 'text-amber-500' : 'text-slate-300'}`}>
                          {testMsg.length} / 160
                       </span>
                    </div>
                    <textarea 
                      value={testMsg}
                      onChange={e => setTestMsg(e.target.value)}
                      className="h-40 w-full rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 px-8 py-6 text-sm font-bold outline-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-sky-500 transition-all resize-none"
                    />
                 </div>

                 <button
                   disabled={testBusy || !testTo}
                   onClick={sendTest}
                   className="w-full h-18 rounded-[1.5rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-40"
                 >
                   {testBusy ? <RefreshCw className="animate-spin" size={20} /> : <Send size={20} />}
                   {testBusy ? "Broadcasting..." : t("pages.notifications.sendTest")}
                 </button>
              </div>
           </section>

           {/* Automation Control Panel */}
           <section className="lg:col-span-5 flex flex-col gap-8">
              <div className="flex-1 rounded-[3.5rem] bg-slate-900 p-10 lg:p-12 shadow-2xl relative overflow-hidden group border border-slate-800">
                 <div className="absolute top-0 right-0 h-40 w-40 bg-sky-500/10 blur-[80px]" />
                 <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                       <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-sky-400">
                          <Server size={24} />
                       </div>
                       <h2 className="text-xl font-black text-white">{t("pages.notifications.cronTitle")}</h2>
                    </div>
                    <p className="text-sm font-medium text-slate-400 mb-10 leading-relaxed">{t("pages.notifications.cronHint")}</p>
                    
                    <div className="grid grid-cols-1 gap-4">
                       <button
                         onClick={() => triggerCron("daily")}
                         disabled={cronBusy !== null}
                         className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group/btn"
                       >
                          <div className="text-left">
                             <p className="text-[10px] font-black uppercase tracking-widest text-sky-400 mb-1">Morning Dispatch</p>
                             <p className="text-sm font-bold text-white">{t("pages.notifications.cronDaily")}</p>
                          </div>
                          {cronBusy === 'daily' ? <RefreshCw className="animate-spin text-sky-400" /> : <ChevronRight size={20} className="text-white/20 group-hover/btn:translate-x-1 group-hover/btn:text-white" />}
                       </button>

                       <button
                         onClick={() => triggerCron("soon")}
                         disabled={cronBusy !== null}
                         className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group/btn"
                       >
                          <div className="text-left">
                             <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-1">Live Sentinel</p>
                             <p className="text-sm font-bold text-white">{t("pages.notifications.cronSoon")}</p>
                          </div>
                          {cronBusy === 'soon' ? <RefreshCw className="animate-spin text-amber-400" /> : <ChevronRight size={20} className="text-white/20 group-hover/btn:translate-x-1 group-hover/btn:text-white" />}
                       </button>
                    </div>
                 </div>
              </div>

              {/* Banner Alert */}
              <AnimatePresence>
                 {banner && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`relative p-8 rounded-[2.5rem] border flex items-start gap-4 ${
                        banner.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900' : 'bg-rose-50 border-rose-100 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900'
                      }`}
                    >
                       <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center ${banner.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                          {banner.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                       </div>
                       <div className="flex-1 pr-6">
                          <p className="text-xs font-black uppercase tracking-widest opacity-40 mb-1">Transmission Alert</p>
                          <p className="text-sm font-bold leading-relaxed">{banner.msg}</p>
                       </div>
                       <button onClick={() => setBanner(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
                          <X size={16} />
                       </button>
                    </motion.div>
                 )}
              </AnimatePresence>
           </section>
        </div>

        {/* Global Stream Section */}
        <section className="space-y-10">
           <div className="flex flex-col gap-8 lg:flex-row lg:items-center justify-between">
              <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-800 overflow-x-auto">
                 <button
                   onClick={() => setStatusFilter("")}
                   className={`flex h-12 px-8 items-center gap-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap ${
                     statusFilter === ""
                       ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg"
                       : "text-slate-400 hover:text-slate-600"
                   }`}
                 >
                   <Activity size={14} /> {t("pages.notifications.all")}
                 </button>
                 {(['PENDING', 'SENT', 'FAILED'] as Status[]).map(s => (
                   <button
                     key={s}
                     onClick={() => setStatusFilter(s)}
                     className={`flex h-12 px-8 items-center gap-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap ${
                       statusFilter === s
                         ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg"
                         : "text-slate-400 hover:text-slate-600"
                     }`}
                   >
                      <div className={`h-2 w-2 rounded-full ${STATUS_STYLES[s].color.replace('text', 'bg')}`} />
                      {s}
                   </button>
                 ))}
              </div>

              <div className="relative flex-1 max-w-md">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                 <input 
                   value={tableQInput}
                   onChange={e => setTableQInput(e.target.value)}
                   placeholder={t("pages.notifications.tableSearchPlaceholder")}
                   className="h-16 w-full rounded-3xl bg-white dark:bg-slate-900 pl-16 pr-8 text-sm font-bold shadow-xl shadow-slate-200/50 dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-800 outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                 />
              </div>
           </div>

           <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                 {loading ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-40 text-center flex flex-col items-center gap-4">
                       <RefreshCw className="animate-spin text-sky-500" size={40} />
                       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Synchronizing Logs...</p>
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
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                            className="group flex flex-col lg:flex-row lg:items-center gap-8 p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/40 dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-800 transition-all hover:shadow-2xl hover:scale-[1.01]"
                          >
                             <div className="flex items-center gap-6 flex-1 min-w-0">
                                <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.5rem] ${style.bg} ${style.color}`}>
                                   <StatusIcon size={24} />
                                </div>
                                <div className="space-y-1.5 min-w-0">
                                   <div className="flex items-center gap-3">
                                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{kindLabel(r.kind)}</span>
                                      <span className="h-1 w-1 rounded-full bg-slate-200" />
                                      <span className="text-[10px] font-black uppercase tracking-widest text-sky-500">{r.recipient}</span>
                                   </div>
                                   <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{r.message}</p>
                                   {r.errorMessage && (
                                      <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1.5">
                                         <AlertCircle size={12} /> {r.errorMessage}
                                      </p>
                                   )}
                                </div>
                             </div>

                             <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 px-8 lg:border-l border-slate-100 dark:border-slate-800">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{fmt(r.createdAt)}</span>
                                <div className="flex items-center gap-2">
                                   <div className={`h-2 w-2 rounded-full ${style.color.replace('text', 'bg')}`} />
                                   <span className={`text-[10px] font-black uppercase tracking-widest ${style.color}`}>{r.status}</span>
                                </div>
                             </div>

                             <div className="flex justify-end">
                                <button className="h-12 w-12 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-slate-900 transition-all">
                                   <MoreVertical size={20} />
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
    </div>
  );
}
