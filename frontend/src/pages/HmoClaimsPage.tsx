import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { ListEmptyState } from "../components/ListEmptyState";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { HMO_CLAIM_STATUS_I18N_KEY } from "../constants/hmoClaimStatusLabels";
import { canSetHmoClaimStatus } from "../constants/hmoClaimStatusTransitions";
import {
  downloadHmoClaimsReconciliationCsv,
  type HmoClaim,
  type HmoClaimStatus,
  type HmoProvider,
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

const fieldFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus-visible:ring-offset-slate-950";

const STATUS_STYLE: Record<HmoClaimStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  SUBMITTED: "bg-sky-100 text-sky-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  PARTIAL_APPROVED: "bg-amber-100 text-amber-700",
  REJECTED: "bg-rose-100 text-rose-700",
  PAID: "bg-indigo-100 text-indigo-700",
};
const OPEN_CLAIM_STATUSES: HmoClaimStatus[] = ["DRAFT", "SUBMITTED", "PARTIAL_APPROVED"];
const AGING_BANDS = ["ALL", "FRESH", "WARNING", "CRITICAL"] as const;
type AgingBand = (typeof AGING_BANDS)[number];
const CLAIM_STATUSES: HmoClaimStatus[] = ["DRAFT", "SUBMITTED", "APPROVED", "PARTIAL_APPROVED", "REJECTED", "PAID"];

