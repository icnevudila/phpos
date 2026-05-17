import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingDown, 
  Clock, 
  Search, 
  RefreshCw,
  ChevronRight,
  User,
  Hash,
  AlertCircle,
  FileText,
} from "lucide-react";

import { ListEmptyState } from "../components/ListEmptyState";
import {
  fetchAgedReceivables,
  type AgedBucketKey,
  type AgedReceivablesResponse,
} from "../services/reports";
import { formatPHP } from "../types/invoice";

export function AgedReceivablesPage(): JSX.Element {
  const { t } = useTranslation();
  const [data, setData] = useState<AgedReceivablesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const bucketLabel = useCallback(
    (key: AgedBucketKey) => t(`pages.agedReceivables.bucket.${key}`),
    [t],
  );

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const d = await fetchAgedReceivables();
      setData(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("pages.agedReceivables.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredRows = data?.rows.filter(row => 
    row.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    row.orNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (loading && !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-10 w-10 animate-spin text-emerald-500" />
          <p className="text-sm font-black uppercase tracking-widest text-slate-400">
            {t("pages.agedReceivables.loading")}
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-rose-50 text-rose-500">
          <AlertCircle size={40} />
        </div>
        <p className="text-lg font-black text-slate-900">{error ?? t("pages.agedReceivables.noData")}</p>
        <button
          onClick={() => void load()}
          className="rounded-2xl bg-slate-900 px-8 py-4 text-sm font-black text-white transition-all hover:scale-105 active:scale-95"
        >
          {t("pages.agedReceivables.refresh")}
        </button>
      </div>
    );
  }

  const empty = t("pages.common.empty");

  return (
    <div className="min-h-screen w-full pb-24 bg-[#fafbfc] dark:bg-slate-950">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 space-y-12 pt-10">
        
        {/* Advanced Header */}
        <header className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                  <TrendingDown size={18} />
               </span>
               <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                  {t("pages.reports.cardArKicker")}
               </span>
            </div>
            <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white lg:text-6xl">
              {t("pages.agedReceivables.title")}
            </h1>
            <p className="max-w-2xl text-lg font-medium text-slate-400 leading-relaxed">
              {t("pages.agedReceivables.subtitle", { asOf: data.asOf })}
            </p>
          </div>

          <div className="flex items-center gap-4">
             <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                <input 
                  type="text"
                  placeholder={t("pages.invoicesList.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-16 w-full lg:w-[320px] rounded-3xl bg-white dark:bg-slate-900 pl-16 pr-6 text-sm font-bold shadow-xl shadow-slate-200/50 dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
             </div>
             <button
               onClick={() => void load()}
               className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white dark:bg-slate-900 text-slate-400 shadow-xl shadow-slate-200/50 dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-800 transition-all hover:text-emerald-500 active:scale-95"
             >
               <RefreshCw className={loading ? "animate-spin" : ""} size={24} />
             </button>
          </div>
        </header>

        {/* Financial Pulse Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2.5rem] bg-slate-900 p-8 shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute -top-10 -right-10 h-32 w-32 bg-emerald-500/10 rounded-full blur-3xl" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 relative z-10">
              {t("pages.agedReceivables.totalOutstanding")}
            </p>
            <p className="text-3xl font-black text-white relative z-10 tabular-nums">
              {formatPHP(data.totalOutstanding)}
            </p>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-emerald-400 bg-emerald-400/10 w-fit px-3 py-1 rounded-lg relative z-10">
               <AlertCircle size={12} /> RECONCILED
            </div>
          </motion.div>

          {data.buckets.map((b, idx) => (
            <motion.div 
              key={b.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (idx + 1) * 0.05 }}
              className="rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 shadow-xl shadow-slate-100 dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-800 group hover:ring-2 hover:ring-emerald-500/20 transition-all"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{bucketLabel(b.key)}</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{formatPHP(b.balance)}</p>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-slate-400">
                 <FileText size={14} className="opacity-40" />
                 {t("pages.agedReceivables.invoiceCount", { count: b.invoiceCount })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Ledger Workspace */}
        <div className="rounded-[3rem] bg-white dark:bg-slate-900 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t("pages.agedReceivables.colPatient")}</th>
                  <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t("pages.agedReceivables.colOr")}</th>
                  <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t("pages.agedReceivables.colDays")}</th>
                  <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t("pages.agedReceivables.colBucket")}</th>
                  <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-right">{t("pages.agedReceivables.colBalance")}</th>
                  <th className="px-10 py-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                <AnimatePresence mode="popLayout">
                  {filteredRows.length === 0 ? (
                    <motion.tr 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td colSpan={6} className="py-12">
                        <ListEmptyState
                          icon="chart"
                          title={
                            searchQuery
                              ? t("pages.invoicesList.noTableMatches")
                              : t("pages.agedReceivables.emptyTitle")
                          }
                          description={
                            searchQuery
                              ? t("pages.invoicesList.searchHint")
                              : t("pages.agedReceivables.emptyHint")
                          }
                          primary={
                            !searchQuery
                              ? {
                                  kind: "link",
                                  to: "/invoices",
                                  label: t("pages.agedReceivables.emptyCtaInvoices"),
                                }
                              : undefined
                          }
                        />
                      </td>
                    </motion.tr>
                  ) : (
                    filteredRows.map((r, idx) => (
                      <motion.tr 
                        key={r.invoiceId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                      >
                        <td className="px-10 py-8">
                           <div className="flex items-center gap-5">
                              <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-black group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                 <User size={20} />
                              </div>
                              <span className="text-lg font-black text-slate-900 dark:text-white">{r.patientName}</span>
                           </div>
                        </td>
                        <td className="px-8 py-8">
                           <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-xl w-fit">
                              <Hash size={12} className="opacity-40" />
                              {r.orNumber ?? empty}
                           </div>
                        </td>
                        <td className="px-8 py-8">
                           <div className={`flex items-center gap-2 text-sm font-black ${r.daysOutstanding > 60 ? 'text-rose-500' : 'text-slate-600 dark:text-slate-300'}`}>
                              <Clock size={16} className="opacity-40" />
                              {r.daysOutstanding} <span className="text-[10px] font-bold text-slate-400">DAYS</span>
                           </div>
                        </td>
                        <td className="px-8 py-8">
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
                              {bucketLabel(r.bucket)}
                           </span>
                        </td>
                        <td className="px-8 py-8 text-right">
                           <p className="text-lg font-black text-slate-900 dark:text-white tabular-nums">
                              {formatPHP(r.balance)}
                           </p>
                        </td>
                        <td className="px-10 py-8 text-right">
                           <Link
                             to={`/invoices/${r.invoiceId}`}
                             className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-xl transition-all hover:bg-emerald-500 hover:scale-110 active:scale-95 dark:bg-white dark:text-slate-900 dark:hover:bg-emerald-400"
                           >
                             <ChevronRight size={24} />
                           </Link>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
