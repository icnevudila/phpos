import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Search, 
  Filter, 
  Calendar, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  RefreshCw,
  Wallet,
  Phone,
  FileDown,
} from "lucide-react";

import { ListEmptyState } from "../components/ListEmptyState";
import { downloadCsv, rowsToCsv } from "../utils/downloadCsv";
// InvoiceHmoClaimChips removed
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { fetchInvoices } from "../services/invoices";
import type { InvoiceDto, InvoiceStatus } from "../types/invoice";
import { formatPHP } from "../types/invoice";

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    dateStyle: "medium",
  }).format(new Date(iso));
}

const STATUS_CONFIG: Record<string, { color: string, bg: string, icon: any }> = {
  UNPAID: { color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/20", icon: AlertCircle },
  PARTIAL: { color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/20", icon: Clock },
  PAID: { color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/20", icon: CheckCircle2 },
};

export function InvoicesListPage(): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [rows, setRows] = useState<InvoiceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qInput, setQInput] = useState("");
  const q = useDebouncedValue(qInput, 300);
  const [status, setStatus] = useState<InvoiceStatus | "">("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [openHmoOnly, setOpenHmoOnly] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await fetchInvoices({
        q: q || undefined,
        status: status || undefined,
        from: from || undefined,
        to: to || undefined,
        ...(openHmoOnly ? { openHmoClaim: "1" as const } : {}),
      });
      setRows(items);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("pages.invoicesList.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [q, status, from, to, openHmoOnly, t]);

  useEffect(() => { void load(); }, [load]);

  const totals = useMemo(() => {
    const sum = (f: (i: InvoiceDto) => number) => rows.reduce((a, r) => a + f(r), 0);
    return {
      count: rows.length,
      billed: sum((r) => Number(r.total)),
      collected: sum((r) => Number(r.paid)),
      outstanding: sum((r) => Number(r.balance)),
    };
  }, [rows]);

  const stats = [
    { label: t("pages.invoicesList.statInvoices"), value: totals.count.toString(), color: "text-slate-900", icon: FileText, tone: "sky" },
    { label: t("pages.invoicesList.statBilled"), value: formatPHP(totals.billed), color: "text-slate-900", icon: TrendingUp, tone: "violet" },
    { label: t("pages.invoicesList.statCollected"), value: formatPHP(totals.collected), color: "text-emerald-700", icon: CheckCircle2, tone: "emerald" },
    { label: t("pages.invoicesList.statOutstanding"), value: formatPHP(totals.outstanding), color: "text-rose-700", icon: Wallet, tone: "rose" },
  ];

  return (
    <div className="min-h-screen w-full pb-24 bg-[#fafbfc] dark:bg-slate-950">
      <div className="mx-auto max-w-[1500px] px-6 lg:px-10 space-y-12 pt-10">
        
        {/* Header */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
           <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="h-2 w-2 rounded-full bg-emerald-500" />
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Financial Revenue Stream</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-slate-900 dark:text-white">
                Invoices<span className="text-emerald-500">.</span>
              </h1>
              <p className="text-lg font-medium text-slate-400 max-w-xl">{t("pages.invoicesList.subtitle")}</p>
           </div>

           <div className="flex items-center gap-4">
              <button 
                onClick={() => void load()}
                className="h-14 px-8 flex items-center gap-3 rounded-[1.5rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl transition-all hover:scale-105 active:scale-95"
              >
                 <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                 <span className="text-[10px] font-black uppercase tracking-widest">Sync Ledger</span>
              </button>
           </div>
        </header>

        {/* Global Financial Stats */}
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
           {stats.map((s, idx) => (
             <motion.div 
               key={s.label}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.1 }}
               className="rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 shadow-xl ring-1 ring-slate-100 dark:ring-slate-800"
             >
                <div className="flex items-center justify-between mb-8">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{s.label}</p>
                   <div className={`h-10 w-10 rounded-2xl flex items-center justify-center bg-${s.tone}-50 dark:bg-${s.tone}-950/20 text-${s.tone}-500`}>
                      <s.icon size={20} />
                   </div>
                </div>
                <p className={`text-3xl font-black tracking-tight ${s.color} dark:text-white`}>
                   {s.value}
                </p>
             </motion.div>
           ))}
        </div>

        {/* Workspace Toolbar */}
        <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-[2.5rem] shadow-xl ring-1 ring-slate-100 dark:ring-slate-800">
           <div className="flex-1 relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text"
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                placeholder={t("pages.invoicesList.searchPlaceholder")}
                className="h-16 w-full pl-16 pr-8 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-sm font-bold outline-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-emerald-500 transition-all"
              />
           </div>
           
           <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 h-16 ring-1 ring-slate-100 dark:ring-slate-800">
              <Filter size={16} className="text-slate-400 ml-2" />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as InvoiceStatus | "")}
                className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 px-4 outline-none"
              >
                <option value="">{t("pages.invoicesList.all")}</option>
                <option value="UNPAID">{t("pages.invoicesList.statusUnpaid")}</option>
                <option value="PARTIAL">{t("pages.invoicesList.statusPartial")}</option>
                <option value="PAID">{t("pages.invoicesList.statusPaid")}</option>
              </select>
           </div>

           <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 h-16 ring-1 ring-slate-100 dark:ring-slate-800">
              <Calendar size={16} className="text-slate-400" />
              <div className="flex items-center gap-3">
                 <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="bg-transparent text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 outline-none" />
                 <span className="text-slate-200">—</span>
                 <input type="date" value={to} onChange={e => setTo(e.target.value)} className="bg-transparent text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 outline-none" />
              </div>
           </div>

           <button
              type="button"
              disabled={rows.length === 0}
              onClick={() => {
                const headers = [
                  t("pages.invoicesList.colOr"),
                  t("pages.invoicesList.colPatient"),
                  t("pages.invoicesList.colTotal"),
                  t("pages.invoicesList.colPaid"),
                  t("pages.invoicesList.colBalance"),
                  t("pages.invoicesList.colStatus"),
                ];
                const body = rows.map((r) => [
                  r.orNumber ?? "",
                  r.patient.fullName,
                  String(r.total),
                  String(r.paid),
                  String(r.balance),
                  r.status,
                ]);
                downloadCsv(
                  `invoices-${new Date().toISOString().slice(0, 10)}.csv`,
                  rowsToCsv(headers, body),
                );
              }}
              className="flex h-16 items-center gap-3 rounded-[1.5rem] bg-white dark:bg-slate-900 px-6 text-xs font-black uppercase tracking-widest text-slate-600 shadow-xl ring-1 ring-slate-100 disabled:opacity-40 dark:text-slate-300 dark:ring-slate-800"
            >
              <FileDown size={18} />
              CSV
            </button>
           <button 
              onClick={() => setOpenHmoOnly(!openHmoOnly)}
              className={`h-16 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${openHmoOnly ? 'bg-amber-500 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-800 text-slate-500'}`}
           >
              {t("pages.invoicesList.openHmoFilter")}
           </button>
        </div>

        {/* Main Stream Table */}
        <div className="rounded-[3.5rem] bg-white dark:bg-slate-900 shadow-2xl overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800">
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1200px]">
                 <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                       <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t("pages.invoicesList.colOr")}</th>
                       <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t("pages.invoicesList.colPatient")}</th>
                       <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-right">{t("pages.invoicesList.colTotal")}</th>
                       <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-right">{t("pages.invoicesList.colPaid")}</th>
                       <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-right">{t("pages.invoicesList.colBalance")}</th>
                       <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t("pages.invoicesList.colStatus")}</th>
                       <th className="px-10 py-8"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    <AnimatePresence mode="popLayout">
                       {loading ? (
                          <tr><td colSpan={7} className="py-40 text-center"><RefreshCw className="animate-spin mx-auto text-slate-200" size={40} /></td></tr>
                       ) : error ? (
                          <tr><td colSpan={7} className="py-20 text-center text-rose-500 font-bold">{error}</td></tr>
                       ) : rows.length === 0 ? (
                          <tr><td colSpan={7} className="py-20"><ListEmptyState icon="receipt" title={t("pages.invoicesList.emptyTitle")} description={t("pages.invoicesList.emptyHint")} /></td></tr>
                       ) : rows.map((r, idx) => (
                          <motion.tr 
                             key={r.id}
                             initial={{ opacity: 0, y: 10 }}
                             animate={{ opacity: 1, y: 0 }}
                             transition={{ delay: idx * 0.02 }}
                             onClick={() => navigate(`/invoices/${r.id}`)}
                             className="group cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all"
                          >
                             <td className="px-10 py-8">
                                <div className="h-10 w-24 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                                   {r.orNumber || "PENDING"}
                                </div>
                             </td>
                             <td className="px-8 py-8">
                                <div className="space-y-1">
                                   <p className="text-base font-black text-slate-900 dark:text-white uppercase leading-none">{r.patient.fullName}</p>
                                   <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                      <Phone size={10} className="opacity-40" />
                                      {r.patient.phone}
                                      <span className="h-1 w-1 rounded-full bg-slate-200 mx-1" />
                                      {fmtDate(r.createdAt)}
                                   </div>
                                </div>
                             </td>
                             <td className="px-8 py-8 text-right text-base font-black text-slate-900 dark:text-white tabular-nums">
                                {formatPHP(r.total)}
                             </td>
                             <td className="px-8 py-8 text-right text-base font-black text-emerald-500 tabular-nums">
                                {formatPHP(r.paid)}
                             </td>
                             <td className="px-8 py-8 text-right text-base font-black text-rose-500 tabular-nums">
                                {formatPHP(r.balance)}
                             </td>
                             <td className="px-8 py-8">
                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${STATUS_CONFIG[r.status].bg} ${STATUS_CONFIG[r.status].color}`}>
                                   {r.status}
                                </div>
                                {r.hmoClaims && r.hmoClaims.length > 0 && (
                                   <div className="mt-2 flex gap-1">
                                      <div className="px-2 py-0.5 rounded-lg bg-violet-50 dark:bg-violet-900/30 text-[8px] font-black text-violet-500 uppercase tracking-tighter">HMO</div>
                                   </div>
                                )}
                             </td>
                             <td className="px-10 py-8">
                                <div className="flex items-center justify-end">
                                   <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-slate-900 transition-all">
                                      <ChevronRight size={24} />
                                   </div>
                                </div>
                             </td>
                          </motion.tr>
                       ))}
                    </AnimatePresence>
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );
}
