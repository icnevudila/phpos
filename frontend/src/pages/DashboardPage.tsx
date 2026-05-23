import { Suspense, lazy, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  RefreshCw,
  AlertCircle,
  Users,
  Clock,
  FileText,
  Package,
  CalendarDays,
  Plus
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

import { ActiveTreatmentCard } from "../components/dashboard/widgets/ActiveTreatmentCard";
import type { ClinicFloorPlanZoneId } from "../components/dashboard/ClinicFloorPlanBoard";

// New UI Components
import { PageHeader } from "../components/ui/PageHeader";
import { StatCard } from "../components/ui/StatCard";
import { DataTable, type ColumnDef } from "../components/ui/DataTable";
import { EmptyState } from "../components/ui/EmptyState";

const ClinicFloorPlanBoard = lazy(() => import("../components/dashboard/ClinicFloorPlanBoard"));
const FinancialOverview = lazy(async () => {
  const m = await import("../components/dashboard/widgets/FinancialOverview");
  return { default: m.FinancialOverview };
});
const HmoClaimRadar = lazy(async () => {
  const m = await import("../components/dashboard/widgets/HmoClaimRadar");
  return { default: m.HmoClaimRadar };
});

function SectionFallback(): JSX.Element {
  return (
    <div className="min-h-[10rem] animate-pulse rounded-2xl bg-brand-surface-soft" aria-hidden />
  );
}

const PHP = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 0, maximumFractionDigits: 0 });
const PHP_FULL = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 2, maximumFractionDigits: 2 });

const METHOD_COLORS: Record<string, string> = {
  cash: "#10b981", gcash: "#14b8a6", maya: "#0d9488",
  creditCard: "#f59e0b", cheque: "#64748b", philhealth: "#ef4444",
};

export function DashboardChartEmpty({ message }: { message: string }): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-10 text-center" role="status">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-400">
        <Activity size={22} />
      </div>
      <p className="max-w-sm text-sm font-medium text-slate-400">{message}</p>
    </div>
  );
}

function fmtDay(key: string): string {
  const d = new Date(`${key}T00:00:00+08:00`);
  return new Intl.DateTimeFormat("en-PH", { timeZone: "Asia/Manila", day: "2-digit", month: "short" }).format(d);
}