export function HmoClaimsPage(): JSX.Element {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatusParam = searchParams.get("status");
  const initialAgingParam = searchParams.get("aging");
  const contextParam = searchParams.get("ctx");
  const [providers, setProviders] = useState<HmoProvider[]>([]);
  const [claims, setClaims] = useState<HmoClaim[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [sortProvidersByOpenLoad, setSortProvidersByOpenLoad] = useState(searchParams.get("sortOpen") !== "0");
  const [tableQInput, setTableQInput] = useState(searchParams.get("q") ?? "");
  const [reconYear, setReconYear] = useState(() => new Date().getUTCFullYear());
  const [reconMonth, setReconMonth] = useState(() => new Date().getUTCMonth() + 1);
  const [runbookDone, setRunbookDone] = useState<Record<string, boolean>>({});
  const tableQ = useDebouncedValue(tableQInput, 300);
  const isRunbookContext = contextParam?.startsWith("RUNBOOK") ?? false;
  const contextBanner = useMemo(() => {
    switch (contextParam) {
      case "CRITICAL_FOLLOWUP":
        return t("pages.hmoClaims.ctxCriticalFollowup");
      case "SUBMISSION_QUEUE":
        return t("pages.hmoClaims.ctxSubmissionQueue");
      case "CASHFLOW_COLLECT":
        return t("pages.hmoClaims.ctxCashflowCollect");
      case "FOLLOWUP_DUE":
        return t("pages.hmoClaims.ctxFollowupDue");
      case "RESUBMIT_QUEUE":
        return t("pages.hmoClaims.ctxResubmitQueue");
      case "HOTLIST":
        return t("pages.hmoClaims.ctxHotList");
      case "RUNBOOK":
        return t("pages.hmoClaims.ctxRunbook");
      case "RUNBOOK_ADMIN":
        return t("pages.hmoClaims.ctxRunbookAdmin");
      case "RUNBOOK_DENTIST":
        return t("pages.hmoClaims.ctxRunbookDentist");
      case "RUNBOOK_CASHFLOW":
        return t("pages.hmoClaims.ctxRunbookCashflow");
      case "RUNBOOK_RESUBMIT":
        return t("pages.hmoClaims.ctxRunbookResubmit");
      case "RUNBOOK_RECEPTION":
        return t("pages.hmoClaims.ctxRunbookReception");
      default:
        return "";
    }
  }, [contextParam, t]);

  async function load(): Promise<void> {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([
        fetchHmoProviders(),
        fetchHmoClaims({
          status: status || undefined,
          providerId: providerId || undefined,
          limit: 100,
        }),
      ]);
      setProviders(p);
      setClaims(c);
    } catch (e) {
      toast.error((e as Error).message, { id: "hmo-claims-load" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, providerId]);
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem("hmo-runbook-progress");
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, boolean>;
      setRunbookDone(parsed);
    } catch {
      setRunbookDone({});
    }
  }, []);
  useEffect(() => {
    try {
      window.sessionStorage.setItem("hmo-runbook-progress", JSON.stringify(runbookDone));
    } catch {
      // ignore storage errors
    }
  }, [runbookDone]);
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (status) next.set("status", status);
    else next.delete("status");
    if (providerId) next.set("provider", providerId);
    else next.delete("provider");
    if (agingBand !== "ALL") next.set("aging", agingBand);
    else next.delete("aging");
    if (tableQInput.trim()) next.set("q", tableQInput.trim());
    else next.delete("q");
    if (sortProvidersByOpenLoad) next.delete("sortOpen");
    else next.set("sortOpen", "0");
    const current = searchParams.toString();
    const updated = next.toString();
    if (updated !== current) {
      setSearchParams(next, { replace: true });
    }
  }, [status, providerId, agingBand, tableQInput, sortProvidersByOpenLoad, searchParams, setSearchParams]);

  const metrics = useMemo(
    () => ({
      pending: claims.filter((c) => c.status === "SUBMITTED" || c.status === "DRAFT").length,
      approved: claims.filter((c) => c.status === "APPROVED" || c.status === "PARTIAL_APPROVED").length,
      rejected: claims.filter((c) => c.status === "REJECTED").length,
      totalRequested: claims.reduce((s, c) => s + Number(c.requestedAmount), 0),
    }),
    [claims],
  );

  const displayClaims = useMemo(() => {
    const q = tableQ.trim().toLowerCase();
    return claims.filter((c) => {
      if (agingBand !== "ALL") {
        if (!OPEN_CLAIM_STATUSES.includes(c.status)) return false;
        const ageDays = Math.floor((Date.now() - new Date(c.createdAt).getTime()) / (24 * 60 * 60 * 1000));
        if (agingBand === "FRESH" && ageDays > 3) return false;
        if (agingBand === "WARNING" && (ageDays <= 3 || ageDays > 7)) return false;
        if (agingBand === "CRITICAL" && ageDays <= 7) return false;
      }
      if (!q) return true;
      const hay = [c.claimNumber, c.patient.firstName, c.patient.lastName, c.provider.name].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [claims, tableQ, agingBand]);
  const providerClaimCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const claim of claims) {
      if (!OPEN_CLAIM_STATUSES.includes(claim.status)) continue;
      counts.set(claim.provider.id, (counts.get(claim.provider.id) ?? 0) + 1);
    }
    return counts;
  }, [claims]);
  const openClaimTotal = useMemo(
    () => claims.filter((c) => OPEN_CLAIM_STATUSES.includes(c.status)).length,
    [claims],
  );
  const statusQuickCounts = useMemo(
    () => ({
      ALL: claims.length,
      DRAFT: claims.filter((c) => c.status === "DRAFT").length,
      SUBMITTED: claims.filter((c) => c.status === "SUBMITTED").length,
      APPROVED: claims.filter((c) => c.status === "APPROVED" || c.status === "PARTIAL_APPROVED").length,
      REJECTED: claims.filter((c) => c.status === "REJECTED").length,
      PAID: claims.filter((c) => c.status === "PAID").length,
    }),
    [claims],
  );
  const openClaimAging = useMemo(() => {
    const msInDay = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const rows = claims.filter((c) => OPEN_CLAIM_STATUSES.includes(c.status));
    const counts = { fresh: 0, warning: 0, critical: 0 };
    for (const claim of rows) {
      const ageDays = Math.floor((now - new Date(claim.createdAt).getTime()) / msInDay);
      if (ageDays <= 3) counts.fresh += 1;
      else if (ageDays <= 7) counts.warning += 1;
      else counts.critical += 1;
    }
    return counts;
  }, [claims]);
  const slaBuckets = useMemo(() => {
    const overdue = openClaimAging.critical;
    const dueSoon = openClaimAging.warning;
    const healthy = openClaimAging.fresh;
    const total = overdue + dueSoon + healthy;
    return { overdue, dueSoon, healthy, total };
  }, [openClaimAging]);
  const priorityClaims = useMemo(() => {
    const msInDay = 24 * 60 * 60 * 1000;
    const now = Date.now();
    return claims
      .filter((c) => OPEN_CLAIM_STATUSES.includes(c.status))
      .map((c) => ({
        ...c,
        ageDays: Math.floor((now - new Date(c.createdAt).getTime()) / msInDay),
      }))
      .filter((c) => c.ageDays >= 8)
      .sort((a, b) => b.ageDays - a.ageDays)
      .slice(0, 5);
  }, [claims]);
  const topProviderFilters = useMemo(() => {
    const rows = [...providers];
    if (sortProvidersByOpenLoad) {
      rows.sort((a, b) => {
        const aCount = providerClaimCounts.get(a.id) ?? 0;
        const bCount = providerClaimCounts.get(b.id) ?? 0;
        if (bCount !== aCount) return bCount - aCount;
        return a.name.localeCompare(b.name);
      });
    }
    return rows.slice(0, 5);
  }, [providers, providerClaimCounts, sortProvidersByOpenLoad]);
  const providerSlaRows = useMemo(() => {
    const msInDay = 24 * 60 * 60 * 1000;
    const now = Date.now();
    return providers
      .map((provider) => {
        const openClaims = claims.filter(
          (c) => c.provider.id === provider.id && OPEN_CLAIM_STATUSES.includes(c.status),
        );
        let fresh = 0;
        let warning = 0;
        let critical = 0;
        for (const claim of openClaims) {
          const ageDays = Math.floor((now - new Date(claim.createdAt).getTime()) / msInDay);
          if (ageDays <= 3) fresh += 1;
          else if (ageDays <= 7) warning += 1;
          else critical += 1;
        }
        const total = fresh + warning + critical;
        return { provider, fresh, warning, critical, total };
      })
      .filter((row) => row.total > 0)
      .sort((a, b) => {
        if (b.critical !== a.critical) return b.critical - a.critical;
        if (b.warning !== a.warning) return b.warning - a.warning;
        if (b.total !== a.total) return b.total - a.total;
        return a.provider.name.localeCompare(b.provider.name);
      })
      .slice(0, 6);
  }, [providers, claims]);
  const operationPresetCounts = useMemo(
    () => ({
      triage: openClaimAging.critical,
      submission: statusQuickCounts.DRAFT,
      cashflow: claims.filter((c) => c.status === "APPROVED" || c.status === "PARTIAL_APPROVED").length,
    }),
    [openClaimAging, statusQuickCounts.DRAFT, claims],
  );
  const providerBottlenecks = useMemo(
    () => providerSlaRows.filter((row) => row.critical >= 3).slice(0, 3),
    [providerSlaRows],
  );
  const escalationHotList = useMemo(() => {
    const msInDay = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const warningByProvider = new Map<string, number>();
    const criticalByProvider = new Map<string, number>();
    for (const row of providerSlaRows) {
      warningByProvider.set(row.provider.id, row.warning);
      criticalByProvider.set(row.provider.id, row.critical);
    }
    return claims
      .filter((c) => c.status === "SUBMITTED")
      .map((c) => {
        const ageDays = Math.floor((now - new Date(c.createdAt).getTime()) / msInDay);
        const riskScore = (criticalByProvider.get(c.provider.id) ?? 0) * 2 + (warningByProvider.get(c.provider.id) ?? 0);
        return { ...c, ageDays, daysLeft: 8 - ageDays, riskScore };
      })
      .filter((c) => c.ageDays >= 4 && c.ageDays < 8)
      .sort((a, b) => {
        if (b.riskScore !== a.riskScore) return b.riskScore - a.riskScore;
        return a.daysLeft - b.daysLeft;
      })
      .slice(0, 5);
  }, [claims, providerSlaRows]);
  const hotListRiskBuckets = useMemo(() => {
    let high = 0;
    let medium = 0;
    let low = 0;
    for (const claim of escalationHotList) {
      if (claim.riskScore >= 10) high += 1;
      else if (claim.riskScore >= 5) medium += 1;
      else low += 1;
    }
    return { high, medium, low };
  }, [escalationHotList]);
  const runbookSteps = useMemo(
    () => [
      {
        key: "critical",
        label: t("pages.hmoClaims.runbookStepCritical"),
        count: openClaimAging.critical,
        tone: "border-rose-200 bg-rose-50/70 text-rose-800",
        onClick: () => {
          setStatus("SUBMITTED");
          setAgingBand("CRITICAL");
          setProviderId("");
          setSortProvidersByOpenLoad(true);
          setTableQInput("");
        },
      },
      {
        key: "submit",
        label: t("pages.hmoClaims.runbookStepSubmit"),
        count: statusQuickCounts.DRAFT,
        tone: "border-amber-200 bg-amber-50/70 text-amber-900",
        onClick: () => {
          setStatus("DRAFT");
          setAgingBand("ALL");
          setProviderId("");
          setSortProvidersByOpenLoad(true);
          setTableQInput("");
        },
      },
      {
        key: "cashflow",
        label: t("pages.hmoClaims.runbookStepCashflow"),
        count: statusQuickCounts.APPROVED,
        tone: "border-emerald-200 bg-emerald-50/70 text-emerald-800",
        onClick: () => {
          setStatus("APPROVED");
          setAgingBand("ALL");
          setProviderId("");
          setSortProvidersByOpenLoad(true);
          setTableQInput("");
        },
      },
    ],
    [openClaimAging.critical, statusQuickCounts.DRAFT, statusQuickCounts.APPROVED, t],
  );
  const runbookProgress = useMemo(() => {
    const total = runbookSteps.length;
    const done = runbookSteps.reduce((acc, step) => acc + (runbookDone[step.key] ? 1 : 0), 0);
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, pct };
  }, [runbookSteps, runbookDone]);

  function countBadgeClass(count: number): string {
    if (count >= 10) return "bg-rose-100 text-rose-700";
    if (count >= 5) return "bg-amber-100 text-amber-800";
    return "bg-emerald-100 text-emerald-700";
  }
  function statusCountBadgeClass(count: number): string {
    if (count >= 20) return "bg-rose-100 text-rose-700";
    if (count >= 8) return "bg-amber-100 text-amber-800";
    return "bg-slate-100 text-slate-700";
  }
  function riskBadgeClass(score: number): string {
    if (score >= 10) return "bg-rose-100 text-rose-800";
    if (score >= 5) return "bg-amber-100 text-amber-900";
    return "bg-emerald-100 text-emerald-800";
  }
  function riskLevelLabel(score: number): string {
    if (score >= 10) return t("pages.hmoClaims.hotListRiskHigh");
    if (score >= 5) return t("pages.hmoClaims.hotListRiskMedium");
    return t("pages.hmoClaims.hotListRiskLow");
  }
  function riskTrendLabel(warning: number, critical: number): string {
    if (critical > warning) return t("pages.hmoClaims.hotListTrendUp");
    if (critical === warning) return t("pages.hmoClaims.hotListTrendFlat");
    return t("pages.hmoClaims.hotListTrendDown");
  }
  function getNextBestAction(claim: HmoClaim): { label: string; tone: string; key: string } {
    const ageDays = Math.floor((Date.now() - new Date(claim.createdAt).getTime()) / (24 * 60 * 60 * 1000));
    if (claim.status === "DRAFT") {
      return {
        key: "SUBMIT",
        label: t("pages.hmoClaims.nextBestSubmit"),
        tone: "border-amber-300 bg-amber-50 text-amber-900",
      };
    }
    if (claim.status === "SUBMITTED" && ageDays >= 8) {
      return {
        key: "ESCALATE",
        label: t("pages.hmoClaims.nextBestEscalate"),
        tone: "border-rose-300 bg-rose-50 text-rose-800",
      };
    }
    if (claim.status === "SUBMITTED") {
      return {
        key: "FOLLOW_UP",
        label: t("pages.hmoClaims.nextBestFollowUp"),
        tone: "border-sky-300 bg-sky-50 text-sky-800",
      };
    }
    if (claim.status === "APPROVED" || claim.status === "PARTIAL_APPROVED") {
      return {
        key: "COLLECT",
        label: t("pages.hmoClaims.nextBestCollect"),
        tone: "border-emerald-300 bg-emerald-50 text-emerald-800",
      };
    }
    if (claim.status === "REJECTED") {
      return {
        key: "RESUBMIT",
        label: t("pages.hmoClaims.nextBestResubmit"),
        tone: "border-violet-300 bg-violet-50 text-violet-800",
      };
    }
    return {
      key: "DONE",
      label: t("pages.hmoClaims.nextBestDone"),
      tone: "border-slate-300 bg-slate-100 text-slate-700",
    };
  }
  function applyNextBestAction(claim: HmoClaim): void {
    const ageDays = Math.floor((Date.now() - new Date(claim.createdAt).getTime()) / (24 * 60 * 60 * 1000));
    setProviderId(claim.provider.id);
    setSortProvidersByOpenLoad(true);
    setTableQInput("");
    if (claim.status === "DRAFT") {
      setStatus("DRAFT");
      setAgingBand("ALL");
      return;
    }
    if (claim.status === "SUBMITTED" && ageDays >= 8) {
      setStatus("SUBMITTED");
      setAgingBand("CRITICAL");
      return;
    }
    if (claim.status === "SUBMITTED") {
      setStatus("SUBMITTED");
      setAgingBand("WARNING");
      return;
    }
    if (claim.status === "APPROVED" || claim.status === "PARTIAL_APPROVED") {
      setStatus("APPROVED");
      setAgingBand("ALL");
      return;
    }
    if (claim.status === "REJECTED") {
      setStatus("REJECTED");
      setAgingBand("ALL");
      return;
    }
    setStatus("PAID");
    setAgingBand("ALL");
  }
  function getTimelineNudge(claim: HmoClaim): { label: string; tone: string } | null {
    const ageDays = Math.floor((Date.now() - new Date(claim.createdAt).getTime()) / (24 * 60 * 60 * 1000));
    if (claim.status === "DRAFT" && ageDays >= 2) {
      return {
        label: t("pages.hmoClaims.nudgeDraftStale", { days: ageDays }),
        tone: "border-amber-300 bg-amber-50 text-amber-900",
      };
    }
    if (claim.status === "SUBMITTED" && ageDays >= 8) {
      return {
        label: t("pages.hmoClaims.nudgeEscalateNow", { days: ageDays }),
        tone: "border-rose-300 bg-rose-50 text-rose-800",
      };
    }
    if (claim.status === "SUBMITTED" && ageDays >= 4) {
      return {
        label: t("pages.hmoClaims.nudgeFollowUpDue", { days: ageDays }),
        tone: "border-sky-300 bg-sky-50 text-sky-800",
      };
    }
    if (claim.status === "APPROVED" || claim.status === "PARTIAL_APPROVED") {
      return {
        label: t("pages.hmoClaims.nudgePostRemittance"),
        tone: "border-emerald-300 bg-emerald-50 text-emerald-800",
      };
    }
    return null;
  }
  function getEscalationTimer(claim: HmoClaim): { label: string; tone: string } | null {
    if (claim.status !== "SUBMITTED") return null;
    const ageDays = Math.floor((Date.now() - new Date(claim.createdAt).getTime()) / (24 * 60 * 60 * 1000));
    if (ageDays < 4 || ageDays >= 8) return null;
    const daysLeft = Math.max(1, 8 - ageDays);
    return {
      label: t("pages.hmoClaims.escalationTimer", { days: daysLeft }),
      tone: "border-orange-300 bg-orange-50 text-orange-900",
    };
  }

  async function setClaimStatus(id: string, next: HmoClaimStatus): Promise<void> {
    try {
      await updateHmoClaimStatus(id, next);
      toast.success(t("pages.hmoClaims.toastUpdated"));
      await load();
    } catch (e) {
      toast.error((e as Error).message, { id: "hmo-claim-mutate" });
    }
  }

  async function onDownloadReconciliation(): Promise<void> {
    try {
      await downloadHmoClaimsReconciliationCsv({
        year: reconYear,
        month: reconMonth,
        providerId: providerId || undefined,
      });
      toast.success(t("pages.hmoClaims.reconciliationReady"));
    } catch (e) {
      toast.error((e as Error).message, { id: "hmo-reconciliation-download" });
    }
  }
  async function onCopyCurrentViewLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(t("pages.hmoClaims.viewLinkCopied"));
    } catch {
      toast.error(t("pages.hmoClaims.viewLinkCopyFailed"));
    }
  }
  function applyOperationPreset(preset: "TRIAGE" | "SUBMISSION" | "CASHFLOW"): void {
    if (preset === "TRIAGE") {
      setStatus("");
      setProviderId("");
      setAgingBand("CRITICAL");
      setSortProvidersByOpenLoad(true);
      setTableQInput("");
      return;
    }
    if (preset === "SUBMISSION") {
      setStatus("DRAFT");
      setProviderId("");
      setAgingBand("ALL");
      setSortProvidersByOpenLoad(true);
      setTableQInput("");
      return;
    }
    setStatus("APPROVED");
    setProviderId("");
    setAgingBand("ALL");
    setSortProvidersByOpenLoad(true);
    setTableQInput("");
  }
  function applyEscalationTimerPreset(claim: HmoClaim): void {
    setProviderId(claim.provider.id);
    setStatus("SUBMITTED");
    setAgingBand("WARNING");
    setSortProvidersByOpenLoad(true);
    setTableQInput("");
  }
  function clearContextBanner(): void {
    const next = new URLSearchParams(searchParams);
    next.delete("ctx");
    setSearchParams(next, { replace: true });
  }
  function resetRunbookProgress(): void {
    setRunbookDone({});
  }

  const empty = t("pages.common.empty");

  return (
    <div className="min-w-0 space-y-5">
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden>
              <path d="M4 7h16M7 4v6m10-6v6M6 11h12a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2Z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-700">Claims Desk</p>
            <h1 className="text-2xl font-bold text-slate-900">{t("pages.hmoClaims.title")}</h1>
            <p className="text-sm text-slate-500">{t("pages.hmoClaims.subtitle")}</p>
          </div>
        </div>
      </div>
      {contextBanner ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-indigo-200 bg-indigo-50/70 px-3 py-2">
          <p className="text-xs font-semibold text-indigo-900">{contextBanner}</p>
          <button
            type="button"
            onClick={clearContextBanner}
            className="inline-flex min-h-8 items-center rounded-md border border-indigo-300 bg-white px-2.5 text-[11px] font-semibold text-indigo-800 hover:bg-indigo-100"
          >
            {t("pages.hmoClaims.ctxClear")}
          </button>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label={t("pages.hmoClaims.metricPending")} value={String(metrics.pending)} tone="sky" />
        <Metric label={t("pages.hmoClaims.metricApproved")} value={String(metrics.approved)} tone="emerald" />
        <Metric label={t("pages.hmoClaims.metricRejected")} value={String(metrics.rejected)} tone="rose" />
        <Metric label={t("pages.hmoClaims.metricRequested")} value={PHP.format(metrics.totalRequested)} tone="purple" />
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {t("pages.hmoClaims.slaStripTitle")}
          </p>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
            {t("pages.hmoClaims.slaStripOpenTotal", { count: slaBuckets.total })}
          </span>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => setAgingBand("CRITICAL")}
            className={`rounded-lg border p-2 text-left transition ${
              agingBand === "CRITICAL"
                ? "border-rose-300 bg-rose-50"
                : "border-rose-200 bg-white hover:bg-rose-50/60"
            }`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-700">
              {t("pages.hmoClaims.slaOverdue")}
            </p>
            <p className="mt-1 text-xl font-bold text-rose-800">{slaBuckets.overdue}</p>
          </button>
          <button
            type="button"
            onClick={() => setAgingBand("WARNING")}
            className={`rounded-lg border p-2 text-left transition ${
              agingBand === "WARNING"
                ? "border-amber-300 bg-amber-50"
                : "border-amber-200 bg-white hover:bg-amber-50/60"
            }`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-800">
              {t("pages.hmoClaims.slaDueSoon")}
            </p>
            <p className="mt-1 text-xl font-bold text-amber-900">{slaBuckets.dueSoon}</p>
          </button>
          <button
            type="button"
            onClick={() => setAgingBand("FRESH")}
            className={`rounded-lg border p-2 text-left transition ${
              agingBand === "FRESH"
                ? "border-emerald-300 bg-emerald-50"
                : "border-emerald-200 bg-white hover:bg-emerald-50/60"
            }`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
              {t("pages.hmoClaims.slaHealthy")}
            </p>
            <p className="mt-1 text-xl font-bold text-emerald-800">{slaBuckets.healthy}</p>
          </button>
        </div>
      </div>
      {providerSlaRows.length > 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {t("pages.hmoClaims.providerHeatmapTitle")}
            </p>
            <span className="text-[11px] text-slate-500">{t("pages.hmoClaims.providerHeatmapHint")}</span>
          </div>
          <div className="space-y-2">
            {providerSlaRows.map((row) => (
              <div
                key={row.provider.id}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/70 p-2"
              >
                <button
                  type="button"
                  onClick={() => {
                    setProviderId(row.provider.id);
                    setAgingBand("ALL");
                  }}
                  className="inline-flex min-h-9 items-center rounded-md border border-slate-300 bg-white px-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-100"
                >
                  {row.provider.name}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProviderId(row.provider.id);
                    setAgingBand("CRITICAL");
                  }}
                  className="inline-flex min-h-9 items-center rounded-full border border-rose-300 bg-rose-50 px-2.5 text-xs font-semibold text-rose-800 hover:bg-rose-100"
                >
                  {t("pages.hmoClaims.slaOverdueShort")} {row.critical}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProviderId(row.provider.id);
                    setAgingBand("WARNING");
                  }}
                  className="inline-flex min-h-9 items-center rounded-full border border-amber-300 bg-amber-50 px-2.5 text-xs font-semibold text-amber-900 hover:bg-amber-100"
                >
                  {t("pages.hmoClaims.slaDueSoonShort")} {row.warning}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProviderId(row.provider.id);
                    setAgingBand("FRESH");
                  }}
                  className="inline-flex min-h-9 items-center rounded-full border border-emerald-300 bg-emerald-50 px-2.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
                >
                  {t("pages.hmoClaims.slaHealthyShort")} {row.fresh}
                </button>
                <span className="ml-auto rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                  {t("pages.hmoClaims.slaStripOpenTotal", { count: row.total })}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {providerBottlenecks.length > 0 ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3 shadow-sm">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-700">
              {t("pages.hmoClaims.bottleneckTitle")}
            </p>
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-800">
              {t("pages.hmoClaims.bottleneckCount", { count: providerBottlenecks.length })}
            </span>
          </div>
          <p className="mb-2 text-xs text-rose-800/90">{t("pages.hmoClaims.bottleneckHint")}</p>
          <div className="flex flex-wrap gap-2">
            {providerBottlenecks.map((row) => (
              <button
                key={row.provider.id}
                type="button"
                onClick={() => {
                  setProviderId(row.provider.id);
                  setStatus("SUBMITTED");
                  setAgingBand("CRITICAL");
                }}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-rose-300 bg-white px-3 py-1 text-xs font-semibold text-rose-800 hover:bg-rose-100"
              >
                <span>{row.provider.name}</span>
                <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                  {row.critical}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {escalationHotList.length > 0 ? (
        <div className="rounded-xl border border-orange-200 bg-orange-50/60 p-3 shadow-sm">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-orange-800">
              {t("pages.hmoClaims.hotListTitle")}
            </p>
            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-900">
              {t("pages.hmoClaims.hotListCount", { count: escalationHotList.length })}
            </span>
          </div>
          <p className="mb-2 text-xs text-orange-900/90">{t("pages.hmoClaims.hotListHint")}</p>
          <div className="mb-2 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-800">
              {t("pages.hmoClaims.hotListRiskHigh")}: {hotListRiskBuckets.high}
            </span>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
              {t("pages.hmoClaims.hotListRiskMedium")}: {hotListRiskBuckets.medium}
            </span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
              {t("pages.hmoClaims.hotListRiskLow")}: {hotListRiskBuckets.low}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {escalationHotList.map((claim) => (
              (() => {
                const providerRow = providerSlaRows.find((row) => row.provider.id === claim.provider.id);
                const trend = providerRow
                  ? riskTrendLabel(providerRow.warning, providerRow.critical)
                  : t("pages.hmoClaims.hotListTrendFlat");
                return (
              <button
                key={claim.id}
                type="button"
                onClick={() => applyEscalationTimerPreset(claim)}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-orange-300 bg-white px-3 py-1 text-xs font-semibold text-orange-900 hover:bg-orange-100"
              >
                <span className="font-mono">{claim.claimNumber}</span>
                <span>·</span>
                <span>{claim.provider.name}</span>
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${riskBadgeClass(claim.riskScore)}`}>
                  {t("pages.hmoClaims.hotListRisk", { score: claim.riskScore })} · {riskLevelLabel(claim.riskScore)}
                </span>
                <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-800">
                  {trend}
                </span>
                <span className="rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-800">
                  {t("pages.hmoClaims.hotListDaysLeft", { days: claim.daysLeft })}
                </span>
              </button>
                );
              })()
            ))}
          </div>
        </div>
      ) : null}
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {t("pages.hmoClaims.opsPresetTitle")}
          </p>
          <span className="text-[11px] text-slate-500">{t("pages.hmoClaims.opsPresetHint")}</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => applyOperationPreset("TRIAGE")}
            className="rounded-lg border border-rose-200 bg-rose-50/70 p-2 text-left transition hover:bg-rose-100"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-700">
              {t("pages.hmoClaims.opsPresetTriage")}
            </p>
            <p className="mt-1 text-xl font-bold text-rose-800">{operationPresetCounts.triage}</p>
          </button>
          <button
            type="button"
            onClick={() => applyOperationPreset("SUBMISSION")}
            className="rounded-lg border border-amber-200 bg-amber-50/70 p-2 text-left transition hover:bg-amber-100"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-800">
              {t("pages.hmoClaims.opsPresetSubmission")}
            </p>
            <p className="mt-1 text-xl font-bold text-amber-900">{operationPresetCounts.submission}</p>
          </button>
          <button
            type="button"
            onClick={() => applyOperationPreset("CASHFLOW")}
            className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-2 text-left transition hover:bg-emerald-100"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
              {t("pages.hmoClaims.opsPresetCashflow")}
            </p>
            <p className="mt-1 text-xl font-bold text-emerald-800">{operationPresetCounts.cashflow}</p>
          </button>
        </div>
      </div>
      <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-3 shadow-sm">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-800">
            {t("pages.hmoClaims.runbookTitle")}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-indigo-800/80">{t("pages.hmoClaims.runbookHint")}</span>
            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-indigo-900 ring-1 ring-indigo-200">
              {t("pages.hmoClaims.runbookProgress", {
                done: runbookProgress.done,
                total: runbookProgress.total,
                pct: runbookProgress.pct,
              })}
            </span>
            {isRunbookContext ? (
              <button
                type="button"
                onClick={resetRunbookProgress}
                className="inline-flex min-h-8 items-center rounded-md border border-indigo-300 bg-white px-2 text-[10px] font-semibold text-indigo-900 hover:bg-indigo-100"
              >
                {t("pages.hmoClaims.runbookReset")}
              </button>
            ) : null}
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {runbookSteps.map((step) => (
            <button
              key={step.key}
              type="button"
              onClick={() => {
                step.onClick();
                setRunbookDone((prev) => ({ ...prev, [step.key]: true }));
              }}
              className={`rounded-lg border p-2 text-left transition hover:brightness-95 ${step.tone}`}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide">
                {step.label}
                {runbookDone[step.key] ? (
                  <span className="ml-1 rounded-full bg-white/80 px-1.5 py-0.5 text-[9px] font-bold">
                    {t("pages.hmoClaims.runbookDone")}
                  </span>
                ) : null}
              </p>
              <p className="mt-1 text-xl font-bold">{step.count}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-2 rounded-xl border border-violet-200 bg-violet-50/60 p-3 shadow-sm">
        <p className="w-full text-xs font-semibold text-violet-900">
          {t("pages.hmoClaims.reconciliationTitle")}
        </p>
        <select
          value={reconMonth}
          onChange={(e) => setReconMonth(Number(e.target.value))}
          className={`min-h-11 w-full rounded-lg border border-violet-300 bg-white px-3 py-2 text-sm sm:w-auto ${fieldFocus}`}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              {new Intl.DateTimeFormat("en-PH", { month: "long" }).format(new Date(2024, m - 1, 1))}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={2020}
          max={2100}
          value={reconYear}
          onChange={(e) => setReconYear(Number(e.target.value) || new Date().getUTCFullYear())}
          className={`min-h-11 w-full rounded-lg border border-violet-300 bg-white px-3 py-2 text-sm sm:w-28 ${fieldFocus}`}
        />
        <button
          type="button"
          onClick={() => void onDownloadReconciliation()}
          className={`min-h-11 w-full rounded-lg border border-violet-300 bg-white px-3 py-2 text-sm font-semibold text-violet-800 transition duration-200 hover:-translate-y-0.5 hover:bg-violet-100 sm:w-auto ${fieldFocus}`}
        >
          {t("pages.hmoClaims.downloadReconciliation")}
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as HmoClaimStatus | "")}
          className="min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm sm:w-auto dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
        >
          <option value="">{t("pages.hmoClaims.allStatuses")}</option>
          <option value="DRAFT">{t("pages.hmoClaims.statusDraft")}</option>
          <option value="SUBMITTED">{t("pages.hmoClaims.statusSubmitted")}</option>
          <option value="APPROVED">{t("pages.hmoClaims.statusApproved")}</option>
          <option value="PARTIAL_APPROVED">{t("pages.hmoClaims.statusPartial")}</option>
          <option value="REJECTED">{t("pages.hmoClaims.statusRejected")}</option>
          <option value="PAID">{t("pages.hmoClaims.statusPaid")}</option>
        </select>
        <select
          value={providerId}
          onChange={(e) => setProviderId(e.target.value)}
          className={`min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm sm:w-auto dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 ${fieldFocus}`}
        >
          <option value="">{t("pages.hmoClaims.allProviders")}</option>
          {providers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <div className="flex min-w-[200px] flex-1 basis-full flex-wrap items-stretch gap-2 lg:basis-auto">
          <input
            type="search"
            value={tableQInput}
            onChange={(e) => setTableQInput(e.target.value)}
            placeholder={t("pages.hmoClaims.tableSearchPlaceholder")}
            aria-label={t("pages.hmoClaims.tableSearchLabel")}
            className={`min-h-11 min-w-[180px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 ${fieldFocus}`}
          />
          {tableQInput.trim() ? (
            <button
              type="button"
              onClick={() => setTableQInput("")}
              className={`min-h-11 shrink-0 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 ${fieldFocus}`}
            >
              {t("pages.hmoClaims.clearSearch")}
            </button>
          ) : null}
        </div>
      </div>
      {topProviderFilters.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {t("pages.hmoClaims.allProviders")}
          </span>
          <button
            type="button"
            onClick={() => setSortProvidersByOpenLoad((v) => !v)}
            className={`inline-flex min-h-9 items-center rounded-full border px-3 py-1 text-xs font-semibold transition ${
              sortProvidersByOpenLoad
                ? "border-indigo-300 bg-indigo-50 text-indigo-800"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
            title={t("pages.hmoClaims.openOnlyHint")}
          >
            {t("pages.hmoClaims.sortByOpenLoad")}
          </button>
          <button
            type="button"
            onClick={() => setProviderId("")}
            className={`inline-flex min-h-9 items-center rounded-full border px-3 py-1 text-xs font-semibold transition ${
              providerId === ""
                ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {t("pages.hmoClaims.all")}
            <span className={`ml-1 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${countBadgeClass(openClaimTotal)}`}>
              {openClaimTotal}
            </span>
          </button>
          {topProviderFilters.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setProviderId(p.id)}
              className={`inline-flex min-h-9 items-center rounded-full border px-3 py-1 text-xs font-semibold transition ${
                providerId === p.id
                  ? "border-violet-300 bg-violet-50 text-violet-800"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {p.name}
              <span className={`ml-1 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${countBadgeClass(providerClaimCounts.get(p.id) ?? 0)}`}>
                {providerClaimCounts.get(p.id) ?? 0}
              </span>
            </button>
          ))}
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {t("pages.hmoClaims.allStatuses")}
        </span>
        <button
          type="button"
          onClick={() => setStatus("")}
          className={`inline-flex min-h-9 items-center rounded-full border px-3 py-1 text-xs font-semibold transition ${
            status === ""
              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          {t("pages.hmoClaims.all")}
          <span className={`ml-1 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${statusCountBadgeClass(statusQuickCounts.ALL)}`}>
            {statusQuickCounts.ALL}
          </span>
        </button>
        {(
          [
            { key: "DRAFT", label: t("pages.hmoClaims.statusDraft"), count: statusQuickCounts.DRAFT },
            { key: "SUBMITTED", label: t("pages.hmoClaims.statusSubmitted"), count: statusQuickCounts.SUBMITTED },
            { key: "APPROVED", label: t("pages.hmoClaims.statusApproved"), count: statusQuickCounts.APPROVED },
            { key: "REJECTED", label: t("pages.hmoClaims.statusRejected"), count: statusQuickCounts.REJECTED },
            { key: "PAID", label: t("pages.hmoClaims.statusPaid"), count: statusQuickCounts.PAID },
          ] as const
        ).map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setStatus(item.key)}
            className={`inline-flex min-h-9 items-center rounded-full border px-3 py-1 text-xs font-semibold transition ${
              status === item.key
                ? "border-violet-300 bg-violet-50 text-violet-800"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {item.label}
            <span className={`ml-1 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${statusCountBadgeClass(item.count)}`}>
              {item.count}
            </span>
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {t("pages.hmoClaims.openClaimAging")}
        </span>
        <button
          type="button"
          onClick={() => setAgingBand("FRESH")}
          className={`inline-flex min-h-9 items-center rounded-full border px-3 py-1 text-xs font-semibold transition ${
            agingBand === "FRESH"
              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          {t("pages.hmoClaims.agingFresh")}
          <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
            {openClaimAging.fresh}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setAgingBand("WARNING")}
          className={`inline-flex min-h-9 items-center rounded-full border px-3 py-1 text-xs font-semibold transition ${
            agingBand === "WARNING"
              ? "border-amber-300 bg-amber-50 text-amber-900"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          {t("pages.hmoClaims.agingWarning")}
          <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
            {openClaimAging.warning}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setAgingBand("CRITICAL")}
          className={`inline-flex min-h-9 items-center rounded-full border px-3 py-1 text-xs font-semibold transition ${
            agingBand === "CRITICAL"
              ? "border-rose-300 bg-rose-50 text-rose-800"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          {t("pages.hmoClaims.agingCritical")}
          <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
            {openClaimAging.critical}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setAgingBand("ALL")}
          className={`inline-flex min-h-9 items-center rounded-full border px-3 py-1 text-xs font-semibold transition ${
            agingBand === "ALL"
              ? "border-violet-300 bg-violet-50 text-violet-800"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          {t("pages.hmoClaims.all")}
        </button>
        <button
          type="button"
          onClick={() => void onCopyCurrentViewLink()}
          className={`inline-flex min-h-9 items-center rounded-full border border-indigo-300 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-800 transition hover:bg-indigo-100 ${fieldFocus}`}
        >
          {t("pages.hmoClaims.copyViewLink")}
        </button>
      </div>
      {priorityClaims.length > 0 ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-700">
            {t("pages.hmoClaims.priorityQueueTitle")}
          </p>
          <p className="mt-0.5 text-xs text-rose-700/90">{t("pages.hmoClaims.priorityQueueHint")}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {priorityClaims.map((c) => (
              <Link
                key={c.id}
                to={`/hmo-claims/${c.id}`}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-rose-300 bg-white px-3 py-1 text-xs font-semibold text-rose-800 hover:bg-rose-100"
              >
                <span className="font-mono">{c.claimNumber}</span>
                <span>·</span>
                <span>{c.patient.firstName} {c.patient.lastName}</span>
                <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                  {c.ageDays}d
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {loading ? (
          <p className="py-8 text-center text-sm text-slate-500">{t("pages.hmoClaims.loading")}</p>
        ) : claims.length === 0 ? (
          <ListEmptyState
            icon="shield"
            title={t("pages.hmoClaims.emptyTitle")}
            description={t("pages.hmoClaims.emptyHint")}
            primary={{ kind: "link", to: "/invoices", label: t("pages.hmoClaims.emptyCtaInvoices") }}
          />
        ) : (
          <>
          <div className="space-y-3 md:hidden">
            {displayClaims.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                {t("pages.hmoClaims.noTableMatches")}
              </p>
            ) : null}
            {displayClaims.map((c) => {
              const nextBest = getNextBestAction(c);
              const nudge = getTimelineNudge(c);
              const escalationTimer = getEscalationTimer(c);
              return (
              <article key={c.id} className="rounded-xl border border-slate-200 p-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    to={`/hmo-claims/${c.id}`}
                    className="inline-flex min-h-9 items-center rounded-md px-1 font-mono text-xs font-semibold text-emerald-700 hover:bg-emerald-50 hover:underline"
                  >
                    {c.claimNumber}
                  </Link>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLE[c.status]}`}>
                    {t(HMO_CLAIM_STATUS_I18N_KEY[c.status])}
                  </span>
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {c.patient.firstName} {c.patient.lastName}
                </p>
                <p className="text-xs text-slate-600">{c.provider.name}</p>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => applyNextBestAction(c)}
                    className={`inline-flex min-h-8 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${nextBest.tone}`}
                  >
                    <span>{t("pages.hmoClaims.nextBestLabel")}: {nextBest.label}</span>
                    <span className="rounded-full bg-white/70 px-1.5 py-0.5 text-[9px]">
                      {t("pages.hmoClaims.nextBestApply")}
                    </span>
                  </button>
                </div>
                {nudge ? (
                  <p className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${nudge.tone}`}>
                    {nudge.label}
                  </p>
                ) : null}
                {escalationTimer ? (
                  <button
                    type="button"
                    onClick={() => applyEscalationTimerPreset(c)}
                    className={`mt-1 inline-flex min-h-8 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${escalationTimer.tone}`}
                  >
                    <span>{escalationTimer.label}</span>
                    <span className="rounded-full bg-white/70 px-1.5 py-0.5 text-[9px]">
                      {t("pages.hmoClaims.nextBestApply")}
                    </span>
                  </button>
                ) : null}
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <p className="text-slate-600">
                    {t("pages.hmoClaims.colRequested")}: <strong className="text-slate-900">{PHP.format(Number(c.requestedAmount))}</strong>
                  </p>
                  <p className="text-slate-600">
                    {t("pages.hmoClaims.colApproved")}: <strong className="text-slate-900">{c.approvedAmount ? PHP.format(Number(c.approvedAmount)) : empty}</strong>
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    to={`/hmo-claims/${c.id}`}
                    className="inline-flex min-h-9 items-center rounded border border-emerald-300 px-2 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
                  >
                    {t("pages.hmoClaims.actionDetail")}
                  </Link>
                  <Link
                    to={`/invoices/${c.invoice.id}`}
                    className="inline-flex min-h-9 items-center rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {t("pages.hmoClaims.actionInvoice")}
                  </Link>
                </div>
              </article>
            )})}
          </div>
          <div className="hidden overflow-x-auto md:block">
          <table className="min-w-[1000px] w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-[11px] uppercase tracking-wider text-slate-500">
                <th className="px-3 py-2">{t("pages.hmoClaims.colClaim")}</th>
                <th className="px-3 py-2 text-center">{t("pages.hmoClaims.colLines")}</th>
                <th className="px-3 py-2">{t("pages.hmoClaims.colPatient")}</th>
                <th className="px-3 py-2">{t("pages.hmoClaims.colProvider")}</th>
                <th className="px-3 py-2 text-right">{t("pages.hmoClaims.colRequested")}</th>
                <th className="px-3 py-2 text-right">{t("pages.hmoClaims.colApproved")}</th>
                <th className="px-3 py-2">{t("pages.hmoClaims.colStatus")}</th>
                <th className="px-3 py-2">{t("pages.hmoClaims.colTimeline")}</th>
                <th className="px-3 py-2">{t("pages.hmoClaims.colActions")}</th>
              </tr>
            </thead>
            <tbody>
              {displayClaims.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                    {t("pages.hmoClaims.noTableMatches")}
                  </td>
                </tr>
              ) : null}
              {displayClaims.map((c) => {
                const nextBest = getNextBestAction(c);
                const nudge = getTimelineNudge(c);
                const escalationTimer = getEscalationTimer(c);
                return (
                <tr key={c.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">
                    <Link to={`/hmo-claims/${c.id}`} className="font-semibold text-emerald-700 hover:underline">
                      {c.claimNumber}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-center text-xs text-slate-600">{c.lineCount}</td>
                  <td className="px-3 py-2">
                    {c.patient.firstName} {c.patient.lastName}
                  </td>
                  <td className="px-3 py-2">{c.provider.name}</td>
                  <td className="px-3 py-2 text-right">{PHP.format(Number(c.requestedAmount))}</td>
                  <td className="px-3 py-2 text-right">
                    {c.approvedAmount ? PHP.format(Number(c.approvedAmount)) : empty}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLE[c.status]}`}>
                      {t(HMO_CLAIM_STATUS_I18N_KEY[c.status])}
                    </span>
                    <p className="mt-1">
                      <button
                        type="button"
                        onClick={() => applyNextBestAction(c)}
                        className={`inline-flex min-h-8 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${nextBest.tone}`}
                      >
                        <span>{t("pages.hmoClaims.nextBestLabel")}: {nextBest.label}</span>
                        <span className="rounded-full bg-white/70 px-1.5 py-0.5 text-[9px]">
                          {t("pages.hmoClaims.nextBestApply")}
                        </span>
                      </button>
                    </p>
                    {nudge ? (
                      <p className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${nudge.tone}`}>
                        {nudge.label}
                      </p>
                    ) : null}
                    {escalationTimer ? (
                      <button
                        type="button"
                        onClick={() => applyEscalationTimerPreset(c)}
                        className={`mt-1 inline-flex min-h-8 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${escalationTimer.tone}`}
                      >
                        <span>{escalationTimer.label}</span>
                        <span className="rounded-full bg-white/70 px-1.5 py-0.5 text-[9px]">
                          {t("pages.hmoClaims.nextBestApply")}
                        </span>
                      </button>
                    ) : null}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-600">
                    <p>
                      {t("pages.hmoClaims.timelineCreated")}{" "}
                      {new Date(c.createdAt).toLocaleDateString("en-PH")}
                    </p>
                    <p>
                      {t("pages.hmoClaims.timelineSubmitted")}{" "}
                      {c.submittedAt ? new Date(c.submittedAt).toLocaleDateString("en-PH") : empty}
                    </p>
                    <p>
                      {t("pages.hmoClaims.timelineDecided")}{" "}
                      {c.decidedAt ? new Date(c.decidedAt).toLocaleDateString("en-PH") : empty}
                    </p>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {canSetHmoClaimStatus(c.status, "DRAFT") ? (
                        <button
                          type="button"
                          onClick={() => void setClaimStatus(c.id, "DRAFT")}
                          className="min-h-9 rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
                        >
                          {t("pages.hmoClaims.actionWithdraw")}
                        </button>
                      ) : null}
                      {canSetHmoClaimStatus(c.status, "SUBMITTED") ? (
                        <button
                          type="button"
                          onClick={() => void setClaimStatus(c.id, "SUBMITTED")}
                          className="min-h-9 rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
                        >
                          {c.status === "REJECTED"
                            ? t("pages.hmoClaims.actionResubmit")
                            : t("pages.hmoClaims.actionSubmit")}
                        </button>
                      ) : null}
                      {canSetHmoClaimStatus(c.status, "APPROVED") ? (
                        <button
                          type="button"
                          onClick={() => void setClaimStatus(c.id, "APPROVED")}
                          className="min-h-9 rounded border border-emerald-300 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-50"
                        >
                          {t("pages.hmoClaims.actionApprove")}
                        </button>
                      ) : null}
                      {canSetHmoClaimStatus(c.status, "REJECTED") ? (
                        <button
                          type="button"
                          onClick={() => void setClaimStatus(c.id, "REJECTED")}
                          className="min-h-9 rounded border border-rose-300 px-2 py-1 text-xs text-rose-700 hover:bg-rose-50"
                        >
                          {t("pages.hmoClaims.actionReject")}
                        </button>
                      ) : null}
                      {canSetHmoClaimStatus(c.status, "PARTIAL_APPROVED") ? (
                        <button
                          type="button"
                          onClick={() => void setClaimStatus(c.id, "PARTIAL_APPROVED")}
                          className="min-h-9 rounded border border-amber-300 px-2 py-1 text-xs text-amber-900 hover:bg-amber-50"
                        >
                          {t("pages.hmoClaims.actionPartial")}
                        </button>
                      ) : null}
                      {canSetHmoClaimStatus(c.status, "PAID") ? (
                        <button
                          type="button"
                          onClick={() => void setClaimStatus(c.id, "PAID")}
                          className="min-h-9 rounded border border-indigo-300 px-2 py-1 text-xs text-indigo-800 hover:bg-indigo-50"
                        >
                          {t("pages.hmoClaims.actionPaid")}
                        </button>
                      ) : null}
                      <Link
                        to={`/hmo-claims/${c.id}`}
                        className="inline-flex min-h-9 items-center rounded border border-emerald-300 px-2 py-1 text-xs text-emerald-800 hover:bg-emerald-50"
                      >
                        {t("pages.hmoClaims.actionDetail")}
                      </Link>
                      <Link
                        to={`/invoices/${c.invoice.id}`}
                        className="inline-flex min-h-9 items-center rounded border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        {t("pages.hmoClaims.actionInvoice")}
                      </Link>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
          </div>
          </>
        )}
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "sky" | "emerald" | "rose" | "purple";
}) {
  const styles: Record<typeof tone, string> = {
    sky: "border-sky-200 bg-sky-50 text-sky-900",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
    rose: "border-rose-200 bg-rose-50 text-rose-900",
    purple: "border-violet-200 bg-violet-50 text-violet-900",
  };
  return (
    <div className={`rounded-xl border p-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${styles[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}
