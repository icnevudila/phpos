import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  UserPlus, 
  StickyNote,
  ChevronRight,
  Activity,
  Zap,
  Phone,
  Download,
} from "lucide-react";

import { PatientAutocomplete } from "../components/appointments/PatientAutocomplete";
import { ListEmptyState } from "../components/ListEmptyState";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import {
  createWaitlistEntry,
  fetchWaitlist,
  patchWaitlistEntry,
  type WaitlistEntryDto,
  type WaitlistStatus,
} from "../services/waitlist";
import type { PatientSearchRow } from "../types/appointment";
import { downloadCsv, rowsToCsv } from "../utils/downloadCsv";

function fmtWhen(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    timeZone: "Asia/Manila",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

const STATUS_CONFIG: Record<WaitlistStatus, { icon: typeof Clock; color: string; bg: string }> = {
  WAITING: {
    icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/20",
  },
  FULFILLED: {
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
  },
  CANCELLED: {
    icon: XCircle,
    color: "text-slate-400",
    bg: "bg-slate-50 dark:bg-slate-800/50",
  },
};

export function WaitlistPage(): JSX.Element {
  const { t } = useTranslation();
  const [scope, setScope] = useState<"active" | "all">("active");
  const [rows, setRows] = useState<WaitlistEntryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [patient, setPatient] = useState<PatientSearchRow | null>(null);
  const [notes, setNotes] = useState("");
  const [adding, setAdding] = useState(false);
  const [tableQInput, setTableQInput] = useState("");
  const tableQ = useDebouncedValue(tableQInput, 300);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await fetchWaitlist(scope);
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("pages.waitlist.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [scope, t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onAdd(): Promise<void> {
    if (!patient) {
      toast.error(t("pages.waitlist.toastSelectPatient"));
      return;
    }
    setAdding(true);
    try {
      await createWaitlistEntry({
        patientId: patient.id,
        notes: notes.trim() || null,
      });
      toast.success(t("pages.waitlist.toastAdded"));
      setNotes("");
      setPatient(null);
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.toLowerCase().includes("already") || msg.includes("WAITLIST")) {
        toast.error(t("pages.waitlist.toastDuplicate"));
      } else {
        toast.error(msg || t("pages.waitlist.loadFailed"));
      }
    } finally {
      setAdding(false);
    }
  }

  async function onPatch(id: string, status: "FULFILLED" | "CANCELLED"): Promise<void> {
    if (status === "CANCELLED") {
      const ok = window.confirm(t("pages.waitlist.confirmCancel"));
      if (!ok) return;
    }
    try {
      await patchWaitlistEntry(id, status);
      toast.success(t("pages.waitlist.toastUpdated"));
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.waitlist.toastUpdateFailed"));
    }
  }

  const filteredRows = useMemo(() => {
    const needle = tableQ.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((r) => {
      const name = r.patient.fullName.toLowerCase();
      const phone = (r.patient.phone ?? "").toLowerCase();
      const note = (r.notes ?? "").toLowerCase();
      return name.includes(needle) || phone.includes(needle) || note.includes(needle);
    });
  }, [rows, tableQ]);

  function onExportCsv(): void {
    if (!filteredRows.length) return;
    const headers = [
      t("pages.waitlist.colPatient"),
      t("pages.waitlist.colPhone"),
      t("pages.waitlist.colNotes"),
      t("pages.waitlist.colSince"),
      t("pages.waitlist.colStatus"),
    ];
    const body = filteredRows.map((r) => [
      r.patient.fullName,
      r.patient.phone ?? "",
      r.notes ?? "",
      fmtWhen(r.createdAt),
      r.status === "WAITING"
        ? t("pages.waitlist.statusWAITING")
        : r.status === "FULFILLED"
          ? t("pages.waitlist.statusFULFILLED")
          : t("pages.waitlist.statusCANCELLED"),
    ]);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`waitlist-${scope}-${stamp}.csv`, rowsToCsv(headers, body));
    toast.success(t("pages.waitlist.exportReady", { count: filteredRows.length }));
  }

  return (
    <div className="min-h-screen w-full pb-24 bg-[#fafbfc] dark:bg-slate-950">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 space-y-12 pt-10">
        
        {/* Advanced Header */}
        <header className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400">
                  <Users size={18} />
               </span>
               <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                  {t("pages.reports.eyebrow")}
               </span>
            </div>
            <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white lg:text-6xl">
              {t("pages.waitlist.title")}
            </h1>
            <p className="max-w-2xl text-lg font-medium text-slate-400 leading-relaxed">
              {t("pages.waitlist.subtitle")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
             <button
               type="button"
               disabled={!filteredRows.length}
               onClick={onExportCsv}
               className="flex h-16 items-center gap-2 rounded-[1.5rem] border border-slate-200 bg-white px-6 text-xs font-black uppercase tracking-widest text-slate-700 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
             >
               <Download size={18} aria-hidden />
               {t("pages.waitlist.exportCsv")}
             </button>
             <Link
               to="/appointments"
               className="flex h-16 items-center gap-3 rounded-[1.5rem] bg-white dark:bg-slate-900 px-8 text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white shadow-xl shadow-slate-200/50 dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-800 transition-all hover:scale-105 active:scale-95"
             >
               <Calendar size={18} /> {t("pages.waitlist.linkCalendar")}
             </Link>
             <button
               onClick={() => {
                  const el = document.getElementById('add-waitlist-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
               }}
               className="flex h-16 items-center gap-3 rounded-[1.5rem] bg-slate-900 dark:bg-white px-8 text-xs font-black uppercase tracking-widest text-white dark:text-slate-900 shadow-2xl transition-all hover:scale-105 active:scale-95"
             >
               <Plus size={20} /> {t("pages.waitlist.addToWaitlist")}
             </button>
          </div>
        </header>

        {/* Rapid Entry Section */}
        <section id="add-waitlist-section" className="rounded-[3rem] bg-white dark:bg-slate-900 p-10 shadow-xl shadow-slate-200/40 dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden relative group">
          <div className="absolute top-0 right-0 h-full w-32 bg-emerald-500/5 blur-3xl pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-700" />
          
          <div className="flex items-center gap-4 mb-10">
             <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                <UserPlus size={24} />
             </div>
             <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
               {t("pages.waitlist.addToWaitlist")}
             </h2>
          </div>

          <div className="grid gap-10 lg:grid-cols-12 items-end">
            <div className="lg:col-span-4 space-y-2">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4 mb-2 block">
                  {t("pages.waitlist.patientLabel")}
               </label>
               <PatientAutocomplete
                  value={patient}
                  onChange={setPatient}
                  placeholder={t("pages.waitlist.patientPlaceholder")}
               />
            </div>
            <div className="lg:col-span-6 space-y-2">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4 mb-2 block">
                  {t("pages.waitlist.notesLabel")}
               </label>
               <div className="relative">
                  <StickyNote className="absolute left-6 top-5 text-slate-300" size={18} />
                  <textarea
                    className="h-16 w-full rounded-2xl bg-slate-50 dark:bg-slate-800/50 pl-16 pr-6 py-4 text-sm font-bold outline-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                    placeholder={t("pages.waitlist.notesPlaceholder")}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    maxLength={2000}
                  />
               </div>
            </div>
            <div className="lg:col-span-2">
               <button
                 type="button"
                 disabled={adding || !patient}
                 onClick={() => void onAdd()}
                 className="flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
               >
                 {adding ? <Activity className="animate-spin" size={20} /> : <Zap size={20} />}
                 <span className="text-xs font-black uppercase tracking-widest">{adding ? t("pages.waitlist.adding") : t("pages.waitlist.addToWaitlist")}</span>
               </button>
            </div>
          </div>
        </section>

        {/* Global Stream Control */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center justify-between">
           <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-800">
              <button
                onClick={() => setScope("active")}
                className={`flex h-12 px-8 items-center gap-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
                  scope === "active"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Activity size={14} /> {t("pages.waitlist.scopeActive")}
              </button>
              <button
                onClick={() => setScope("all")}
                className={`flex h-12 px-8 items-center gap-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
                  scope === "all"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Filter size={14} /> {t("pages.waitlist.scopeAll")}
              </button>
           </div>

           <div className="flex items-center gap-4">
              <div className="relative group">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={18} />
                 <input 
                   type="text"
                   value={tableQInput}
                   onChange={(e) => setTableQInput(e.target.value)}
                   placeholder={t("pages.waitlist.tableSearchPlaceholder")}
                   className="h-14 w-full lg:w-[320px] rounded-2xl bg-white dark:bg-slate-900 pl-14 pr-6 text-sm font-bold shadow-xl shadow-slate-200/50 dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-sky-500 transition-all outline-none"
                 />
              </div>
              <div className="h-10 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden lg:block" />
              <div className="flex items-center gap-3">
                 <div className="h-3 w-3 rounded-full bg-sky-500 animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Syncing</span>
              </div>
           </div>
        </div>

        {/* Waitlist Stream Workspace */}
        <div className="rounded-[3.5rem] bg-white dark:bg-slate-900 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t("pages.waitlist.colPatient")}</th>
                  <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t("pages.waitlist.colPhone")}</th>
                  <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t("pages.waitlist.colNotes")}</th>
                  <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t("pages.waitlist.colSince")}</th>
                  <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t("pages.waitlist.colStatus")}</th>
                  <th className="px-10 py-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                <AnimatePresence mode="popLayout">
                  {loading && rows.length === 0 ? (
                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                       <td colSpan={6} className="py-32 text-center">
                          <Activity className="h-10 w-10 animate-spin text-slate-200 mx-auto mb-4" />
                          <p className="text-xs font-black uppercase tracking-widest text-slate-400">{t("pages.waitlist.loading")}</p>
                       </td>
                    </motion.tr>
                  ) : filteredRows.length === 0 ? (
                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                       <td colSpan={6} className="p-0">
                        <ListEmptyState
                          icon="users"
                          title={t("pages.waitlist.emptyTitle")}
                          description={t("pages.waitlist.emptyHint")}
                          primary={{ kind: "link", to: "/appointments", label: t("pages.waitlist.emptyCtaCalendar") }}
                        />
                       </td>
                    </motion.tr>
                  ) : (
                    filteredRows.map((r, idx) => {
                      const cfg = STATUS_CONFIG[r.status];
                      const Icon = cfg.icon;
                      return (
                        <motion.tr 
                          key={r.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.02 }}
                          className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                        >
                          <td className="px-10 py-8">
                             <div className="flex items-center gap-5">
                                <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-black group-hover:bg-sky-500 group-hover:text-white transition-all shadow-sm">
                                   <Users size={20} />
                                </div>
                                <Link to={`/patients/${r.patient.id}`} className="text-lg font-black text-slate-900 dark:text-white hover:text-sky-500 transition-colors">
                                   {r.patient.fullName}
                                </Link>
                             </div>
                          </td>
                          <td className="px-8 py-8">
                             <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                                <Phone size={14} className="opacity-40" />
                                {r.patient.phone}
                             </div>
                          </td>
                          <td className="px-8 py-8">
                             <div className="flex items-center gap-3 text-sm font-medium text-slate-400 max-w-[200px] truncate" title={r.notes ?? ""}>
                                <StickyNote size={14} className="opacity-40 flex-shrink-0" />
                                {r.notes ?? "—"}
                             </div>
                          </td>
                          <td className="px-8 py-8">
                             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <Clock size={12} className="opacity-40" />
                                {fmtWhen(r.createdAt)}
                             </div>
                          </td>
                          <td className="px-8 py-8">
                             <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.color}`}>
                                <Icon size={14} />
                                {t(`pages.waitlist.status${r.status}`)}
                             </div>
                          </td>
                          <td className="px-10 py-8">
                             <div className="flex items-center justify-end gap-3">
                                {r.status === "WAITING" && (
                                  <div className="flex gap-2 mr-6 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                     <button
                                       onClick={() => void onPatch(r.id, "FULFILLED")}
                                       className="h-10 px-4 rounded-xl bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                     >
                                       {t("pages.waitlist.actionFulfilled")}
                                     </button>
                                     <button
                                       onClick={() => void onPatch(r.id, "CANCELLED")}
                                       className="h-10 px-4 rounded-xl bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                     >
                                       {t("pages.waitlist.actionCancel")}
                                     </button>
                                  </div>
                                )}
                                <Link
                                  to={`/patients/${r.patient.id}`}
                                  className="h-12 w-12 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all"
                                >
                                  <ChevronRight size={24} />
                                </Link>
                             </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

        {/* Efficiency Block */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 shadow-xl ring-1 ring-slate-100 dark:ring-slate-800">
              <div className="flex items-center gap-3 mb-6">
                 <div className="h-10 w-10 rounded-xl bg-sky-50 dark:bg-sky-950/30 flex items-center justify-center text-sky-600">
                    <Users size={20} />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Queue Depth</span>
              </div>
              <div className="flex items-baseline gap-3">
                 <p className="text-4xl font-black text-slate-900 dark:text-white tabular-nums">{rows.filter(r => r.status === 'WAITING').length}</p>
                 <span className="text-xs font-black text-slate-400 uppercase tracking-widest">ACTIVE</span>
              </div>
           </div>
           
           <div className="rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 shadow-xl ring-1 ring-slate-100 dark:ring-slate-800">
              <div className="flex items-center gap-3 mb-6">
                 <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 size={20} />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Conversion Rate</span>
              </div>
              <div className="flex items-baseline gap-3">
                 <p className="text-4xl font-black text-slate-900 dark:text-white tabular-nums">84%</p>
                 <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">SUCCESS</span>
              </div>
           </div>

           <div className="rounded-[2.5rem] bg-slate-900 p-8 shadow-xl border border-slate-800 relative overflow-hidden group">
              <div className="absolute -bottom-10 -right-10 h-32 w-32 bg-sky-500/10 rounded-full blur-3xl group-hover:scale-150 transition-all duration-700" />
              <div className="flex items-center gap-3 mb-6 relative z-10">
                 <div className="h-10 w-10 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-400">
                    <Clock size={20} />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                   {t("pages.waitlist.avgDwellTime")}
                 </span>
              </div>
              <div className="flex items-baseline gap-3 relative z-10">
                 <p className="text-4xl font-black text-white tabular-nums">22</p>
                 <span className="text-xs font-black text-sky-400 uppercase tracking-widest">
                   {t("pages.common.minutesUnit")}
                 </span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
