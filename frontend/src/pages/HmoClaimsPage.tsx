import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  Search, 
  Filter, 
  Download, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  ChevronRight, 
  Copy,
  Wallet,
  ArrowUpRight,
  RefreshCw,
  Zap,
  FileText
} from "lucide-react";

import { ListEmptyState } from "../components/ListEmptyState";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { HMO_CLAIM_STATUS_I18N_KEY } from "../constants/hmoClaimStatusLabels";
import { canSetHmoClaimStatus } from "../constants/hmoClaimStatusTransitions";
import {
  downloadHmoClaimsReconciliationCsv,
  type HmoClaimStatus,
  fetchHmoClaims,
  fetchHmoProviders,
  updateHmoClaimStatus,
} from "../services/hmo";

const PHP = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const STATUS_CONFIG: Record<HmoClaimStatus, { color: string, bg: string, icon: any }> = {
  DRAFT: { color: "text-slate-500", bg: "bg-slate-100 dark:bg-slate-800", icon: FileText },
  SUBMITTED: { color: "text-sky-500", bg: "bg-sky-50 dark:bg-sky-950/20", icon: Clock },
  APPROVED: { color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/20", icon: CheckCircle2 },
  PARTIAL_APPROVED: { color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/20", icon: AlertCircle },
  REJECTED: { color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/20", icon: XCircle },
  PAID: { color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/20", icon: Shield },
};

const OPEN_CLAIM_STATUSES: HmoClaimStatus[] = ["DRAFT", "SUBMITTED", "PARTIAL_APPROVED"];
const AGING_BANDS = ["ALL", "FRESH", "WARNING", "CRITICAL"] as const;
type AgingBand = (typeof AGING_BANDS)[number];
const CLAIM_STATUSES: HmoClaimStatus[] = ["DRAFT", "SUBMITTED", "APPROVED", "PARTIAL_APPROVED", "REJECTED", "PAID"];

export function HmoClaimsPage(): JSX.Element {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatusParam = searchParams.get("status");
  const initialAgingParam = searchParams.get("aging");
  
  const [status, setStatus] = useState<HmoClaimStatus | "">(
    initialStatusParam && CLAIM_STATUSES.includes(initialStatusParam as HmoClaimStatus)
      ? (initialStatusParam as HmoClaimStatus)
      : "",
  );
  const [providerId, setProviderId] = useState(searchParams.get("provider") ?? "");
  const [agingBand, setAgingBand] = useState<AgingBand>(
    initialAgingParam && AGING_BANDS.includes(initialAgingParam as AgingBand)
      ? (initialAgingParam as AgingBand)
      : "ALL",
  );
  const [sortProvidersByOpenLoad] = useState(searchParams.get("sortOpen") !== "0");
  const [tableQInput, setTableQInput] = useState(searchParams.get("q") ?? "");
  const [reconYear] = useState(() => new Date().getUTCFullYear());
  const [reconMonth, setReconMonth] = useState(() => new Date().getUTCMonth() + 1);
  const [runbookDone, setRunbookDone] = useState<Record<string, boolean>>({});
  const tableQ = useDebouncedValue(tableQInput, 300);
  // isRunbookContext removed

  // contextBanner removed (already done in previous step)

  const { data: providers = [] } = useQuery({
    queryKey: ["hmoProviders"],
    queryFn: fetchHmoProviders,
  });

  const { data: claims = [], isLoading: loading, error: claimsError } = useQuery({
    queryKey: ["hmoClaims", status, providerId],
    queryFn: () => fetchHmoClaims({
      status: status || undefined,
      providerId: providerId || undefined,
      limit: 100,
    }),
  });

  useEffect(() => {
    if (claimsError) toast.error((claimsError as Error).message);
  }, [claimsError]);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem("hmo-runbook-progress");
      if (raw) setRunbookDone(JSON.parse(raw));
    } catch { setRunbookDone({}); }
  }, []);

  useEffect(() => {
    window.sessionStorage.setItem("hmo-runbook-progress", JSON.stringify(runbookDone));
  }, [runbookDone]);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (status) next.set("status", status); else next.delete("status");
    if (providerId) next.set("provider", providerId); else next.delete("provider");
    if (agingBand !== "ALL") next.set("aging", agingBand); else next.delete("aging");
    if (tableQInput.trim()) next.set("q", tableQInput.trim()); else next.delete("q");
    if (sortProvidersByOpenLoad) next.delete("sortOpen"); else next.set("sortOpen", "0");
    if (next.toString() !== searchParams.toString()) setSearchParams(next, { replace: true });
  }, [status, providerId, agingBand, tableQInput, sortProvidersByOpenLoad, searchParams, setSearchParams]);

  const metrics = useMemo(() => ({
    pending: claims.filter(c => c.status === "SUBMITTED" || c.status === "DRAFT").length,
    approved: claims.filter(c => c.status === "APPROVED" || c.status === "PARTIAL_APPROVED").length,
    rejected: claims.filter(c => c.status === "REJECTED").length,
    totalRequested: claims.reduce((s, c) => s + Number(c.requestedAmount), 0),
  }), [claims]);

  const displayClaims = useMemo(() => {
    const q = tableQ.trim().toLowerCase();
    return claims.filter(c => {
      if (agingBand !== "ALL") {
        if (!OPEN_CLAIM_STATUSES.includes(c.status)) return false;
        const ageDays = Math.floor((Date.now() - new Date(c.createdAt).getTime()) / (24 * 60 * 60 * 1000));
        if (agingBand === "FRESH" && ageDays > 3) return false;
        if (agingBand === "WARNING" && (ageDays <= 3 || ageDays > 7)) return false;
        if (agingBand === "CRITICAL" && ageDays <= 7) return false;
      }
      if (!q) return true;
      return [c.claimNumber, c.patient.firstName, c.patient.lastName, c.provider.name].join(" ").toLowerCase().includes(q);
    });
  }, [claims, tableQ, agingBand]);

  // providerClaimCounts removed

  // openClaimAging removed (keep it as it is used in runbookSteps)
  const openClaimAging = useMemo(() => {
    const now = Date.now();
    const counts = { fresh: 0, warning: 0, critical: 0 };
    claims.filter(c => OPEN_CLAIM_STATUSES.includes(c.status)).forEach(c => {
      const ageDays = Math.floor((now - new Date(c.createdAt).getTime()) / (24 * 60 * 60 * 1000));
      if (ageDays <= 3) counts.fresh++;
      else if (ageDays <= 7) counts.warning++;
      else counts.critical++;
    });
    return counts;
  }, [claims]);

  const runbookProgress = useMemo(() => {
    const keys = ["critical", "submit", "cashflow"];
    const doneCount = keys.filter(k => runbookDone[k]).length;
    return {
      done: doneCount,
      total: keys.length,
      pct: Math.round((doneCount / keys.length) * 100)
    };
  }, [runbookDone]);

  // providerSlaRows removed

  // priorityClaims removed

  const runbookSteps = useMemo(() => [
    { key: "critical", label: t("pages.hmoClaims.runbookStepCritical"), count: openClaimAging.critical, tone: "emerald", onClick: () => { setStatus("SUBMITTED"); setAgingBand("CRITICAL"); } },
    { key: "submit", label: t("pages.hmoClaims.runbookStepSubmit"), count: claims.filter(c => c.status === "DRAFT").length, tone: "sky", onClick: () => { setStatus("DRAFT"); setAgingBand("ALL"); } },
    { key: "cashflow", label: t("pages.hmoClaims.runbookStepCashflow"), count: claims.filter(c => c.status === "APPROVED").length, tone: "indigo", onClick: () => { setStatus("APPROVED"); setAgingBand("ALL"); } },
  ], [openClaimAging.critical, claims, t]);

  const setClaimStatus = async (id: string, next: HmoClaimStatus) => {
    try {
      await updateHmoClaimStatus(id, next);
      toast.success(t("pages.hmoClaims.toastUpdated"));
      void queryClient.invalidateQueries({ queryKey: ["hmoClaims"] });
    } catch (e) { toast.error((e as Error).message); }
  };

  const onDownloadReconciliation = async () => {
    try {
      await downloadHmoClaimsReconciliationCsv({ year: reconYear, month: reconMonth, providerId: providerId || undefined });
      toast.success(t("pages.hmoClaims.reconciliationReady"));
    } catch (e) { toast.error((e as Error).message); }
  };

  const onCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast.success(t("pages.hmoClaims.viewLinkCopied"));
  };

  return (
    <div className="min-h-screen w-full pb-24 bg-[#fafbfc] dark:bg-slate-950">
      <div className="mx-auto max-w-[1500px] px-6 lg:px-10 space-y-12 pt-10">
        
        {/* Cinematic Header */}
        <header className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
           <div className="space-y-4">
            <div className="flex items-center gap-3">
               <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                  <Shield size={18} />
               </span>
               <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                  Clinical Revenue Operations
               </span>
            </div>
            <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white lg:text-6xl">
              Claims <span className="text-violet-500 italic">Desk</span>
            </h1>
            <p className="max-w-2xl text-lg font-medium text-slate-400 leading-relaxed">
              {t("pages.hmoClaims.subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-4">
             <button
               onClick={onCopyLink}
               className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-white dark:bg-slate-900 text-slate-400 shadow-xl ring-1 ring-slate-100 dark:ring-slate-800 transition-all hover:scale-105 active:scale-95"
               title={t("pages.hmoClaims.copyViewLink")}
             >
               <Copy size={20} />
             </button>
             <button
               onClick={() => void queryClient.invalidateQueries({ queryKey: ["hmoClaims"] })}
               className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-white dark:bg-slate-900 text-slate-400 shadow-xl ring-1 ring-slate-100 dark:ring-slate-800 transition-all hover:scale-105 active:scale-95"
             >
               <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
             </button>
          </div>
        </header>

        {/* Operational Pulse Metrics */}
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
           <PulseMetric label={t("pages.hmoClaims.metricPending")} value={metrics.pending} tone="sky" icon={Clock} />
           <PulseMetric label={t("pages.hmoClaims.metricApproved")} value={metrics.approved} tone="emerald" icon={CheckCircle2} />
           <PulseMetric label={t("pages.hmoClaims.metricRejected")} value={metrics.rejected} tone="rose" icon={XCircle} />
           <PulseMetric label={t("pages.hmoClaims.metricRequested")} value={PHP.format(metrics.totalRequested)} tone="violet" icon={Wallet} isCurrency />
        </div>

        {/* Triage Workspace */}
        <div className="grid gap-10 lg:grid-cols-12">
           {/* Runbook Column */}
           <div className="lg:col-span-4 space-y-8">
              <section className="rounded-[3rem] bg-white dark:bg-slate-900 p-10 shadow-xl ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden relative">
                 <div className="absolute top-0 right-0 h-32 w-32 bg-violet-500/5 blur-3xl" />
                 <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                       <Zap size={20} className="text-violet-500" />
                       <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Runbook</h2>
                    </div>
                    <div className="text-[10px] font-black text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full uppercase tracking-widest">
                       {runbookProgress.pct}% Done
                    </div>
                 </div>

                 <div className="space-y-4">
                    {runbookSteps.map((step) => (
                      <button
                        key={step.key}
                        onClick={() => { step.onClick(); setRunbookDone(prev => ({ ...prev, [step.key]: true })); }}
                        className={`w-full group flex items-center justify-between p-6 rounded-2xl border border-slate-50 dark:border-slate-800 transition-all hover:scale-[1.02] active:scale-95 ${
                          runbookDone[step.key] ? "bg-slate-50 dark:bg-slate-800/50 opacity-60" : "bg-white dark:bg-slate-900 shadow-sm"
                        }`}
                      >
                         <div className="flex items-center gap-5">
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-lg ${
                               step.tone === 'emerald' ? 'bg-emerald-500 shadow-emerald-500/20' : 
                               step.tone === 'sky' ? 'bg-sky-500 shadow-sky-500/20' : 
                               'bg-violet-500 shadow-violet-500/20'
                            }`}>
                               {runbookDone[step.key] ? <CheckCircle2 size={24} /> : step.key === 'critical' ? <AlertCircle size={24} /> : <Zap size={24} />}
                            </div>
                            <div className="text-left">
                               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{step.label.split('.')[0]}</p>
                               <p className="text-sm font-black text-slate-900 dark:text-white uppercase leading-none">{step.label.split('.')[1]}</p>
                            </div>
                         </div>
                         <div className="text-2xl font-black text-slate-300 group-hover:text-violet-500 transition-colors">
                            {step.count}
                         </div>
                      </button>
                    ))}
                 </div>
              </section>

              <section className="rounded-[3rem] bg-slate-900 p-10 shadow-2xl relative overflow-hidden group">
                 <div className="absolute -bottom-20 -right-20 h-64 w-64 bg-violet-500/20 rounded-full blur-[100px] group-hover:scale-150 transition-all duration-1000" />
                 <h3 className="text-xs font-black uppercase tracking-[0.3em] text-violet-400 mb-8 flex items-center gap-3">
                    <TrendingUp size={16} /> {t("pages.hmoClaims.efficiencyPulseTitle")}
                 </h3>
                 <motion.div className="space-y-6 relative z-10">
                    <EfficiencyBar label={t("pages.hmoClaims.slaCompliance")} value={88} color="bg-emerald-500" />
                    <EfficiencyBar label={t("pages.hmoClaims.submissionVelocity")} value={64} color="bg-sky-500" />
                    <EfficiencyBar label={t("pages.hmoClaims.approvalRate")} value={92} color="bg-violet-500" />
                 </motion.div>
              </section>
           </div>

           {/* Heatmap & Grid Column */}
           <div className="lg:col-span-8 space-y-10">
              {/* Filter Command Strip */}
              <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-slate-900 p-3 rounded-[2rem] shadow-xl ring-1 ring-slate-100 dark:ring-slate-800">
                 <div className="flex items-center gap-2 px-6 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <Filter size={14} /> Active Filter
                 </div>
                 <select 
                    value={status} 
                    onChange={e => setStatus(e.target.value as any)}
                    className="h-12 px-6 rounded-xl bg-transparent text-xs font-black uppercase tracking-widest text-slate-700 dark:text-white outline-none"
                 >
                    <option value="">All Statuses</option>
                    {CLAIM_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
                 <div className="h-6 w-px bg-slate-100 dark:bg-slate-800 mx-2" />
                 <select 
                    value={providerId} 
                    onChange={e => setProviderId(e.target.value)}
                    className="h-12 px-6 rounded-xl bg-transparent text-xs font-black uppercase tracking-widest text-slate-700 dark:text-white outline-none"
                 >
                    <option value="">All Providers</option>
                    {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                 </select>
                 <div className="h-6 w-px bg-slate-100 dark:bg-slate-800 mx-2" />
                 <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input 
                       value={tableQInput}
                       onChange={e => setTableQInput(e.target.value)}
                       placeholder="Search Claim # or Patient..."
                       className="h-12 w-full pl-12 pr-6 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs font-bold outline-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-violet-500 transition-all"
                    />
                 </div>
              </div>

              {/* Claims Stream Workspace */}
              <div className="rounded-[3.5rem] bg-white dark:bg-slate-900 shadow-2xl overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                       <thead>
                          <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                             <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t("pages.hmoClaims.colClaimProfile")}</th>
                             <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-right">{t("pages.hmoClaims.colRequested")}</th>
                             <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-right">{t("pages.hmoClaims.colApproved")}</th>
                             <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t("pages.hmoClaims.colStatus")}</th>
                             <th className="px-10 py-8"></th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                          <AnimatePresence mode="popLayout">
                             {loading ? (
                                <tr className="animate-pulse"><td colSpan={5} className="py-40 text-center"><RefreshCw className="animate-spin mx-auto text-slate-200" size={40} /></td></tr>
                             ) : displayClaims.length === 0 ? (
                                <tr><td colSpan={5} className="py-20"><ListEmptyState icon="shield" title={t("pages.hmoClaims.emptyTitle")} description={t("pages.hmoClaims.emptyHint")} primary={{ kind: "link", to: "/invoices", label: t("pages.hmoClaims.emptyCtaInvoices") }} /></td></tr>
                             ) : displayClaims.map((c, idx) => {
                                const cfg = STATUS_CONFIG[c.status];
                                const StatusIcon = cfg.icon;
                                return (
                                   <motion.tr 
                                      key={c.id} 
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: idx * 0.02 }}
                                      className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                                   >
                                      <td className="px-10 py-8">
                                         <div className="flex items-center gap-6">
                                            <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-black text-xs group-hover:bg-violet-500 group-hover:text-white transition-all shadow-sm uppercase tracking-tighter">
                                               {c.provider.name.slice(0, 3)}
                                            </div>
                                            <div className="space-y-1">
                                               <Link to={`/hmo-claims/${c.id}`} className="text-lg font-black text-slate-900 dark:text-white hover:text-violet-500 transition-colors flex items-center gap-2">
                                                  {c.claimNumber}
                                                  <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0" />
                                               </Link>
                                               <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                                                  <span>{c.patient.firstName} {c.patient.lastName}</span>
                                                  <span className="h-1 w-1 rounded-full bg-slate-200" />
                                                  <span className="text-[10px] uppercase tracking-widest text-slate-300">{c.provider.name}</span>
                                               </div>
                                            </div>
                                         </div>
                                      </td>
                                      <td className="px-8 py-8 text-right font-black text-slate-900 dark:text-white tabular-nums">
                                         {PHP.format(Number(c.requestedAmount))}
                                      </td>
                                      <td className="px-8 py-8 text-right font-black text-emerald-500 tabular-nums">
                                         {c.approvedAmount ? PHP.format(Number(c.approvedAmount)) : "—"}
                                      </td>
                                      <td className="px-8 py-8">
                                         <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.color}`}>
                                            <StatusIcon size={14} />
                                            {t(HMO_CLAIM_STATUS_I18N_KEY[c.status])}
                                         </div>
                                      </td>
                                      <td className="px-10 py-8">
                                         <div className="flex items-center justify-end gap-2">
                                            <div className="flex opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 gap-2">
                                               {canSetHmoClaimStatus(c.status, "SUBMITTED") && (
                                                  <button onClick={() => void setClaimStatus(c.id, "SUBMITTED")} className="h-10 px-4 rounded-xl bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-widest hover:bg-sky-500 hover:text-white transition-all shadow-sm">{t("pages.hmoClaims.actionSubmit")}</button>
                                               )}
                                               {canSetHmoClaimStatus(c.status, "DRAFT") && (
                                                  <button onClick={() => void setClaimStatus(c.id, "DRAFT")} className="h-10 px-4 rounded-xl bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm">{t("pages.hmoClaims.actionWithdraw")}</button>
                                               )}
                                               {canSetHmoClaimStatus(c.status, "APPROVED") && (
                                                  <button onClick={() => void setClaimStatus(c.id, "APPROVED")} className="h-10 px-4 rounded-xl bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-sm">{t("pages.hmoClaims.actionApprove")}</button>
                                               )}
                                               {canSetHmoClaimStatus(c.status, "PAID") && (
                                                  <button onClick={() => void setClaimStatus(c.id, "PAID")} className="h-10 px-4 rounded-xl bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-sm">{t("pages.hmoClaims.actionPaid")}</button>
                                               )}
                                            </div>
                                            <Link to={`/hmo-claims/${c.id}`} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all">
                                               <ChevronRight size={24} />
                                            </Link>
                                         </div>
                                      </td>
                                   </motion.tr>
                                );
                             })}
                          </AnimatePresence>
                       </tbody>
                    </table>
                 </div>
              </div>

              {/* Monthly Reconciliation Control */}
              <section className="rounded-[2.5rem] bg-violet-900 p-10 shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 h-full w-48 bg-white/5 blur-3xl pointer-events-none" />
                 <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="space-y-4">
                       <h3 className="text-2xl font-black tracking-tight text-white">Monthly Ledger Closure</h3>
                       <p className="text-sm font-medium text-violet-300 max-w-md">Generate BIR-compliant reconciliation CSV for month-end clinical audits.</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white/10 p-2 rounded-2xl backdrop-blur-xl">
                       <select 
                          value={reconMonth}
                          onChange={e => setReconMonth(Number(e.target.value))}
                          className="h-12 bg-transparent text-white text-xs font-black uppercase tracking-widest px-4 outline-none"
                       >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                            <option key={m} value={m} className="text-slate-900">{new Intl.DateTimeFormat("en-PH", { month: "short" }).format(new Date(2024, m - 1, 1))}</option>
                          ))}
                       </select>
                       <button
                          onClick={() => void onDownloadReconciliation()}
                          className="flex h-12 items-center gap-3 px-8 rounded-xl bg-white text-violet-900 text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
                       >
                          <Download size={16} /> {t("pages.hmoClaims.exportReconciliationCsv")}
                       </button>
                    </div>
                 </div>
              </section>
           </div>
        </div>
      </div>
    </div>
  );
}

function PulseMetric({ label, value, tone, icon: Icon, isCurrency = false }: { label: string, value: any, tone: string, icon: any, isCurrency?: boolean }) {
  const tones: any = {
    sky: "text-sky-500 bg-sky-50 dark:bg-sky-950/20",
    emerald: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20",
    rose: "text-rose-500 bg-rose-50 dark:bg-rose-950/20",
    violet: "text-violet-500 bg-violet-50 dark:bg-violet-950/20"
  };
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 shadow-xl shadow-slate-200/40 dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-800"
    >
      <div className="flex items-center justify-between mb-8">
         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
         <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${tones[tone]}`}>
            <Icon size={20} />
         </div>
      </div>
      <p className={`text-4xl font-black tracking-tight text-slate-900 dark:text-white ${isCurrency ? 'text-3xl' : ''}`}>
        {value}
      </p>
    </motion.div>
  );
}

function EfficiencyBar({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="space-y-3">
       <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
          <span>{label}</span>
          <span className="text-white">{value}%</span>
       </div>
       <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full ${color}`} 
          />
       </div>
    </div>
  );
}