function claimAgeDays(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
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

  const { data: dashboardQueue, isLoading: queueLoading, dataUpdatedAt: queueUpdatedAt } = useQuery({
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
    () => dashboardSummary ? mergeDashboardParts(dashboardSummary, dashboardQueue ?? null, dashboardCharts ?? null) : undefined,
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
  const error = !metricsReady && (dashboardError as Error)?.message
    ? (dashboardError as Error)?.message
    : (monthlyError as Error)?.message;

  async function changeQueueStatus(row: DashboardTodayAppointment, next: AppointmentStatus, opts?: { silent?: boolean }): Promise<boolean> {
    if (!opts?.silent) setQueueBusyId(row.id);
    try {
      await patchAppointmentStatus(row.id, next);
      if (!opts?.silent) await invalidateDashboardQueue();
      return true;
    } catch (e) {
      if (!opts?.silent) toast.error(e instanceof Error ? e.message : t("pages.dashboard.queueStatusFailed", { defaultValue: "Queue Status Failed" }));
      return false;
    } finally {
      if (!opts?.silent) setQueueBusyId(null);
    }
  }

  async function handleFloorPlanDrop(appointmentId: string, zone: ClinicFloorPlanZoneId): Promise<void> {
    const zoneLabel = t(`pages.dashboard.floorPlan.zones.${zone}.label`);
    const actions: Record<ClinicFloorPlanZoneId, AppointmentStatus> = {
      "waiting-room": "PENDING", "unit-1": "IN_PROGRESS", "unit-2": "IN_PROGRESS", "xray-room": "CHECKED_IN",
    };
    const ok = await changeQueueStatus({ id: appointmentId } as DashboardTodayAppointment, actions[zone]);
    if (ok) toast.success(t("pages.dashboard.floorPlan.dropSuccess", { zone: zoneLabel }));
  }

  async function invalidateDashboardQueue(): Promise<void> {
    await queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    await queryClient.invalidateQueries({ queryKey: ["dashboard-queue"] });
    await queryClient.invalidateQueries({ queryKey: ["dashboard-charts"] });
  }

  async function copyClaimRadarSnapshot(): Promise<void> {
    const text = `DentQL Claim Radar\nPending: ${dashboardView?.operational.pendingHmoClaims}\nCritical: ${claimRadarCounts.critical}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("pages.dashboard.claimRadarSnapshotCopied", { defaultValue: "Claim Radar Snapshot Copied" }));
    } catch { toast.error(t("pages.dashboard.claimRadarSnapshotCopyFailed", { defaultValue: "Claim Radar Snapshot Copy Failed" })); }
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

  const nextAppointments = useMemo(() =>
    (dashboardView?.today.upcoming ?? []).filter((r) => r.status === "PENDING" || r.status === "CONFIRMED"),
    [dashboardView?.today.upcoming]);

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
      todayRisk += row.todayRisk; tomorrowRisk += row.tomorrowRisk;
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
      { key: "ADMIN",       load: claimRadarTeamLoad.admin,    label: t("pages.dashboard.claimRadarRoleAdmin", { defaultValue: "Claim Radar Role Admin" }) },
      { key: "DENTIST",     load: claimRadarTeamLoad.dentist,  label: t("pages.dashboard.claimRadarRoleDentist", { defaultValue: "Claim Radar Role Dentist" }) },
      { key: "RECEPTIONIST",load: claimRadarTeamLoad.reception,label: t("pages.dashboard.claimRadarRoleReception", { defaultValue: "Claim Radar Role Reception" }) },
    ];
    const sorted = [...ownerLoads].sort((a, b) => a.load - b.load);
    const recommended = sorted[0] ?? ownerLoads[0];
    return {
      key: recommended.key, label: recommended.label, load: recommended.load,
      reason: recommended.key === "ADMIN" ? t("pages.dashboard.claimRadarOwnerReasonAdmin", { defaultValue: "Claim Radar Owner Reason Admin" })
        : recommended.key === "DENTIST" ? t("pages.dashboard.claimRadarOwnerReasonDentist", { defaultValue: "Claim Radar Owner Reason Dentist" })
        : t("pages.dashboard.claimRadarOwnerReasonReception", { defaultValue: "Claim Radar Owner Reason Reception" }),
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
        ...provider, delta,
        trendTone: delta > 0 ? "bg-rose-100 text-rose-800" : delta < 0 ? "bg-teal-100 text-teal-800" : "bg-slate-100 text-slate-700",
        trendLabel: t(delta > 0 ? "pages.dashboard.claimRadarHotspotTrendUp" : delta < 0 ? "pages.dashboard.claimRadarHotspotTrendDown" : "pages.dashboard.claimRadarHotspotTrendFlat"),
        deltaLabel: t("pages.dashboard.claimRadarHotspotDelta", { delta }),
        action: provider.critical >= 4
          ? { key: "ESCALATE", label: t("pages.dashboard.claimRadarHotspotActionEscalate", { defaultValue: "Claim Radar Hotspot Action Escalate" }), tone: "bg-rose-200 text-rose-950" }
          : (forecast?.todayRisk ?? 0) > 0
            ? { key: "CALL", label: t("pages.dashboard.claimRadarHotspotActionCall", { defaultValue: "Claim Radar Hotspot Action Call" }), tone: "bg-amber-200 text-amber-950" }
            : { key: "ASSIGN", label: t("pages.dashboard.claimRadarHotspotActionAssign", { defaultValue: "Claim Radar Hotspot Action Assign" }), tone: "bg-teal-100 text-teal-900" },
        forecast: forecast?.todayRisk
          ? { label: t("pages.dashboard.claimRadarHotspotForecastToday", { count: forecast.todayRisk }), tone: "bg-amber-100 text-amber-900" }
          : forecast?.tomorrowRisk
            ? { label: t("pages.dashboard.claimRadarHotspotForecastTomorrow", { count: forecast.tomorrowRisk }), tone: "bg-sky-100 text-sky-900" }
            : null,
      };
    }).sort((a, b) => b.critical - a.critical).slice(0, 3);
  }, [criticalClaimsByProvider, criticalProviderBaseline, providerBreachForecast, t]);

  const appointmentsColumns: ColumnDef<DashboardTodayAppointment>[] = [
    {
      key: "time",
      header: "Time",
      cell: (row) => {
        try {
          return new Date(row.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
          return row.time; // Fallback if invalid date
        }
      }
    },
    {
      key: "patient",
      header: "Patient",
      cell: (row) => <span className="font-semibold text-brand-text">{row.patientName || "Unknown Patient"}</span>
    },
    {
      key: "dentist",
      header: "Dentist",
      cell: (row) => row.dentistName || "Unassigned"
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <span className={`badge ${row.status === 'CHECKED_IN' ? 'badge-primary' : 'badge-slate'}`}>
          {row.status.replace("_", " ")}
        </span>
      )
    }
  ];

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <div className="h-12 w-12 rounded-2xl bg-brand-primary-soft flex items-center justify-center">
          <Activity className="h-6 w-6 animate-spin text-brand-primary" />
        </div>
        <p className="text-sm font-semibold text-brand-muted">{t("pages.dashboard.assemblingInsights", { defaultValue: "Loading dashboard insights..." })}</p>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error || !dashboardView || !monthly) return (
    <div className="card text-center py-16 mx-auto max-w-sm mt-10">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-danger-soft">
        <AlertCircle className="h-7 w-7 text-brand-danger" />
      </div>
      <p className="text-base font-bold text-brand-text mb-1">{t("pages.dashboard.syncInterrupted", { defaultValue: "Sync Interrupted" })}</p>
      <p className="text-sm text-brand-muted mb-6">{error}</p>
      <button onClick={() => window.location.reload()} className="btn-primary mx-auto">
        {t("common.refresh", { defaultValue: "Refresh Page" })}
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      
      <PageHeader 
        title={t("pages.dashboard.heroTitle", { defaultValue: "Today Board" })}
        subtitle={t("pages.dashboard.subtitleMain", { defaultValue: "Chair flow, waiting room, and clinical risk overview." })}
        actions={
          <>
            <input type="date" className="h-10 px-3 rounded-[var(--radius-md)] border border-brand-border bg-brand-surface text-brand-text text-sm font-medium focus:outline-none focus:ring-1 focus:ring-brand-primary" defaultValue={new Date().toISOString().split('T')[0]} />
            <button onClick={() => void queryClient.invalidateQueries()} className="btn-secondary">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">{t("common.refresh", { defaultValue: "Refresh" })}</span>
            </button>
          </>
        }
      />

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard 
          label="Scheduled Chairs" 
          value={dashboardView.today.appointments} 
          icon={CalendarDays}
          badge={{ text: `${dashboardView.queue.checkedIn} checked in`, variant: "primary" }}
        />
        <StatCard 
          label="Waiting Now" 
          value={dashboardView.queue.waiting} 
          icon={Users}
          subtitle="avg 15 min wait time"
        />
        <StatCard 
          label="Pending Claims" 
          value={claimRadarCounts.submission} 
          icon={FileText}
          badge={{ text: `${claimRadarCounts.critical} critical`, variant: "danger" }}
        />
        <StatCard 
          label="Stock Alerts" 
          value="2" 
          icon={Package}
          badge={{ text: "2 critical", variant: "danger" }}
          subtitle="4 low stock"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Queue and Active Treatments */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-brand-text">Chair Schedule</h2>
              <button className="text-sm font-medium text-brand-primary hover:text-brand-primary-hover flex items-center gap-1">
                View Calendar <Clock size={14} />
              </button>
            </div>
            
            <DataTable 
              data={nextAppointments.slice(0, 5)}
              columns={appointmentsColumns}
              keyExtractor={(row) => row.id}
              emptyState={
                <EmptyState 
                  icon={CalendarDays}
                  title="No Upcoming Appointments"
                  description="There are no more appointments scheduled for today."
                  action={<button className="btn-secondary mt-2"><Plus size={16}/> Book Walk-in</button>}
                />
              }
            />
          </div>
          
          <ActiveTreatmentCard dashboard={dashboardView} phpFullFormatter={PHP_FULL} />
        </div>

        {/* Right Col: Action Center & System Status */}
        <div className="space-y-6">
          <div className="card bg-brand-surface-soft shadow-none">
            <h2 className="text-lg font-bold text-brand-text mb-4">Action Center</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 bg-brand-surface p-3 rounded-xl border border-brand-border shadow-sm">
                <div className="mt-1 w-2 h-2 rounded-full bg-brand-warning shrink-0"></div>
                <div>
                  <p className="text-sm font-semibold text-brand-text">Submit 4 draft HMO claims</p>
                  <p className="text-xs font-medium text-brand-muted mt-0.5">Assigned to: Receptionist</p>
                </div>
              </li>
              <li className="flex items-start gap-3 bg-brand-surface p-3 rounded-xl border border-brand-border shadow-sm">
                <div className="mt-1 w-2 h-2 rounded-full bg-brand-danger shrink-0"></div>
                <div>
                  <p className="text-sm font-semibold text-brand-text">Reorder 2 critical inventory items</p>
                  <p className="text-xs font-medium text-brand-muted mt-0.5">Lidocaine & Face Masks</p>
                </div>
              </li>
              <li className="flex items-start gap-3 bg-brand-surface p-3 rounded-xl border border-brand-border shadow-sm">
                <div className="mt-1 w-2 h-2 rounded-full bg-brand-info shrink-0"></div>
                <div>
                  <p className="text-sm font-semibold text-brand-text">Review 1 failed SMS dispatch</p>
                  <p className="text-xs font-medium text-brand-muted mt-0.5">Patient: John Doe</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="card">
            <h2 className="text-lg font-bold text-brand-text mb-4">Sync Status</h2>
            <div className="flex items-center justify-between py-2 border-b border-brand-border">
              <span className="text-sm font-medium text-brand-muted">PhilHealth PECWS</span>
              <span className="badge badge-success">Synced</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-brand-muted">TV Display Queue</span>
              <span className="badge badge-success">Live</span>
            </div>
          </div>
        </div>
        
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {canSeeFinance && (
          <div className="card flex flex-col">
             <h2 className="text-lg font-bold text-brand-text mb-4">Cashflow Snapshot</h2>
             <div className="flex-1 min-h-[16rem] bg-brand-surface-soft rounded-xl flex items-center justify-center border border-dashed border-brand-border">
                <p className="text-brand-muted font-medium text-sm">Financial charts will appear here</p>
             </div>
          </div>
        )}
        
        {canSeeManagementCards && (
          <Suspense fallback={<SectionFallback />}>
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
        )}
      </div>

    </div>
  );
}
