import { Suspense, lazy, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
// framer-motion removed
import { 
  Activity, 
  RefreshCw, 
  Settings,
  Bell,
  AlertCircle
} from "lucide-react";

import {
  fetchDashboardCharts,
  fetchDashboardQueue,
  fetchDashboardSummary,
  mergeDashboardParts,
  fetchMonthlyReport,
  openMonthlyReportPdf,
  type DashboardTodayAppointment,
} from "../services/reports";
import { fetchHmoClaims } from "../services/hmo";
import { getUser } from "../hooks/authTokens";
import { useDashboardQueueStream } from "../hooks/useDashboardQueueStream";
import { patchAppointmentStatus, sendAppointmentQueueAlert } from "../services/appointments";
import type { AppointmentStatus } from "../types/appointment";

import { MetricCardsGrid } from "../components/dashboard/widgets/MetricCardsGrid";
import { ClinicQueue } from "../components/dashboard/widgets/ClinicQueue";
import { QueueBulkToolbar } from "../components/dashboard/widgets/QueueBulkToolbar";
import { ActiveTreatmentCard } from "../components/dashboard/widgets/ActiveTreatmentCard";

import type { ClinicFloorPlanZoneId } from "../components/dashboard/ClinicFloorPlanBoard";

const ClinicFloorPlanBoard = lazy(() => import("../components/dashboard/ClinicFloorPlanBoard"));
const FinancialOverview = lazy(async () => {
  const m = await import("../components/dashboard/widgets/FinancialOverview");
  return { default: m.FinancialOverview };
});
const HmoClaimRadar = lazy(async () => {
  const m = await import("../components/dashboard/widgets/HmoClaimRadar");
  return { default: m.HmoClaimRadar };
});

function DashboardSectionFallback(): JSX.Element {
  return (
    <div
      className="min-h-[12rem] animate-pulse rounded-[2rem] bg-slate-100 dark:bg-slate-800/60"
      aria-hidden
    />
  );
}

const PHP = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
const PHP_FULL = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const METHOD_COLORS: Record<string, string> = {
  cash: "#10b981",
  gcash: "#14b8a6",
  maya: "#0d9488",
  creditCard: "#f59e0b",
  cheque: "#64748b",
  philhealth: "#ef4444",
};

function DashboardChartEmpty({ message }: { message: string }): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-10 text-center" role="status">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        <Activity size={24} />
      </div>
      <p className="max-w-sm text-sm text-slate-600 dark:text-slate-400 font-bold uppercase tracking-widest">{message}</p>
    </div>
  );
}

function fmtDay(key: string): string {
  const d = new Date(`${key}T00:00:00+08:00`);
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    day: "2-digit",
    month: "short",
  }).format(d);
}

