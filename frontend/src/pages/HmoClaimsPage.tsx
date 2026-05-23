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

const STATUS_CONFIG: Record<HmoClaimStatus, { badgeClass: string; icon: any }> = {
  DRAFT:            { badgeClass: "badge badge-slate", icon: FileText },
  SUBMITTED:        { badgeClass: "badge badge-amber", icon: Clock },
  APPROVED:         { badgeClass: "badge badge-teal", icon: CheckCircle2 },
  PARTIAL_APPROVED: { badgeClass: "badge badge-amber", icon: AlertCircle },
  REJECTED:         { badgeClass: "badge badge-rose", icon: XCircle },
  PAID:             { badgeClass: "badge badge-green", icon: Shield },
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
    { key: "critical", label: t("pages.hmoClaims.runbookStepCritical", { defaultValue: "Runbook Step Critical" }), count: openClaimAging.critical, tone: "teal", onClick: () => { setStatus("SUBMITTED"); setAgingBand("CRITICAL"); } },
    { key: "submit", label: t("pages.hmoClaims.runbookStepSubmit", { defaultValue: "Runbook Step Submit" }), count: claims.filter(c => c.status === "DRAFT").length, tone: "sky", onClick: () => { setStatus("DRAFT"); setAgingBand("ALL"); } },
    { key: "cashflow", label: t("pages.hmoClaims.runbookStepCashflow", { defaultValue: "Runbook Step Cashflow" }), count: claims.filter(c => c.status === "APPROVED").length, tone: "teal", onClick: () => { setStatus("APPROVED"); setAgingBand("ALL"); } },
  ], [openClaimAging.critical, claims, t]);

  const setClaimStatus = async (id: string, next: HmoClaimStatus) => {
    try {
      await updateHmoClaimStatus(id, next);
      toast.success(t("pages.hmoClaims.toastUpdated", { defaultValue: "Toast Updated" }));
      void queryClient.invalidateQueries({ queryKey: ["hmoClaims"] });
    } catch (e) { toast.error((e as Error).message); }
  };

  const onDownloadReconciliation = async () => {
    try {
      await downloadHmoClaimsReconciliationCsv({ year: reconYear, month: reconMonth, providerId: providerId || undefined });
      toast.success(t("pages.hmoClaims.reconciliationReady", { defaultValue: "Reconciliation Ready" }));
    } catch (e) { toast.error((e as Error).message); }
  };

  const onCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast.success(t("pages.hmoClaims.viewLinkCopied", { defaultValue: "View Link Copied" }));
  };

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] bg-brand-primary-soft text-brand-primary">
              <Shield size={15} />
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-muted">
              Clinical Revenue Operations
            </span>
          </div>
          <h1 className="page-header-title">{t("pages.hmoClaims.title", { defaultValue: "Title" }) || "HMO Claims"}</h1>
          <p className="page-header-sub">{t("pages.hmoClaims.subtitle", { defaultValue: "Subtitle" })}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onCopyLink}
            className="btn-secondary flex items-center gap-2"
            title={t("pages.hmoClaims.copyViewLink", { defaultValue: "Copy View Link" })}
          >
            <Copy size={15} />
          </button>
          <button
            onClick={() => void queryClient.invalidateQueries({ queryKey: ["hmoClaims"] })}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <PulseMetric label={t("pages.hmoClaims.metricPending", { defaultValue: "Metric Pending" })} value={metrics.pending} iconBg="bg-brand-warning-soft text-brand-warning" icon={Clock} />
        <PulseMetric label={t("pages.hmoClaims.metricApproved", { defaultValue: "Metric Approved" })} value={metrics.approved} iconBg="bg-brand-primary-soft text-brand-primary" icon={CheckCircle2} />
        <PulseMetric label={t("pages.hmoClaims.metricRejected", { defaultValue: "Metric Rejected" })} value={metrics.rejected} iconBg="bg-brand-danger-soft text-brand-danger" icon={XCircle} />
        <PulseMetric label={t("pages.hmoClaims.metricRequested", { defaultValue: "Metric Requested" })} value={PHP.format(metrics.totalRequested)} iconBg="bg-brand-primary-soft text-brand-primary" icon={Wallet} isCurrency />
      </div>

      {/* Main Layout */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Runbook Column */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Zap size={18} className="text-brand-primary" />
                <h2 className="text-base font-bold text-brand-text">Runbook</h2>
              </div>
              <span className="text-xs font-bold text-brand-muted bg-brand-surface-soft px-2.5 py-1 rounded-[var(--radius-sm)]">
                {runbookProgress.pct}% Done
              </span>
            </div>
            <div className="space-y-3">
              {runbookSteps.map((step) => (
                <button
                  key={step.key}
                  onClick={() => { step.onClick(); setRunbookDone(prev => ({ ...prev, [step.key]: true })); }}
                  className={`w-full group flex items-center justify-between p-4 rounded-[var(--radius-md)] border transition-all hover:scale-[1.01] active:scale-95 ${ runbookDone[step.key] ? "bg-brand-surface-soft border-brand-border opacity-60" : "bg-brand-surface border-brand-border shadow-sm hover:border-brand-primary/50" }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-[var(--radius-sm)] flex items-center justify-center text-white shadow-sm ${ step.tone === 'teal' ? 'bg-brand-primary' : 'bg-brand-info' }`}>
                      {runbookDone[step.key] ? <CheckCircle2 size={20} /> : step.key === 'critical' ? <AlertCircle size={20} /> : <Zap size={20} />}
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted mb-0.5">{step.label.split('.')[0]}</p>
                      <p className="text-sm font-bold text-brand-text leading-none">{step.label.split('.')[1]}</p>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-brand-muted group-hover:text-brand-primary transition-colors">
                    {step.count}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Efficiency Panel */}
          <div className="card bg-brand-navy ring-0 shadow-popover text-white">
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-primary mb-5 flex items-center gap-2">
              <TrendingUp size={14} /> {t("pages.hmoClaims.efficiencyPulseTitle", { defaultValue: "Efficiency Pulse Title" })}
            </h3>
            <div className="space-y-4">
              <EfficiencyBar label={t("pages.hmoClaims.slaCompliance", { defaultValue: "Sla Compliance" })} value={88} color="bg-brand-primary" />
              <EfficiencyBar label={t("pages.hmoClaims.submissionVelocity", { defaultValue: "Submission Velocity" })} value={64} color="bg-brand-info" />
              <EfficiencyBar label={t("pages.hmoClaims.approvalRate", { defaultValue: "Approval Rate" })} value={92} color="bg-brand-primary" />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* Filter Strip */}
          <div className="card py-3 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-muted">
              <Filter size={13} /> Filter
            </div>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as any)}
              className="h-9 px-3 rounded-[var(--radius-sm)] bg-brand-surface border border-brand-border text-xs font-bold text-brand-text outline-none focus:ring-2 focus:ring-brand-primary"
            >
              <option value="">All Statuses</option>
              {CLAIM_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="h-5 w-px bg-brand-border mx-1" />
            <select
              value={providerId}
              onChange={e => setProviderId(e.target.value)}
              className="h-9 px-3 rounded-[var(--radius-sm)] bg-brand-surface border border-brand-border text-xs font-bold text-brand-text outline-none focus:ring-2 focus:ring-brand-primary"
            >
              <option value="">All Providers</option>
              {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <div className="h-5 w-px bg-brand-border mx-1" />
            <div className="flex-1 relative min-w-[160px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={14} />
              <input
                value={tableQInput}
                onChange={e => setTableQInput(e.target.value)}
                placeholder="Search Claim # or Patient..."
                className="h-9 w-full pl-9 pr-4 rounded-[var(--radius-sm)] bg-brand-surface border border-brand-border text-xs font-medium outline-none focus:ring-2 focus:ring-brand-primary transition-all"
              />
            </div>
          </div>

          {/* Claims Table */}
          <div className="card p-0 overflow-hidden border border-brand-border">
            <div className="data-table-wrapper">
              <table className="data-table min-w-[800px]">
                <thead className="bg-brand-surface-muted">
                  <tr>
                    <th>{t("pages.hmoClaims.colClaimProfile", { defaultValue: "Col Claim Profile" })}</th>
                    <th className="text-right">{t("pages.hmoClaims.colRequested", { defaultValue: "Col Requested" })}</th>
                    <th className="text-right">{t("pages.hmoClaims.colApproved", { defaultValue: "Col Approved" })}</th>
                    <th>{t("pages.hmoClaims.colStatus", { defaultValue: "Col Status" })}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody className="bg-brand-surface">
                  <AnimatePresence mode="popLayout">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="py-20 text-center">
                          <div className="flex items-center justify-center">
                            <div className="h-8 w-8 rounded-[var(--radius-md)] bg-brand-primary-soft flex items-center justify-center">
                              <RefreshCw className="h-4 w-4 animate-spin text-brand-primary" />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : displayClaims.length === 0 ? (
                      <tr><td colSpan={5} className="py-20"><ListEmptyState icon="shield" title={t("pages.hmoClaims.emptyTitle", { defaultValue: "Empty Title" })} description={t("pages.hmoClaims.emptyHint", { defaultValue: "Empty Hint" })} primary={{ kind: "link", to: "/invoices", label: t("pages.hmoClaims.emptyCtaInvoices", { defaultValue: "Empty Cta Invoices" }) }} /></td></tr>
                    ) : displayClaims.map((c, idx) => {
                      const cfg = STATUS_CONFIG[c.status];
                      const StatusIcon = cfg.icon;
                      return (
                        <motion.tr
                          key={c.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.02 }}
                          className="group cursor-pointer hover:bg-brand-surface-soft transition-colors"
                        >
                          <td>
                            <div className="flex items-center gap-4">
                              <div className="h-11 w-11 rounded-[var(--radius-sm)] bg-brand-surface-muted flex items-center justify-center text-brand-muted font-bold text-xs group-hover:bg-brand-primary group-hover:text-white transition-all uppercase tracking-tight border border-brand-border group-hover:border-transparent">
                                {c.provider.name.slice(0, 3)}
                              </div>
                              <div className="space-y-0.5">
                                <Link to={`/hmo-claims/${c.id}`} className="text-sm font-bold text-brand-text hover:text-brand-primary transition-colors flex items-center gap-1.5">
                                  {c.claimNumber}
                                  <ArrowUpRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                                <div className="flex items-center gap-2 text-xs text-brand-muted font-medium">
                                  <span>{c.patient.firstName} {c.patient.lastName}</span>
                                  <span className="h-1 w-1 rounded-full bg-brand-border" />
                                  <span className="text-[10px] uppercase tracking-widest text-brand-text-soft">{c.provider.name}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="text-right font-bold text-brand-text tabular-nums text-sm">
                            {PHP.format(Number(c.requestedAmount))}
                          </td>
                          <td className="text-right font-bold text-brand-primary tabular-nums text-sm">
                            {c.approvedAmount ? PHP.format(Number(c.approvedAmount)) : "—"}
                          </td>
                          <td>
                            <span className={cfg.badgeClass}>
                              <StatusIcon size={12} className="mr-1 inline" />
                              {t(HMO_CLAIM_STATUS_I18N_KEY[c.status])}
                            </span>
                          </td>
                          <td>
                            <div className="flex items-center justify-end gap-2">
                              <div className="flex opacity-0 group-hover:opacity-100 transition-all translate-x-3 group-hover:translate-x-0 gap-1.5">
                                {canSetHmoClaimStatus(c.status, "SUBMITTED") && (
                                  <button onClick={() => void setClaimStatus(c.id, "SUBMITTED")} className="h-8 px-3 rounded-[var(--radius-sm)] bg-brand-info-soft text-brand-info text-[10px] font-bold uppercase tracking-widest hover:bg-brand-info hover:text-white transition-all">{t("pages.hmoClaims.actionSubmit", { defaultValue: "Action Submit" })}</button>
                                )}
                                {canSetHmoClaimStatus(c.status, "DRAFT") && (
                                  <button onClick={() => void setClaimStatus(c.id, "DRAFT")} className="h-8 px-3 rounded-[var(--radius-sm)] bg-brand-surface-muted text-brand-text text-[10px] font-bold uppercase tracking-widest hover:bg-brand-text hover:text-white transition-all">{t("pages.hmoClaims.actionWithdraw", { defaultValue: "Action Withdraw" })}</button>
                                )}
                                {canSetHmoClaimStatus(c.status, "APPROVED") && (
                                  <button onClick={() => void setClaimStatus(c.id, "APPROVED")} className="h-8 px-3 rounded-[var(--radius-sm)] bg-brand-primary-soft text-brand-primary text-[10px] font-bold uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all">{t("pages.hmoClaims.actionApprove", { defaultValue: "Action Approve" })}</button>
                                )}
                                {canSetHmoClaimStatus(c.status, "PAID") && (
                                  <button onClick={() => void setClaimStatus(c.id, "PAID")} className="h-8 px-3 rounded-[var(--radius-sm)] bg-brand-primary-soft text-brand-primary text-[10px] font-bold uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all">{t("pages.hmoClaims.actionPaid", { defaultValue: "Action Paid" })}</button>
                                )}
                              </div>
                              <Link to={`/hmo-claims/${c.id}`} className="h-9 w-9 flex items-center justify-center rounded-[var(--radius-sm)] bg-brand-surface-muted text-brand-muted hover:bg-brand-primary hover:text-white transition-all">
                                <ChevronRight size={18} />
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

          {/* Monthly Reconciliation */}
          <div className="card bg-brand-navy ring-0 text-white shadow-popover">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-base font-bold">Monthly Ledger Closure</h3>
                <p className="text-sm font-medium text-brand-muted mt-1">Generate BIR-compliant reconciliation CSV for month-end clinical audits.</p>
              </div>
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-2 rounded-[var(--radius-md)] backdrop-blur-xl">
                <select
                  value={reconMonth}
                  onChange={e => setReconMonth(Number(e.target.value))}
                  className="h-10 bg-transparent text-white text-xs font-bold px-3 outline-none"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m} className="text-slate-900">{new Intl.DateTimeFormat("en-PH", { month: "short" }).format(new Date(2024, m - 1, 1))}</option>
                  ))}
                </select>
                <button
                  onClick={() => void onDownloadReconciliation()}
                  className="flex h-10 items-center gap-2 px-5 rounded-[var(--radius-sm)] bg-white text-brand-navy text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform"
                >
                  <Download size={14} /> {t("pages.hmoClaims.exportReconciliationCsv", { defaultValue: "Export Reconciliation Csv" })}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PulseMetric({ label, value, iconBg, icon: Icon, isCurrency = false }: { label: string, value: any, iconBg: string, icon: any, isCurrency?: boolean }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="stat-card"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="stat-card-label">{label}</p>
        <div className={`h-9 w-9 rounded-[var(--radius-sm)] flex items-center justify-center ${iconBg}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className={`stat-card-value ${isCurrency ? 'text-lg' : ''}`}>
        {value}
      </p>
    </motion.div>
  );
}

function EfficiencyBar({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/50">
        <span>{label}</span>
        <span className="text-white">{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
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