function claimAgeDays(iso: string): number {
  const d = new Date(iso);
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

export function DashboardPage(): JSX.Element {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const role = getUser()?.role ?? "RECEPTIONIST";
  const canSeeFinance = role === "ADMIN";
  const canSeeManagementCards = role === "ADMIN" || role === "DENTIST";

  const [queueBusyId, setQueueBusyId] = useState<string | null>(null);
  const [bulkQueueBusy, setBulkQueueBusy] = useState(false);
  const [criticalProviderBaseline] = useState<Record<string, number>>({});
  const [assignNowCount, setAssignNowCount] = useState(0);
  const [assignNowByRole, setAssignNowByRole] = useState({ admin: 0, dentist: 0, reception: 0 });

  const [year, setYear] = useState(() => new Date().getUTCFullYear());
  const [month, setMonth] = useState(() => new Date().getUTCMonth() + 1);
  const [section, setSection] = useState<"overview" | "operations" | "finance">("overview");
  const opsLive = section === "operations";

  const { data: dashboardSummary, isLoading: summaryLoading, error: summaryError } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: fetchDashboardSummary,
    staleTime: 60_000,
  });

  useDashboardQueueStream(opsLive && !!dashboardSummary);

  const {
    data: dashboardQueue,
    isLoading: queueLoading,
    dataUpdatedAt: queueUpdatedAt,
  } = useQuery({
    queryKey: ["dashboard-queue"],
    queryFn: fetchDashboardQueue,
    staleTime: 15_000,
    enabled: !!dashboardSummary,
    refetchInterval: opsLive ? 20_000 : false,
    refetchIntervalInBackground: opsLive,
  });

  const { data: dashboardCharts, isLoading: chartsLoading } = useQuery({
    queryKey: ["dashboard-charts"],
    queryFn: fetchDashboardCharts,
    staleTime: 60_000,
    enabled: !!dashboardSummary,
  });

  const dashboardView = useMemo(
    () =>
      dashboardSummary
        ? mergeDashboardParts(dashboardSummary, dashboardQueue ?? null, dashboardCharts ?? null)
        : undefined,
    [dashboardSummary, dashboardQueue, dashboardCharts],
  );

  const dashboardLoading = summaryLoading || queueLoading || chartsLoading;
  const dashboardError = summaryError;

  const { data: monthly, isLoading: monthlyLoading, error: monthlyError } = useQuery({
    queryKey: ["monthlyReport", year, month],
    queryFn: () => fetchMonthlyReport(year, month),
  });

  const { data: hmoClaimsSnapshot = [], isLoading: claimsLoading } = useQuery({
    queryKey: ["hmoClaims", "recent"],
    queryFn: () => fetchHmoClaims({ limit: 200 }),
  });

  const claimRadarCounts = useMemo(() => {
    let critical = 0, warning = 0, submission = 0, cashflow = 0, resubmit = 0;
    for (const claim of hmoClaimsSnapshot) {
      if (claim.status === "DRAFT") submission += 1;
      if (claim.status === "APPROVED") cashflow += 1;
      if (claim.status === "REJECTED") resubmit += 1;
      if (claim.status === "SUBMITTED") {
        const age = claimAgeDays(claim.createdAt);
        if (age >= 8) critical += 1;
        else if (age >= 4) warning += 1;
      }
    }
    return { critical, warning, submission, cashflow, resubmit };
  }, [hmoClaimsSnapshot]);

  const metricsReady = !!dashboardView;
  const loading = (!metricsReady && dashboardLoading) || monthlyLoading || claimsLoading;
  const error =
    !metricsReady && (dashboardError as Error)?.message
      ? (dashboardError as Error)?.message
      : (monthlyError as Error)?.message;

  async function changeQueueStatus(
    row: DashboardTodayAppointment,
    next: AppointmentStatus,
    opts?: { silent?: boolean },
  ): Promise<boolean> {
    if (!opts?.silent) setQueueBusyId(row.id);
    try {
      await patchAppointmentStatus(row.id, next);
      if (!opts?.silent) {
        await invalidateDashboardQueue();
      }
      return true;
    } catch (e) {
      if (!opts?.silent) {
        toast.error(e instanceof Error ? e.message : t("pages.dashboard.queueStatusFailed"));
      }
      return false;
    } finally {
      if (!opts?.silent) setQueueBusyId(null);
    }
  }

  async function handleFloorPlanDrop(appointmentId: string, zone: ClinicFloorPlanZoneId): Promise<void> {
    const zoneLabel = t(`pages.dashboard.floorPlan.zones.${zone}.label`);
    const actions: Record<ClinicFloorPlanZoneId, AppointmentStatus> = {
      "waiting-room": "PENDING",
      "unit-1": "IN_PROGRESS",
      "unit-2": "IN_PROGRESS",
      "xray-room": "CHECKED_IN",
    };
    const ok = await changeQueueStatus({ id: appointmentId } as DashboardTodayAppointment, actions[zone]);
    if (ok) {
      toast.success(t("pages.dashboard.floorPlan.dropSuccess", { zone: zoneLabel }));
    }
  }

  async function runBulkQueueAction(
    rows: DashboardTodayAppointment[],
    action: (row: DashboardTodayAppointment) => Promise<boolean | void>,
    successKey: string,
  ): Promise<void> {
    if (!rows.length) return;
    setBulkQueueBusy(true);
    let ok = 0;
    try {
      for (const row of rows) {
        const result = await action(row);
        if (result !== false) ok += 1;
      }
      await invalidateDashboardQueue();
      toast.success(t(successKey, { ok, total: rows.length }));
    } finally {
      setBulkQueueBusy(false);
    }
  }

  async function sendAlert(row: DashboardTodayAppointment, opts?: { silent?: boolean }): Promise<boolean> {
    if (!opts?.silent) setQueueBusyId(row.id);
    try {
      await sendAppointmentQueueAlert(row.id);
      if (!opts?.silent) {
        await queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
        await queryClient.invalidateQueries({ queryKey: ["dashboard-queue"] });
        await queryClient.invalidateQueries({ queryKey: ["dashboard-charts"] });
        toast.success(t("pages.dashboard.queueAlertSent"));
      }
      return true;
    } catch (e) {
      if (!opts?.silent) {
        toast.error(e instanceof Error ? e.message : t("pages.dashboard.queueAlertFailed"));
      }
      return false;
    } finally {
      if (!opts?.silent) setQueueBusyId(null);
    }
  }

  async function invalidateDashboardQueue(): Promise<void> {
    await queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    await queryClient.invalidateQueries({ queryKey: ["dashboard-queue"] });
    await queryClient.invalidateQueries({ queryKey: ["dashboard-charts"] });
  }

  async function copyClaimRadarSnapshot(): Promise<void> {
    const text = `DentEase Claim Radar\nPending: ${dashboardView?.operational.pendingHmoClaims}\nCritical: ${claimRadarCounts.critical}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("pages.dashboard.claimRadarSnapshotCopied"));
    } catch { toast.error(t("pages.dashboard.claimRadarSnapshotCopyFailed")); }
  }

  function onAssignNowClick(ownerKey: any): void {
    setAssignNowCount((prev) => prev + 1);
    setAssignNowByRole((prev: any) => ({
      ...prev,
      admin: prev.admin + (ownerKey === "ADMIN" ? 1 : 0),
      dentist: prev.dentist + (ownerKey === "DENTIST" ? 1 : 0),
      reception: prev.reception + (ownerKey === "RECEPTIONIST" ? 1 : 0),
    }));
  }

  function resetAssignNowCounters(): void {
    setAssignNowCount(0);
    setAssignNowByRole({ admin: 0, dentist: 0, reception: 0 });
  }

  const revenueSeries = useMemo(() => (dashboardView?.revenueByDay ?? []).map((r) => ({
    date: r.date, label: fmtDay(r.date), amount: Number(r.amount),
  })), [dashboardView]);

  const revenueHasData = useMemo(() => revenueSeries.length > 0 && revenueSeries.some((r) => r.amount > 0), [revenueSeries]);

  const paymentPie = useMemo(() => {
    if (!monthly) return [];
    const pm = monthly.paymentMethods;
    const keys = ["cash", "gcash", "maya", "creditCard", "cheque", "philhealth"] as const;
    return keys.map((key) => ({ key, name: t(`pages.dashboard.paymentMethods.${key}`), value: Number(pm[key]) })).filter((a) => a.value > 0);
  }, [monthly, t]);

  const topProc = useMemo(() => (dashboardView?.topProcedures ?? []).map((p) => ({ ...p, revenueNum: Number(p.revenue) })), [dashboardView]);

  const statusRows = useMemo(() => {
    if (!dashboardView) return [];
    const s = dashboardView.appointmentsByStatus;
    return [
      { key: "pending", label: t("pages.dashboard.statusPending"), value: s.pending, color: "bg-amber-400" },
      { key: "confirmed", label: t("pages.dashboard.statusConfirmed"), value: s.confirmed, color: "bg-teal-500" },
      { key: "checkedIn", label: t("pages.dashboard.statusCheckedIn"), value: s.checkedIn, color: "bg-emerald-500" },
      { key: "inProgress", label: t("pages.dashboard.statusInProgress"), value: s.inProgress, color: "bg-teal-700" },
      { key: "completed", label: t("pages.dashboard.statusCompleted"), value: s.completed, color: "bg-emerald-600" },
      { key: "cancelled", label: t("pages.dashboard.statusCancelled"), value: s.cancelled, color: "bg-rose-500" },
      { key: "noShow", label: t("pages.dashboard.statusNoShow"), value: s.noShow, color: "bg-slate-500" },
    ];
  }, [dashboardView, t]);

  const statusTotal = statusRows.reduce((s, r) => s + r.value, 0);

  const currentlyInClinic = useMemo(() => (dashboardView?.queue.rows ?? []).filter((r) => r.status === "CHECKED_IN" || r.status === "IN_PROGRESS"), [dashboardView?.queue.rows]);
  const nextAppointments = useMemo(() => (dashboardView?.today.upcoming ?? []).filter((r) => r.status === "PENDING" || r.status === "CONFIRMED"), [dashboardView?.today.upcoming]);
  const overdueAppointments = useMemo(() => nextAppointments.filter((r) => r.waitingMinutes > 0), [nextAppointments]);

  const criticalClaimsByProvider = useMemo(() => {
    const byProvider = new Map<string, { id: string; name: string; critical: number }>();
    for (const claim of hmoClaimsSnapshot) {
      if (claim.status !== "SUBMITTED" || claimAgeDays(claim.createdAt) < 8) continue;
      const current = byProvider.get(claim.provider.id) ?? { id: claim.provider.id, name: claim.provider.name, critical: 0 };
      current.critical += 1;
      byProvider.set(claim.provider.id, current);
    }
    return [...byProvider.values()];
  }, [hmoClaimsSnapshot]);

  const providerBreachForecast = useMemo(() => {
    const byProvider = new Map<string, { todayRisk: number; tomorrowRisk: number }>();
    for (const claim of hmoClaimsSnapshot) {
      if (claim.status !== "SUBMITTED") continue;
      const age = claimAgeDays(claim.createdAt);
      if (age < 6 || age >= 8) continue;
      const current = byProvider.get(claim.provider.id) ?? { todayRisk: 0, tomorrowRisk: 0 };
      if (age === 7) current.todayRisk += 1;
      if (age === 6) current.tomorrowRisk += 1;
      byProvider.set(claim.provider.id, current);
    }
    return byProvider;
  }, [hmoClaimsSnapshot]);

  const claimRadarForecastTotals = useMemo(() => {
    let todayRisk = 0, tomorrowRisk = 0;
    for (const row of providerBreachForecast.values()) {
      todayRisk += row.todayRisk;
      tomorrowRisk += row.tomorrowRisk;
    }
    return { critical: claimRadarCounts.critical, todayRisk, tomorrowRisk };
  }, [providerBreachForecast, claimRadarCounts.critical]);

  const claimRadarTeamLoad = useMemo(() => ({
    admin: claimRadarCounts.critical + claimRadarCounts.cashflow,
    dentist: claimRadarCounts.warning + claimRadarCounts.resubmit,
    reception: claimRadarCounts.submission + claimRadarForecastTotals.todayRisk,
  }), [claimRadarCounts, claimRadarForecastTotals.todayRisk]);

  const claimRadarRecommendedOwner = useMemo(() => {
    const ownerLoads = [
      { key: "ADMIN", load: claimRadarTeamLoad.admin, label: t("pages.dashboard.claimRadarRoleAdmin") },
      { key: "DENTIST", load: claimRadarTeamLoad.dentist, label: t("pages.dashboard.claimRadarRoleDentist") },
      { key: "RECEPTIONIST", load: claimRadarTeamLoad.reception, label: t("pages.dashboard.claimRadarRoleReception") },
    ];
    const sorted = [...ownerLoads].sort((a, b) => a.load - b.load);
    const recommended = sorted[0] ?? ownerLoads[0];
    return {
      key: recommended.key,
      label: recommended.label,
      load: recommended.load,
      reason: recommended.key === "ADMIN" ? t("pages.dashboard.claimRadarOwnerReasonAdmin") : recommended.key === "DENTIST" ? t("pages.dashboard.claimRadarOwnerReasonDentist") : t("pages.dashboard.claimRadarOwnerReasonReception"),
    };
  }, [claimRadarTeamLoad, t]);

  const criticalClosureKpi = useMemo(() => {
    const baselineTotal = Object.values(criticalProviderBaseline).reduce((acc, n) => acc + n, 0);
    if (baselineTotal <= 0) return { done: 0, total: 0, pct: 0 };
    const reduced = Math.max(0, baselineTotal - claimRadarCounts.critical);
    return { done: reduced, total: baselineTotal, pct: Math.max(0, Math.min(100, Math.round((reduced / baselineTotal) * 100))) };
  }, [criticalProviderBaseline, claimRadarCounts.critical]);

  const criticalProviderHotspots = useMemo(() => {
    return criticalClaimsByProvider.map((provider) => {
      const baseline = criticalProviderBaseline[provider.id] ?? provider.critical;
      const delta = provider.critical - baseline;
      const forecast = providerBreachForecast.get(provider.id);
      return {
        ...provider,
        delta,
        trendTone: delta > 0 ? "bg-rose-100 text-rose-800" : delta < 0 ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700",
        trendLabel: t(delta > 0 ? "pages.dashboard.claimRadarHotspotTrendUp" : delta < 0 ? "pages.dashboard.claimRadarHotspotTrendDown" : "pages.dashboard.claimRadarHotspotTrendFlat"),
        deltaLabel: t("pages.dashboard.claimRadarHotspotDelta", { delta }),
        action: provider.critical >= 4 ? { key: "ESCALATE", label: t("pages.dashboard.claimRadarHotspotActionEscalate"), tone: "bg-rose-200 text-rose-950" } : (forecast?.todayRisk ?? 0) > 0 ? { key: "CALL", label: t("pages.dashboard.claimRadarHotspotActionCall"), tone: "bg-amber-200 text-amber-950" } : { key: "ASSIGN", label: t("pages.dashboard.claimRadarHotspotActionAssign"), tone: "bg-indigo-100 text-indigo-900" },
        forecast: forecast?.todayRisk ? { label: t("pages.dashboard.claimRadarHotspotForecastToday", { count: forecast.todayRisk }), tone: "bg-amber-100 text-amber-900" } : forecast?.tomorrowRisk ? { label: t("pages.dashboard.claimRadarHotspotForecastTomorrow", { count: forecast.tomorrowRisk }), tone: "bg-sky-100 text-sky-900" } : null,
      };
    }).sort((a, b) => b.critical - a.critical).slice(0, 3);
  }, [criticalClaimsByProvider, criticalProviderBaseline, providerBreachForecast, t]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Activity className="h-12 w-12 animate-spin text-violet-500" />
        <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">{t("pages.dashboard.assemblingInsights")}</p>
      </div>
    );
  }

  if (error || !dashboardView || !monthly) return (
    <div className="p-20 text-center bg-rose-50 rounded-[3rem] border border-rose-100 mx-10 mt-10">
      <AlertCircle className="h-16 w-16 text-rose-500 mx-auto mb-6" />
      <p className="text-xl font-black text-rose-900 uppercase tracking-tighter mb-4">{error || t("pages.dashboard.syncInterrupted")}</p>
      <button onClick={() => window.location.reload()} className="px-8 py-3 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-600/20">{t("pages.dashboard.restartEngine")}</button>
    </div>
  );

  return (
    <div className="min-h-screen w-full pb-24 bg-[#fafbfc] dark:bg-slate-950">
      <div className="mx-auto max-w-[1500px] px-6 lg:px-10 space-y-12 pt-10">
        
        {/* Dynamic Header */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
           <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">{t("pages.dashboard.intelligenceHub")}</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-slate-900 dark:text-white">
                {t("pages.dashboard.heroTitle")}<span className="text-violet-500">.</span>
              </h1>
              <p className="text-lg font-medium text-slate-400 max-w-xl">{t("pages.dashboard.subtitleMain")}</p>
           </div>

           <div className="flex items-center gap-4">
              <button className="h-14 w-14 flex items-center justify-center rounded-[1.5rem] bg-white dark:bg-slate-900 shadow-xl ring-1 ring-slate-100 dark:ring-slate-800 text-slate-400 hover:text-violet-500 transition-all">
                 <Bell size={20} />
              </button>
              <button className="h-14 w-14 flex items-center justify-center rounded-[1.5rem] bg-white dark:bg-slate-900 shadow-xl ring-1 ring-slate-100 dark:ring-slate-800 text-slate-400 hover:text-violet-500 transition-all">
                 <Settings size={20} />
              </button>
              <button 
                onClick={() => void queryClient.invalidateQueries()}
                className="h-14 px-8 flex items-center gap-3 rounded-[1.5rem] bg-violet-500 text-white shadow-2xl shadow-violet-500/20 hover:scale-105 active:scale-95 transition-all"
              >
                 <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                 <span className="text-[10px] font-black uppercase tracking-widest">{t("pages.dashboard.refreshData")}</span>
              </button>
           </div>
        </header>

        {/* Global Performance Stream */}
        <MetricCardsGrid dashboard={dashboardView} canSeeManagementCards={canSeeManagementCards} />

        <nav className="flex flex-wrap gap-2" role="tablist" aria-label={t("pages.dashboard.title")}>
          {(["overview", "operations", "finance"] as const).map((key) => {
            if (key === "finance" && !canSeeFinance) return null;
            const active = section === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSection(key)}
                className={`rounded-2xl px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                  active
                    ? "bg-violet-500 text-white shadow-lg shadow-violet-500/25"
                    : "bg-white text-slate-500 ring-1 ring-slate-100 hover:text-violet-600 dark:bg-slate-900 dark:ring-slate-800"
                }`}
              >
                {t(`pages.dashboard.sections.${key}`)}
              </button>
            );
          })}
        </nav>

        {section === "overview" && (
          <div className="grid grid-cols-1 gap-12 xl:grid-cols-12">
            <div className="xl:col-span-5">
              <ActiveTreatmentCard dashboard={dashboardView} phpFullFormatter={PHP_FULL} />
            </div>
            {canSeeManagementCards ? (
              <div className="xl:col-span-7">
                <Suspense fallback={<DashboardSectionFallback />}>
                  <HmoClaimRadar
                    dashboard={dashboardView}
                    claimRadarCounts={claimRadarCounts}
                    claimRadarForecastTotals={claimRadarForecastTotals}
                    claimRadarTeamLoad={claimRadarTeamLoad}
                    claimRadarRecommendedOwner={claimRadarRecommendedOwner}
                    criticalClosureKpi={criticalClosureKpi}
                    criticalProviderHotspots={criticalProviderHotspots}
                    assignNowCount={assignNowCount}
                    assignNowByRole={assignNowByRole}
                    role={role}
                    copyClaimRadarSnapshot={copyClaimRadarSnapshot}
                    onAssignNowClick={onAssignNowClick}
                    resetAssignNowCounters={resetAssignNowCounters}
                  />
                </Suspense>
              </div>
            ) : null}
          </div>
        )}

        {section === "operations" && (
          <div className="space-y-12">
            <Suspense fallback={<DashboardSectionFallback />}>
              <ClinicFloorPlanBoard dashboard={dashboardView} onPatientDrop={handleFloorPlanDrop} />
            </Suspense>
            <QueueBulkToolbar
              overdue={overdueAppointments}
              pendingNext={nextAppointments.slice(0, 10)}
              lastSyncedAt={queueUpdatedAt}
              disabled={bulkQueueBusy || queueBusyId !== null}
              onBulkCheckInOverdue={() =>
                runBulkQueueAction(
                  overdueAppointments,
                  (row) => changeQueueStatus(row, "CHECKED_IN", { silent: true }),
                  "pages.dashboard.bulkCheckInResult",
                )
              }
              onBulkAlertOverdue={() =>
                runBulkQueueAction(
                  overdueAppointments,
                  (row) => sendAlert(row, { silent: true }),
                  "pages.dashboard.bulkAlertResult",
                )
              }
              onBulkCheckInNext={() =>
                runBulkQueueAction(
                  nextAppointments.slice(0, 10),
                  (row) => changeQueueStatus(row, "CHECKED_IN", { silent: true }),
                  "pages.dashboard.bulkCheckInResult",
                )
              }
            />
            <ClinicQueue
              currentlyInClinic={currentlyInClinic}
              nextAppointments={nextAppointments}
              overdueAppointments={overdueAppointments}
              queueBusyId={queueBusyId}
              sendAlert={sendAlert}
              changeQueueStatus={changeQueueStatus}
            />
          </div>
        )}

        {section === "finance" && canSeeFinance && (
          <Suspense fallback={<DashboardSectionFallback />}>
            <FinancialOverview
              dashboard={dashboardView}
              monthly={monthly}
              revenueSeries={revenueSeries}
              revenueHasData={revenueHasData}
              paymentPie={paymentPie}
              topProc={topProc}
              statusRows={statusRows}
              statusTotal={statusTotal}
              year={year}
              month={month}
              setYear={setYear}
              setMonth={setMonth}
              openMonthlyReportPdf={openMonthlyReportPdf}
              phpFormatter={PHP}
              phpFullFormatter={PHP_FULL}
              methodColors={METHOD_COLORS}
              dashboardChartEmpty={DashboardChartEmpty}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
