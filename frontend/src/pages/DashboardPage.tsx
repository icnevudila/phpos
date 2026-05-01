import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  fetchDashboard,
  fetchMonthlyReport,
  openMonthlyReportPdf,
  type DashboardResponse,
  type DashboardTodayAppointment,
  type MonthlyReport,
} from "../services/reports";
import { fetchHmoClaims, type HmoClaim } from "../services/hmo";
import { getUser } from "../hooks/authTokens";
import { patchAppointmentStatus, sendAppointmentQueueAlert } from "../services/appointments";

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

function DashboardChartEmpty({ message }: { message: string }): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-10 text-center" role="status">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
          <path d="M3 3v18h18" className="stroke-current stroke-[1.75]" strokeLinecap="round" />
          <path
            d="M7 14l4-4 4 4 5-6"
            className="stroke-current stroke-[1.75]"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="max-w-sm text-sm text-slate-600 dark:text-slate-400">{message}</p>
    </div>
  );
}

const STATUS_STYLES: Record<DashboardTodayAppointment["status"], string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-teal-100 text-teal-900",
  CHECKED_IN: "bg-emerald-100 text-emerald-900",
  IN_PROGRESS: "bg-teal-200 text-teal-950",
  COMPLETED: "bg-emerald-200 text-emerald-900",
  CANCELLED: "bg-rose-100 text-rose-700",
  NO_SHOW: "bg-slate-200 text-slate-700",
};

const DASH_FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus-visible:ring-offset-slate-950";

const METHOD_COLORS: Record<string, string> = {
  cash: "#10b981",
  gcash: "#14b8a6",
  maya: "#0d9488",
  creditCard: "#f59e0b",
  cheque: "#64748b",
  philhealth: "#ef4444",
};

function fmtDay(key: string): string {
  const d = new Date(`${key}T00:00:00+08:00`);
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    day: "2-digit",
    month: "short",
  }).format(d);
}

function differentiatorIcon(key: string): JSX.Element {
  const pathByKey: Record<string, string> = {
    chairflow: "M7 4h10v3H7zM5 9h14v10H5zM8 12h3M13 12h3M8 15h8",
    phpay: "M4 8h16M6 5h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm2 10h4",
    hmocc: "M4 6h16M4 12h16M4 18h16M7 6v12",
    livechair: "M8 5h8M7 8h10v5H7zM6 13h12v4H6zM8 17v2m8-2v2",
    philhealth: "M12 3 4 7v5c0 5 3.5 7.5 8 9 4.5-1.5 8-4 8-9V7l-8-4Zm0 6v6m-3-3h6",
    touchux: "M9 4v8m0 0a2 2 0 1 0 4 0V7a2 2 0 1 1 4 0v5a6 6 0 1 1-12 0V9a2 2 0 1 1 4 0v3Z",
    xrayflow: "M8 4h8M7 7h10v10H7zM10 10l4 4m0-4-4 4",
    opsrecovery: "M5 12h14M12 5v14M7 7l10 10",
  };
  const d = pathByKey[key] ?? pathByKey.chairflow;
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
        <path d={d} className="stroke-current stroke-[1.8]" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function claimAgeDays(createdAt: string): number {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / (24 * 60 * 60 * 1000));
}

function MetricCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent: "emerald" | "teal" | "amber" | "slate";
}): JSX.Element {
  const palettes: Record<typeof accent, { bg: string; ring: string; text: string }> = {
    emerald: { bg: "from-emerald-500 to-teal-500", ring: "ring-emerald-100", text: "text-emerald-700" },
    teal: { bg: "from-teal-500 to-emerald-500", ring: "ring-teal-100", text: "text-teal-700" },
    amber: { bg: "from-amber-500 to-orange-500", ring: "ring-amber-100", text: "text-amber-700" },
    slate: { bg: "from-slate-600 to-emerald-700", ring: "ring-emerald-100", text: "text-emerald-800" },
  };
  const p = palettes[accent];
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ring-1 dark:bg-slate-900 dark:ring-slate-700 ${p.ring}`}
    >
      <div
        className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${p.bg} opacity-20`}
      />
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{value}</p>
      {sub ? <p className={`mt-1 text-xs font-semibold ${p.text}`}>{sub}</p> : null}
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
  right,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}): JSX.Element {
  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">{title}</h3>
          {subtitle ? <p className="text-xs text-slate-500">{subtitle}</p> : null}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

function ViewportLazy({
  children,
  minHeight = 280,
}: {
  children: React.ReactNode;
  minHeight?: number;
}): JSX.Element {
  const [isVisible, setIsVisible] = useState(false);
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isVisible || !hostRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "220px 0px" },
    );
    observer.observe(hostRef.current);
    return () => observer.disconnect();
  }, [isVisible]);

  return (
    <div ref={hostRef}>
      {isVisible ? (
        children
      ) : (
        <div
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          style={{ minHeight }}
          role="status"
          aria-live="polite"
        >
          <div className="animate-pulse space-y-3">
            <div className="h-3 w-40 rounded bg-slate-200" />
            <div className="h-2 w-56 rounded bg-slate-100" />
            <div className="mt-5 h-44 rounded-xl bg-slate-100" />
          </div>
        </div>
      )}
    </div>
  );
}

export function DashboardPage(): JSX.Element {
  const { t } = useTranslation();
  const role = getUser()?.role ?? "RECEPTIONIST";
  const canSeeFinance = role === "ADMIN";
  const canSeeManagementCards = role === "ADMIN" || role === "DENTIST";
  const canOpenInventory =
    getUser()?.role === "ADMIN" || getUser()?.role === "DENTIST";
  const claimRadarRoleLabel = useMemo(() => {
    if (role === "ADMIN") return t("pages.dashboard.claimRadarRoleAdmin");
    if (role === "DENTIST") return t("pages.dashboard.claimRadarRoleDentist");
    return t("pages.dashboard.claimRadarRoleReception");
  }, [role, t]);
  const claimRadarCards = useMemo(() => {
    if (role === "ADMIN") {
      return [
        {
          key: "critical",
          to: "/hmo-claims?status=SUBMITTED&aging=CRITICAL&ctx=CRITICAL_FOLLOWUP",
          title: t("pages.dashboard.claimRadarCritical"),
          hint: t("pages.dashboard.claimRadarCriticalHint"),
          className: "border-rose-200 hover:bg-rose-50",
          titleClass: "text-rose-700",
        },
        {
          key: "submission",
          to: "/hmo-claims?status=DRAFT&ctx=SUBMISSION_QUEUE",
          title: t("pages.dashboard.claimRadarSubmission"),
          hint: t("pages.dashboard.claimRadarSubmissionHint"),
          className: "border-amber-200 hover:bg-amber-50",
          titleClass: "text-amber-800",
        },
        {
          key: "cashflow",
          to: "/hmo-claims?status=APPROVED&ctx=CASHFLOW_COLLECT",
          title: t("pages.dashboard.claimRadarCashflow"),
          hint: t("pages.dashboard.claimRadarCashflowHint"),
          className: "border-emerald-200 hover:bg-emerald-50",
          titleClass: "text-emerald-700",
        },
      ];
    }
    if (role === "DENTIST") {
      return [
        {
          key: "critical",
          to: "/hmo-claims?status=SUBMITTED&aging=CRITICAL&ctx=CRITICAL_FOLLOWUP",
          title: t("pages.dashboard.claimRadarCritical"),
          hint: t("pages.dashboard.claimRadarCriticalHint"),
          className: "border-rose-200 hover:bg-rose-50",
          titleClass: "text-rose-700",
        },
        {
          key: "warning",
          to: "/hmo-claims?status=SUBMITTED&aging=WARNING&ctx=FOLLOWUP_DUE",
          title: t("pages.dashboard.claimRadarWarning"),
          hint: t("pages.dashboard.claimRadarWarningHint"),
          className: "border-sky-200 hover:bg-sky-50",
          titleClass: "text-sky-700",
        },
        {
          key: "resubmit",
          to: "/hmo-claims?status=REJECTED&ctx=RESUBMIT_QUEUE",
          title: t("pages.dashboard.claimRadarResubmit"),
          hint: t("pages.dashboard.claimRadarResubmitHint"),
          className: "border-violet-200 hover:bg-violet-50",
          titleClass: "text-violet-700",
        },
      ];
    }
    return [
      {
        key: "submission",
        to: "/hmo-claims?status=DRAFT&ctx=SUBMISSION_QUEUE",
        title: t("pages.dashboard.claimRadarSubmission"),
        hint: t("pages.dashboard.claimRadarSubmissionHint"),
        className: "border-amber-200 hover:bg-amber-50",
        titleClass: "text-amber-800",
      },
      {
        key: "critical",
        to: "/hmo-claims?status=SUBMITTED&aging=CRITICAL&ctx=CRITICAL_FOLLOWUP",
        title: t("pages.dashboard.claimRadarCritical"),
        hint: t("pages.dashboard.claimRadarCriticalHint"),
        className: "border-rose-200 hover:bg-rose-50",
        titleClass: "text-rose-700",
      },
      {
        key: "cashflow",
        to: "/hmo-claims?status=APPROVED&ctx=CASHFLOW_COLLECT",
        title: t("pages.dashboard.claimRadarCashflow"),
        hint: t("pages.dashboard.claimRadarCashflowHint"),
        className: "border-emerald-200 hover:bg-emerald-50",
        titleClass: "text-emerald-700",
      },
    ];
  }, [role, t]);
  const runbookLaunches = useMemo(() => {
    if (role === "ADMIN") {
      return [
        {
          to: "/hmo-claims?status=SUBMITTED&aging=CRITICAL&ctx=RUNBOOK_ADMIN",
          label: t("pages.dashboard.runbookOpenAdmin"),
          tone: "border-rose-300 text-rose-800 hover:bg-rose-100",
        },
        {
          to: "/hmo-claims?status=APPROVED&ctx=RUNBOOK_CASHFLOW",
          label: t("pages.dashboard.runbookOpenCashflow"),
          tone: "border-emerald-300 text-emerald-800 hover:bg-emerald-100",
        },
      ];
    }
    if (role === "DENTIST") {
      return [
        {
          to: "/hmo-claims?status=SUBMITTED&aging=WARNING&ctx=RUNBOOK_DENTIST",
          label: t("pages.dashboard.runbookOpenDentist"),
          tone: "border-sky-300 text-sky-800 hover:bg-sky-100",
        },
        {
          to: "/hmo-claims?status=REJECTED&ctx=RUNBOOK_RESUBMIT",
          label: t("pages.dashboard.runbookOpenResubmit"),
          tone: "border-violet-300 text-violet-800 hover:bg-violet-100",
        },
      ];
    }
    return [
      {
        to: "/hmo-claims?status=DRAFT&ctx=RUNBOOK_RECEPTION",
        label: t("pages.dashboard.runbookOpen"),
        tone: "border-indigo-300 text-indigo-900 hover:bg-indigo-100",
      },
    ];
  }, [role, t]);

  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [monthly, setMonthly] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [queueBusyId, setQueueBusyId] = useState<string | null>(null);
  const [claimPressureBaseline, setClaimPressureBaseline] = useState<number | null>(null);
  const [hmoClaimsSnapshot, setHmoClaimsSnapshot] = useState<HmoClaim[]>([]);
  const [criticalProviderBaseline, setCriticalProviderBaseline] = useState<Record<string, number>>({});
  const [assignNowCount, setAssignNowCount] = useState(0);
  const [assignNowByRole, setAssignNowByRole] = useState({ admin: 0, dentist: 0, reception: 0 });
  const [claimRadarCounts, setClaimRadarCounts] = useState({
    critical: 0,
    warning: 0,
    submission: 0,
    cashflow: 0,
    resubmit: 0,
  });

  const [year, setYear] = useState(() => new Date().getUTCFullYear());
  const [month, setMonth] = useState(() => new Date().getUTCMonth() + 1);

  async function loadPageData(): Promise<void> {
    const [d, m, claims] = await Promise.all([
      fetchDashboard(),
      fetchMonthlyReport(year, month),
      fetchHmoClaims({ limit: 200 }),
    ]);
    setDashboard(d);
    setMonthly(m);
    setHmoClaimsSnapshot(claims);
    setClaimRadarCounts(buildClaimRadarCounts(claims));
  }

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    loadPageData()
      .catch((e) => {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : t("pages.dashboard.loadFailed"));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, t]);

  async function refreshDashboardOnly(): Promise<void> {
    try {
      const [d, claims] = await Promise.all([fetchDashboard(), fetchHmoClaims({ limit: 200 })]);
      setDashboard(d);
      setHmoClaimsSnapshot(claims);
      setClaimRadarCounts(buildClaimRadarCounts(claims));
    } catch {
      // ignore silent refresh errors
    }
  }

  function buildClaimRadarCounts(claims: HmoClaim[]): {
    critical: number;
    warning: number;
    submission: number;
    cashflow: number;
    resubmit: number;
  } {
    let critical = 0;
    let warning = 0;
    let submission = 0;
    let cashflow = 0;
    let resubmit = 0;
    for (const claim of claims) {
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
  }

  async function changeQueueStatus(
    row: DashboardTodayAppointment,
    next: "CHECKED_IN" | "IN_PROGRESS" | "COMPLETED" | "NO_SHOW",
  ): Promise<void> {
    setQueueBusyId(row.id);
    try {
      await patchAppointmentStatus(row.id, next);
      await refreshDashboardOnly();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.dashboard.queueStatusFailed"));
    } finally {
      setQueueBusyId(null);
    }
  }

  async function sendAlert(row: DashboardTodayAppointment): Promise<void> {
    setQueueBusyId(row.id);
    try {
      await sendAppointmentQueueAlert(row.id);
      await refreshDashboardOnly();
      toast.success(t("pages.dashboard.queueAlertSent"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.dashboard.queueAlertFailed"));
    } finally {
      setQueueBusyId(null);
    }
  }
  async function copyClaimRadarSnapshot(): Promise<void> {
    const lines = [
      `DentEase Claim Radar (${claimRadarRoleLabel})`,
      `Pending: ${pendingHmoClaims}`,
      `Critical: ${claimRadarForecastTotals.critical}`,
      `Today risk: ${claimRadarForecastTotals.todayRisk}`,
      `Tomorrow risk: ${claimRadarForecastTotals.tomorrowRisk}`,
      `Critical closure: ${criticalClosureKpi.done}/${criticalClosureKpi.total} (${criticalClosureKpi.pct}%)`,
    ];
    const hotspotLine =
      criticalProviderHotspots.length > 0
        ? `Top providers: ${criticalProviderHotspots
            .map((provider) => `${provider.name} (${provider.critical})`)
            .join(", ")}`
        : "Top providers: none";
    const text = [...lines, hotspotLine].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("pages.dashboard.claimRadarSnapshotCopied"));
    } catch {
      toast.error(t("pages.dashboard.claimRadarSnapshotCopyFailed"));
    }
  }
  function onAssignNowClick(ownerKey: "ADMIN" | "DENTIST" | "RECEPTIONIST"): void {
    setAssignNowCount((prev) => {
      const next = prev + 1;
      try {
        window.sessionStorage.setItem("claim-radar-assign-now-count", String(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
    setAssignNowByRole((prev) => {
      const next = {
        admin: prev.admin + (ownerKey === "ADMIN" ? 1 : 0),
        dentist: prev.dentist + (ownerKey === "DENTIST" ? 1 : 0),
        reception: prev.reception + (ownerKey === "RECEPTIONIST" ? 1 : 0),
      };
      try {
        window.sessionStorage.setItem("claim-radar-assign-now-by-role", JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }
  function resetAssignNowCounters(): void {
    setAssignNowCount(0);
    setAssignNowByRole({ admin: 0, dentist: 0, reception: 0 });
    try {
      window.sessionStorage.setItem("claim-radar-assign-now-count", "0");
      window.sessionStorage.setItem(
        "claim-radar-assign-now-by-role",
        JSON.stringify({ admin: 0, dentist: 0, reception: 0 }),
      );
    } catch {
      // ignore storage errors
    }
  }

  const revenueSeries = useMemo(
    () =>
      (dashboard?.revenueByDay ?? []).map((r) => ({
        date: r.date,
        label: fmtDay(r.date),
        amount: Number(r.amount),
      })),
    [dashboard],
  );

  const revenueHasData = useMemo(
    () => revenueSeries.length > 0 && revenueSeries.some((r) => r.amount > 0),
    [revenueSeries],
  );

  const paymentPie = useMemo(() => {
    if (!monthly) return [];
    const pm = monthly.paymentMethods;
    const keys = [
      "cash",
      "gcash",
      "maya",
      "creditCard",
      "cheque",
      "philhealth",
    ] as const;
    return keys
      .map((key) => ({
        key,
        name: t(`pages.dashboard.paymentMethods.${key}`),
        value: Number(pm[key]),
      }))
      .filter((a) => a.value > 0);
  }, [monthly, t]);

  const topProc = useMemo(
    () =>
      (dashboard?.topProcedures ?? []).map((p) => ({
        ...p,
        revenueNum: Number(p.revenue),
      })),
    [dashboard],
  );

  const statusRows = useMemo(() => {
    if (!dashboard) return [];
    const s = dashboard.appointmentsByStatus;
    return [
      { key: "pending", label: t("pages.dashboard.statusPending"), value: s.pending, color: "bg-amber-400" },
      { key: "confirmed", label: t("pages.dashboard.statusConfirmed"), value: s.confirmed, color: "bg-teal-500" },
      { key: "checkedIn", label: t("pages.dashboard.statusCheckedIn"), value: s.checkedIn, color: "bg-emerald-500" },
      { key: "inProgress", label: t("pages.dashboard.statusInProgress"), value: s.inProgress, color: "bg-teal-700" },
      { key: "completed", label: t("pages.dashboard.statusCompleted"), value: s.completed, color: "bg-emerald-600" },
      { key: "cancelled", label: t("pages.dashboard.statusCancelled"), value: s.cancelled, color: "bg-rose-500" },
      { key: "noShow", label: t("pages.dashboard.statusNoShow"), value: s.noShow, color: "bg-slate-500" },
    ];
  }, [dashboard, t]);

  const statusTotal = statusRows.reduce((s, r) => s + r.value, 0);
  const currentlyInClinic = useMemo(
    () =>
      (dashboard?.queue.rows ?? []).filter(
        (r) => r.status === "CHECKED_IN" || r.status === "IN_PROGRESS",
      ),
    [dashboard?.queue.rows],
  );
  const nextAppointments = useMemo(
    () =>
      (dashboard?.today.upcoming ?? []).filter(
        (r) => r.status === "PENDING" || r.status === "CONFIRMED",
      ),
    [dashboard?.today.upcoming],
  );
  const overdueAppointments = useMemo(
    () =>
      nextAppointments.filter((r) => r.waitingMinutes > 0),
    [nextAppointments],
  );
  const dentistRadarRows = useMemo(() => {
    const byDentist = new Map<
      string,
      { name: string; inChair: number; completed: number; overdue: number; queue: number }
    >();
    for (const row of dashboard?.queue.rows ?? []) {
      const name = row.dentistName || t("pages.common.unknown");
      const current = byDentist.get(name) ?? { name, inChair: 0, completed: 0, overdue: 0, queue: 0 };
      if (row.status === "CHECKED_IN" || row.status === "IN_PROGRESS") current.inChair += 1;
      if (row.status === "COMPLETED") current.completed += 1;
      if ((row.status === "PENDING" || row.status === "CONFIRMED") && row.waitingMinutes > 0) current.overdue += 1;
      if (row.status === "PENDING" || row.status === "CONFIRMED") current.queue += 1;
      byDentist.set(name, current);
    }
    return [...byDentist.values()]
      .sort((a, b) => {
        if (b.overdue !== a.overdue) return b.overdue - a.overdue;
        if (b.inChair !== a.inChair) return b.inChair - a.inChair;
        if (b.completed !== a.completed) return b.completed - a.completed;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 6);
  }, [dashboard?.queue.rows, t]);
  const criticalClaimsByProvider = useMemo(() => {
    const byProvider = new Map<string, { id: string; name: string; critical: number }>();
    for (const claim of hmoClaimsSnapshot) {
      if (claim.status !== "SUBMITTED") continue;
      if (claimAgeDays(claim.createdAt) < 8) continue;
      const current = byProvider.get(claim.provider.id) ?? {
        id: claim.provider.id,
        name: claim.provider.name,
        critical: 0,
      };
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
    let todayRisk = 0;
    let tomorrowRisk = 0;
    for (const row of providerBreachForecast.values()) {
      todayRisk += row.todayRisk;
      tomorrowRisk += row.tomorrowRisk;
    }
    return {
      critical: claimRadarCounts.critical,
      todayRisk,
      tomorrowRisk,
    };
  }, [providerBreachForecast, claimRadarCounts.critical]);
  const claimRadarTeamLoad = useMemo(() => {
    return {
      admin: claimRadarCounts.critical + claimRadarCounts.cashflow,
      dentist: claimRadarCounts.warning + claimRadarCounts.resubmit,
      reception: claimRadarCounts.submission + claimRadarForecastTotals.todayRisk,
    };
  }, [claimRadarCounts, claimRadarForecastTotals.todayRisk]);
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
      reason:
        recommended.key === "ADMIN"
          ? t("pages.dashboard.claimRadarOwnerReasonAdmin")
          : recommended.key === "DENTIST"
            ? t("pages.dashboard.claimRadarOwnerReasonDentist")
            : t("pages.dashboard.claimRadarOwnerReasonReception"),
    };
  }, [claimRadarTeamLoad, t]);
  const criticalClosureKpi = useMemo(() => {
    const baselineTotal = Object.values(criticalProviderBaseline).reduce((acc, n) => acc + n, 0);
    if (baselineTotal <= 0) {
      return {
        done: 0,
        total: 0,
        pct: 0,
      };
    }
    const reduced = Math.max(0, baselineTotal - claimRadarCounts.critical);
    const pct = Math.max(0, Math.min(100, Math.round((reduced / baselineTotal) * 100)));
    return {
      done: reduced,
      total: baselineTotal,
      pct,
    };
  }, [criticalProviderBaseline, claimRadarCounts.critical]);
  const criticalProviderHotspots = useMemo(() => {
    return criticalClaimsByProvider
      .map((provider) => {
        const baseline = criticalProviderBaseline[provider.id] ?? provider.critical;
        const delta = provider.critical - baseline;
        const trendKey =
          delta > 0 ? "pages.dashboard.claimRadarHotspotTrendUp" : delta < 0 ? "pages.dashboard.claimRadarHotspotTrendDown" : "pages.dashboard.claimRadarHotspotTrendFlat";
        const trendTone =
          delta > 0
            ? "bg-rose-100 text-rose-800"
            : delta < 0
              ? "bg-emerald-100 text-emerald-800"
              : "bg-slate-100 text-slate-700";
        return {
          ...provider,
          delta,
          trendLabel: t(trendKey),
          trendTone,
          deltaLabel: t("pages.dashboard.claimRadarHotspotDelta", { delta }),
          action: (() => {
            const forecast = providerBreachForecast.get(provider.id);
            if (provider.critical >= 4) {
              return {
                key: "ESCALATE",
                label: t("pages.dashboard.claimRadarHotspotActionEscalate"),
                tone: "bg-rose-200 text-rose-950",
              };
            }
            if ((forecast?.todayRisk ?? 0) > 0) {
              return {
                key: "CALL",
                label: t("pages.dashboard.claimRadarHotspotActionCall"),
                tone: "bg-amber-200 text-amber-950",
              };
            }
            return {
              key: "ASSIGN",
              label: t("pages.dashboard.claimRadarHotspotActionAssign"),
              tone: "bg-indigo-100 text-indigo-900",
            };
          })(),
          forecast: (() => {
            const forecast = providerBreachForecast.get(provider.id);
            if (!forecast) return null;
            if (forecast.todayRisk > 0) {
              return {
                label: t("pages.dashboard.claimRadarHotspotForecastToday", { count: forecast.todayRisk }),
                tone: "bg-amber-100 text-amber-900",
              };
            }
            if (forecast.tomorrowRisk > 0) {
              return {
                label: t("pages.dashboard.claimRadarHotspotForecastTomorrow", { count: forecast.tomorrowRisk }),
                tone: "bg-sky-100 text-sky-900",
              };
            }
            return null;
          })(),
        };
      })
      .sort((a, b) => b.critical - a.critical)
      .slice(0, 3);
  }, [criticalClaimsByProvider, criticalProviderBaseline, providerBreachForecast, t]);
  const pendingHmoClaims = dashboard?.operational.pendingHmoClaims ?? 0;
  const claimPressureTrend = useMemo(() => {
    if (claimPressureBaseline === null) {
      return {
        label: t("pages.dashboard.escalationHotTrendFlat"),
        deltaLabel: t("pages.dashboard.escalationHotDelta", { delta: 0 }),
        tone: "bg-slate-100 text-slate-700",
      };
    }
    const delta = pendingHmoClaims - claimPressureBaseline;
    if (delta > 0) {
      return {
        label: t("pages.dashboard.escalationHotTrendUp"),
        deltaLabel: t("pages.dashboard.escalationHotDelta", { delta }),
        tone: "bg-rose-100 text-rose-800",
      };
    }
    if (delta < 0) {
      return {
        label: t("pages.dashboard.escalationHotTrendDown"),
        deltaLabel: t("pages.dashboard.escalationHotDelta", { delta }),
        tone: "bg-emerald-100 text-emerald-800",
      };
    }
    return {
      label: t("pages.dashboard.escalationHotTrendFlat"),
      deltaLabel: t("pages.dashboard.escalationHotDelta", { delta: 0 }),
      tone: "bg-slate-100 text-slate-700",
    };
  }, [claimPressureBaseline, pendingHmoClaims, t]);
  const differentiatorFeatures = useMemo(() => {
    const base = [
      {
        key: "chairflow",
        title: t("pages.dashboard.diffCard1Title"),
        desc: t("pages.dashboard.diffCard1Desc"),
        impact: t("pages.dashboard.diffCard1Impact"),
        to: "/appointments",
      },
      {
        key: "phpay",
        title: t("pages.dashboard.diffCard2Title"),
        desc: t("pages.dashboard.diffCard2Desc"),
        impact: t("pages.dashboard.diffCard2Impact"),
        to: "/invoices",
      },
      {
        key: "hmocc",
        title: t("pages.dashboard.diffCard3Title"),
        desc: t("pages.dashboard.diffCard3Desc"),
        impact: t("pages.dashboard.diffCard3Impact"),
        to: "/hmo-claims",
      },
      {
        key: "livechair",
        title: t("pages.dashboard.diffCard4Title"),
        desc: t("pages.dashboard.diffCard4Desc"),
        impact: t("pages.dashboard.diffCard4Impact"),
        to: "/dashboard",
      },
      {
        key: "philhealth",
        title: t("pages.dashboard.diffCard5Title"),
        desc: t("pages.dashboard.diffCard5Desc"),
        impact: t("pages.dashboard.diffCard5Impact"),
        to: "/patients",
      },
      {
        key: "touchux",
        title: t("pages.dashboard.diffCard6Title"),
        desc: t("pages.dashboard.diffCard6Desc"),
        impact: t("pages.dashboard.diffCard6Impact"),
        to: "/appointments",
      },
      {
        key: "xrayflow",
        title: t("pages.dashboard.diffCard7Title"),
        desc: t("pages.dashboard.diffCard7Desc"),
        impact: t("pages.dashboard.diffCard7Impact"),
        to: "/patients",
      },
      {
        key: "opsrecovery",
        title: t("pages.dashboard.diffCard8Title"),
        desc: t("pages.dashboard.diffCard8Desc"),
        impact: t("pages.dashboard.diffCard8Impact"),
        to: "/dashboard",
      },
    ];

    const priorityByRole: Record<string, Record<string, number>> = {
      ADMIN: {
        hmocc: 1,
        phpay: 2,
        xrayflow: 3,
        livechair: 4,
        philhealth: 5,
        opsrecovery: 6,
        chairflow: 7,
        touchux: 8,
      },
      DENTIST: {
        chairflow: 1,
        livechair: 2,
        xrayflow: 3,
        philhealth: 4,
        hmocc: 5,
        touchux: 6,
        opsrecovery: 7,
        phpay: 8,
      },
      RECEPTIONIST: {
        touchux: 1,
        livechair: 2,
        phpay: 3,
        opsrecovery: 4,
        hmocc: 5,
        philhealth: 6,
        chairflow: 7,
        xrayflow: 8,
      },
    };

    const priority = priorityByRole[role] ?? priorityByRole.RECEPTIONIST;
    return [...base].sort((a, b) => (priority[a.key] ?? 99) - (priority[b.key] ?? 99));
  }, [role, t]);

  useEffect(() => {
    if (!dashboard) return;
    const key = "hmo-claim-pressure-baseline";
    const current = dashboard.operational.pendingHmoClaims;
    try {
      const raw = window.sessionStorage.getItem(key);
      const previous = raw === null ? Number.NaN : Number(raw);
      if (Number.isFinite(previous)) {
        setClaimPressureBaseline(previous);
      } else {
        setClaimPressureBaseline(current);
      }
      window.sessionStorage.setItem(key, String(current));
    } catch {
      setClaimPressureBaseline(current);
    }
  }, [dashboard]);
  useEffect(() => {
    const key = "hmo-critical-provider-baseline";
    try {
      const raw = window.sessionStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, number>;
        setCriticalProviderBaseline(parsed);
      } else {
        const firstBaseline = Object.fromEntries(
          criticalClaimsByProvider.map((provider) => [provider.id, provider.critical]),
        );
        setCriticalProviderBaseline(firstBaseline);
      }
      const nextBaseline = Object.fromEntries(
        criticalClaimsByProvider.map((provider) => [provider.id, provider.critical]),
      );
      window.sessionStorage.setItem(key, JSON.stringify(nextBaseline));
    } catch {
      const fallbackBaseline = Object.fromEntries(
        criticalClaimsByProvider.map((provider) => [provider.id, provider.critical]),
      );
      setCriticalProviderBaseline(fallbackBaseline);
    }
  }, [criticalClaimsByProvider]);
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem("claim-radar-assign-now-count");
      const n = raw === null ? Number.NaN : Number(raw);
      if (Number.isFinite(n) && n >= 0) setAssignNowCount(Math.floor(n));
    } catch {
      // ignore storage errors
    }
  }, []);
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem("claim-radar-assign-now-by-role");
      if (!raw) return;
      const parsed = JSON.parse(raw) as { admin?: number; dentist?: number; reception?: number };
      setAssignNowByRole({
        admin: Number.isFinite(parsed.admin) ? Math.max(0, Math.floor(parsed.admin as number)) : 0,
        dentist: Number.isFinite(parsed.dentist) ? Math.max(0, Math.floor(parsed.dentist as number)) : 0,
        reception: Number.isFinite(parsed.reception) ? Math.max(0, Math.floor(parsed.reception as number)) : 0,
      });
    } catch {
      // ignore storage errors
    }
  }, []);
  const diffQuickLinks = useMemo(() => {
    const linksByRole: Record<string, Array<{ label: string; to: string }>> = {
      ADMIN: [
        { label: t("pages.dashboard.diffQuickAdmin1"), to: "/hmo-claims" },
        { label: t("pages.dashboard.diffQuickAdmin2"), to: "/invoices" },
        { label: t("pages.dashboard.diffQuickAdmin3"), to: "/reports/aged-receivables" },
      ],
      DENTIST: [
        { label: t("pages.dashboard.diffQuickDentist1"), to: "/appointments" },
        { label: t("pages.dashboard.diffQuickDentist2"), to: "/patients" },
        { label: t("pages.dashboard.diffQuickDentist3"), to: "/dashboard" },
      ],
      RECEPTIONIST: [
        { label: t("pages.dashboard.diffQuickReception1"), to: "/appointments" },
        { label: t("pages.dashboard.diffQuickReception2"), to: "/invoices" },
        { label: t("pages.dashboard.diffQuickReception3"), to: "/hmo-claims" },
      ],
    };
    return linksByRole[role] ?? linksByRole.RECEPTIONIST;
  }, [role, t]);

  if (loading && !dashboard) {
    return (
      <div className="p-10 text-center text-slate-500">{t("pages.dashboard.loading")}</div>
    );
  }
  if (error || !dashboard || !monthly) {
    return (
      <div className="p-10 text-center">
        <p className="text-red-700">{error ?? t("pages.dashboard.failedLoad")}</p>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">Control Center</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("pages.dashboard.title")}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t("pages.dashboard.subtitleManila")}{" "}
            {new Intl.DateTimeFormat("en-PH", { dateStyle: "long" }).format(new Date())}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <Link
            to="/reports/aged-receivables"
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700 shadow-sm hover:-translate-y-0.5 hover:bg-slate-50"
          >
            {t("pages.dashboard.linkAr")}
          </Link>
          <Link
            to="/settings"
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700 shadow-sm hover:-translate-y-0.5 hover:bg-slate-50"
          >
            {t("pages.dashboard.linkSettings")}
          </Link>
        </div>
      </div>
      </div>

      <section className="rounded-2xl border border-sky-200/80 bg-gradient-to-br from-white to-sky-50/60 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700">{t("pages.dashboard.diffEyebrow")}</p>
            <h2 className="text-base font-bold text-slate-900">{t("pages.dashboard.diffTitle")}</h2>
          </div>
          <span className="inline-flex items-center rounded-full border border-sky-200 bg-white px-2.5 py-1 text-[11px] font-bold text-sky-700">
            {t("pages.dashboard.diffBadge")}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {t("pages.dashboard.diffQuickLabel")}
          </span>
          {diffQuickLinks.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-sky-200 bg-white px-2.5 py-1 text-xs font-semibold text-sky-800 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-sky-50 hover:shadow-md"
            >
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-sky-100 text-[10px] text-sky-700">•</span>
              {item.label}
              <span aria-hidden>↗</span>
            </Link>
          ))}
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {differentiatorFeatures.map((item) => (
            <article key={item.title} className="rounded-xl border border-slate-200 bg-white/90 p-3 shadow-sm">
              <div className="mb-1">{differentiatorIcon(item.key)}</div>
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="mt-1 text-xs text-slate-600">{item.desc}</p>
              <span className="mt-2 inline-flex min-h-8 items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                {item.impact}
              </span>
              <Link
                to={item.to}
                className="mt-2 inline-flex min-h-9 items-center rounded border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-800 hover:bg-sky-100"
              >
                {t("pages.dashboard.diffOpen")}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <div>
        <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              {t("pages.dashboard.opsBoardTitle")}
            </h2>
            <p className="text-xs text-slate-500">{t("pages.dashboard.opsBoardHint")}</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {t("pages.dashboard.opsQueueNow")}
              </p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{dashboard.waitlist.total}</p>
              <p className="mt-1 text-xs text-slate-500">{t("pages.dashboard.opsQueueSub")}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {t("pages.dashboard.opsInClinic")}
              </p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{currentlyInClinic.length}</p>
              <p className="mt-1 text-xs text-slate-500">{t("pages.dashboard.opsInClinicSub")}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {t("pages.dashboard.opsUpcoming")}
              </p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{nextAppointments.length}</p>
              <p className="mt-1 text-xs text-slate-500">{t("pages.dashboard.opsUpcomingSub")}</p>
            </div>
            <div className="rounded-xl border border-rose-200 bg-gradient-to-br from-rose-50 to-white p-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
                {t("pages.dashboard.opsOverdue")}
              </p>
              <p className="mt-2 text-2xl font-extrabold text-rose-800">{overdueAppointments.length}</p>
              <p className="mt-1 text-xs text-rose-700">{t("pages.dashboard.opsOverdueSub")}</p>
            </div>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                {t("pages.dashboard.opsQueueNow")}
              </p>
              {dashboard.waitlist.rows.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">{t("pages.dashboard.opsEmpty")}</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {dashboard.waitlist.rows.slice(0, 5).map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-2 text-sm">
                      <div className="min-w-0">
                        <span className="block truncate font-medium text-slate-800">{r.patientName}</span>
                        {r.note ? <span className="block truncate text-[11px] text-slate-500">{r.note}</span> : null}
                      </div>
                      <span className="shrink-0 text-xs font-semibold text-slate-600">
                        {t("pages.dashboard.waitingMin", { count: r.waitingMinutes })}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                {t("pages.dashboard.opsInClinic")}
              </p>
              {currentlyInClinic.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">{t("pages.dashboard.opsEmpty")}</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {currentlyInClinic.slice(0, 5).map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-2 text-sm">
                      <div className="min-w-0">
                        <span className="block truncate font-medium text-slate-800">{r.patientName}</span>
                        {r.chairNo ? (
                          <span className="block text-[11px] text-slate-500">{r.chairNo}</span>
                        ) : null}
                      </div>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLES[r.status]}`}>
                        {t(`pages.dashboard.queueStatus.${r.status}` as const)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                {t("pages.dashboard.opsUpcoming")}
              </p>
              {nextAppointments.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">{t("pages.dashboard.opsEmpty")}</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {nextAppointments.slice(0, 5).map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-2 text-sm">
                      <div className="min-w-0">
                        <span className="block truncate font-medium text-slate-800">{r.patientName}</span>
                        {r.chairNo ? (
                          <span className="block text-[11px] text-slate-500">{r.chairNo}</span>
                        ) : null}
                      </div>
                      <span className="shrink-0 font-mono text-xs text-slate-600">{r.time}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-rose-700">
                {t("pages.dashboard.opsOverdueActions")}
              </p>
              {overdueAppointments.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">{t("pages.dashboard.opsEmpty")}</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {overdueAppointments.slice(0, 5).map((r) => (
                    <li key={r.id} className="rounded-lg border border-rose-200 bg-white p-2 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-800">{r.patientName}</p>
                          <p className="text-[11px] text-slate-500">
                            {r.time} · {t("pages.dashboard.waitingMin", { count: r.waitingMinutes })}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                          {t("pages.dashboard.opsOverdue")}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <a
                          href={`tel:${r.patientPhone}`}
                          className="rounded border border-slate-300 px-2 py-0.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          {t("pages.dashboard.actionCall")}
                        </a>
                        <button
                          type="button"
                          onClick={() => void sendAlert(r)}
                          disabled={queueBusyId === r.id}
                          className="rounded border border-teal-300 px-2 py-0.5 text-[11px] font-semibold text-teal-800 hover:bg-teal-50 disabled:opacity-60"
                        >
                          {t("pages.dashboard.actionSendAlert")}
                        </button>
                        <button
                          type="button"
                          onClick={() => void changeQueueStatus(r, "CHECKED_IN")}
                          disabled={queueBusyId === r.id}
                          className="rounded border border-emerald-300 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-50 disabled:opacity-60"
                        >
                          {t("pages.dashboard.actionCheckIn")}
                        </button>
                        <button
                          type="button"
                          onClick={() => void changeQueueStatus(r, "NO_SHOW")}
                          disabled={queueBusyId === r.id}
                          className="rounded border border-rose-300 px-2 py-0.5 text-[11px] font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                        >
                          {t("pages.dashboard.actionNoShow")}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        {/* Metric cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link to="/appointments" className="block rounded-2xl ring-offset-2 focus:outline-none focus:ring-2 focus:ring-teal-400">
            <MetricCard
              label={t("pages.dashboard.metricTodayAppts")}
              value={dashboard.today.appointments}
              sub={t("pages.dashboard.metricTodayQueue", { count: dashboard.queue.total })}
              accent="teal"
            />
          </Link>
          {canSeeManagementCards ? (
            <>
              <MetricCard
                label={t("pages.dashboard.metricNewPatients")}
                value={dashboard.thisMonth.newPatients}
                sub={t("pages.dashboard.metricMonthlyAppts", {
                  count: dashboard.thisMonth.appointments,
                })}
                accent="emerald"
              />
              <Link
                to="/hmo-claims"
                className="block rounded-2xl ring-offset-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <MetricCard
                  label={t("pages.dashboard.metricHmo")}
                  value={dashboard.operational.pendingHmoClaims}
                  sub={t("pages.dashboard.metricHmoSubWithClaims")}
                  accent="amber"
                />
              </Link>
              {canOpenInventory ? (
                <Link
                  to="/inventory"
                  className="block rounded-2xl ring-offset-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <MetricCard
                    label={t("pages.dashboard.metricInventory")}
                    value={dashboard.operational.inventoryAlerts}
                    sub={t("pages.dashboard.metricInventorySubWithOpen")}
                    accent="slate"
                  />
                </Link>
              ) : (
                <MetricCard
                  label={t("pages.dashboard.metricInventory")}
                  value={dashboard.operational.inventoryAlerts}
                  sub={t("pages.dashboard.metricInventorySub")}
                  accent="slate"
                />
              )}
            </>
          ) : (
            <MetricCard
              label={t("pages.dashboard.metricInventory")}
              value={dashboard.operational.inventoryAlerts}
              sub={t("pages.dashboard.metricInventorySub")}
              accent="slate"
            />
          )}
        </div>
        {canSeeManagementCards ? (
          <section className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
                  {t("pages.dashboard.claimRadarEyebrow")}
                </p>
                <h3 className="text-sm font-bold text-amber-900">{t("pages.dashboard.claimRadarTitle")}</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={copyClaimRadarSnapshot}
                  className="inline-flex min-h-8 items-center rounded-full border border-amber-300 bg-white px-2 py-0.5 text-[10px] font-semibold text-amber-900 hover:bg-amber-100"
                >
                  {t("pages.dashboard.claimRadarCopySnapshot")}
                </button>
                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-amber-900 ring-1 ring-amber-200">
                  {claimRadarRoleLabel}
                </span>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                  {t("pages.dashboard.claimRadarPending", { count: dashboard.operational.pendingHmoClaims })}
                </span>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {claimRadarCards.map((card) => (
                <Link key={card.to} to={card.to} className={`rounded-lg border bg-white p-3 transition ${card.className}`}>
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-[11px] font-semibold uppercase tracking-wide ${card.titleClass}`}>{card.title}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                      {t("pages.dashboard.claimRadarCount", {
                        count: claimRadarCounts[card.key as keyof typeof claimRadarCounts],
                      })}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{card.hint}</p>
                </Link>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                {t("pages.dashboard.claimRadarOpsTarget")}
              </span>
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-900">
                {t("pages.dashboard.claimRadarOpsCritical", { count: claimRadarForecastTotals.critical })}
              </span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                {t("pages.dashboard.claimRadarOpsToday", { count: claimRadarForecastTotals.todayRisk })}
              </span>
              <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-900">
                {t("pages.dashboard.claimRadarOpsTomorrow", { count: claimRadarForecastTotals.tomorrowRisk })}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                {t("pages.dashboard.claimRadarTeamLoadLabel")}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-800">
                {t("pages.dashboard.claimRadarTeamLoadAdmin", { count: claimRadarTeamLoad.admin })}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-800">
                {t("pages.dashboard.claimRadarTeamLoadDentist", { count: claimRadarTeamLoad.dentist })}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-800">
                {t("pages.dashboard.claimRadarTeamLoadReception", { count: claimRadarTeamLoad.reception })}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                {t("pages.dashboard.claimRadarOwnerLabel")}
              </span>
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-900">
                {t("pages.dashboard.claimRadarOwnerValue", {
                  role: claimRadarRecommendedOwner.label,
                  count: claimRadarRecommendedOwner.load,
                })}
              </span>
              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700 ring-1 ring-amber-200">
                {claimRadarRecommendedOwner.reason}
              </span>
              <Link
                onClick={() =>
                  onAssignNowClick(
                    claimRadarRecommendedOwner.key as "ADMIN" | "DENTIST" | "RECEPTIONIST",
                  )
                }
                to={
                  claimRadarRecommendedOwner.key === "ADMIN"
                    ? "/hmo-claims?status=SUBMITTED&aging=CRITICAL&ctx=RUNBOOK_ADMIN"
                    : claimRadarRecommendedOwner.key === "DENTIST"
                      ? "/hmo-claims?status=SUBMITTED&aging=WARNING&ctx=RUNBOOK_DENTIST"
                      : "/hmo-claims?status=DRAFT&ctx=RUNBOOK_RECEPTION"
                }
                className="inline-flex min-h-7 items-center rounded-full border border-indigo-300 bg-white px-2 py-0.5 text-[10px] font-semibold text-indigo-900 hover:bg-indigo-50"
              >
                {t("pages.dashboard.claimRadarOwnerAssignNow")}
              </Link>
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-800 ring-1 ring-indigo-200">
                {t("pages.dashboard.claimRadarOwnerAssignedToday", { count: assignNowCount })}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-800">
                {t("pages.dashboard.claimRadarOwnerAssignedAdmin", { count: assignNowByRole.admin })}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-800">
                {t("pages.dashboard.claimRadarOwnerAssignedDentist", { count: assignNowByRole.dentist })}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-800">
                {t("pages.dashboard.claimRadarOwnerAssignedReception", { count: assignNowByRole.reception })}
              </span>
              <button
                type="button"
                onClick={resetAssignNowCounters}
                className="inline-flex min-h-7 items-center rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-800 hover:bg-slate-50"
              >
                {t("pages.dashboard.claimRadarOwnerResetToday")}
              </button>
            </div>
            <div className="mt-2 rounded-lg border border-amber-200 bg-white/80 p-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-900">
                  {t("pages.dashboard.claimRadarClosureLabel")}
                </span>
                <span className="text-[10px] font-bold text-amber-900">
                  {t("pages.dashboard.claimRadarClosureValue", {
                    done: criticalClosureKpi.done,
                    total: criticalClosureKpi.total,
                    pct: criticalClosureKpi.pct,
                  })}
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-amber-100">
                <div
                  className="h-full rounded-full bg-amber-500 transition-[width] duration-300"
                  style={{ width: `${criticalClosureKpi.pct}%` }}
                />
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                {t("pages.dashboard.claimRadarHotspotLabel")}
              </span>
              {criticalProviderHotspots.length === 0 ? (
                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-amber-200">
                  {t("pages.dashboard.claimRadarHotspotEmpty")}
                </span>
              ) : (
                criticalProviderHotspots.map((provider) => (
                  <Link
                    key={provider.id}
                    to={`/hmo-claims?providerId=${provider.id}${
                      provider.action.key === "ESCALATE"
                        ? "&status=SUBMITTED&aging=CRITICAL&ctx=CRITICAL_FOLLOWUP"
                        : provider.action.key === "CALL"
                          ? "&status=SUBMITTED&aging=WARNING&ctx=FOLLOWUP_DUE"
                          : `&status=SUBMITTED&aging=ALL&ctx=${
                              role === "ADMIN"
                                ? "RUNBOOK_ADMIN"
                                : role === "DENTIST"
                                  ? "RUNBOOK_DENTIST"
                                  : "RUNBOOK_RECEPTION"
                            }`
                    }`}
                    className="inline-flex min-h-7 items-center gap-1 rounded-full border border-rose-300 bg-white px-2 py-0.5 text-[10px] font-semibold text-rose-800 hover:bg-rose-50"
                  >
                    <span>{provider.name}</span>
                    <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-900">
                      {provider.critical}
                    </span>
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${provider.trendTone}`}>
                      {provider.trendLabel}
                    </span>
                    <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-700">
                      {provider.deltaLabel}
                    </span>
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${provider.action.tone}`}>
                      {provider.action.label}
                    </span>
                    {provider.forecast ? (
                      <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${provider.forecast.tone}`}>
                        {provider.forecast.label}
                      </span>
                    ) : null}
                  </Link>
                ))
              )}
            </div>
          </section>
        ) : null}
        {canSeeManagementCards ? (
          <section className="mt-4 rounded-2xl border border-teal-200 bg-teal-50/50 p-4 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-teal-700">
                {t("pages.dashboard.dentistRadarEyebrow")}
              </p>
              <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-semibold text-teal-800">
                {t("pages.dashboard.dentistRadarCount", { count: dentistRadarRows.length })}
              </span>
            </div>
            <h3 className="text-sm font-bold text-teal-900">{t("pages.dashboard.dentistRadarTitle")}</h3>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {dentistRadarRows.length === 0 ? (
                <p className="text-xs text-slate-600">{t("pages.dashboard.dentistRadarEmpty")}</p>
              ) : null}
              {dentistRadarRows.map((row) => (
                <Link
                  key={row.name}
                  to="/appointments"
                  className="rounded-lg border border-teal-200 bg-white p-3 transition hover:bg-teal-50"
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {t("pages.common.drPrefix")} {row.name}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-semibold text-teal-800">
                      {t("pages.dashboard.dentistRadarInChair", { count: row.inChair })}
                    </span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                      {t("pages.dashboard.dentistRadarCompleted", { count: row.completed })}
                    </span>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                      {t("pages.dashboard.dentistRadarQueue", { count: row.queue })}
                    </span>
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-800">
                      {t("pages.dashboard.dentistRadarOverdue", { count: row.overdue })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
        {canSeeManagementCards ? (
          <section className="mt-4 rounded-2xl border border-orange-200 bg-orange-50/60 p-4 shadow-sm">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-orange-800">
                {t("pages.dashboard.escalationHotEyebrow")}
              </p>
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-900">
                {t("pages.dashboard.escalationHotPending", { count: pendingHmoClaims })}
              </span>
            </div>
            <h3 className="text-sm font-bold text-orange-900">{t("pages.dashboard.escalationHotTitle")}</h3>
            <p className="mt-1 text-xs text-slate-700">{t("pages.dashboard.escalationHotHint")}</p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span
                className={`inline-flex min-h-7 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${claimPressureTrend.tone}`}
              >
                {claimPressureTrend.label}
              </span>
              <span className="inline-flex min-h-7 items-center rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700 ring-1 ring-orange-200">
                {claimPressureTrend.deltaLabel}
              </span>
            </div>
            <div className="mt-2">
              <Link
                to="/hmo-claims?status=SUBMITTED&aging=WARNING&ctx=HOTLIST"
                className="inline-flex min-h-9 items-center rounded-full border border-orange-300 bg-white px-3 py-1 text-xs font-semibold text-orange-900 hover:bg-orange-100"
              >
                {t("pages.dashboard.escalationHotOpen")}
              </Link>
            </div>
          </section>
        ) : null}
        {canSeeManagementCards ? (
          <section className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 shadow-sm">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-800">
                {t("pages.dashboard.runbookEyebrow")}
              </p>
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-900">
                {t("pages.dashboard.runbookPending", { count: dashboard.operational.pendingHmoClaims })}
              </span>
            </div>
            <h3 className="text-sm font-bold text-indigo-900">{t("pages.dashboard.runbookTitle")}</h3>
            <p className="mt-1 text-xs text-slate-700">{t("pages.dashboard.runbookHint")}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {runbookLaunches.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`inline-flex min-h-9 items-center rounded-full border bg-white px-3 py-1 text-xs font-semibold ${item.tone}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {canSeeFinance ? (
          <>
        {/* Month switcher */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t("pages.dashboard.monthlyReportPeriod")}
            </p>
            <p className="text-sm font-semibold text-slate-800">
              {new Intl.DateTimeFormat("en-PH", {
                month: "long",
                year: "numeric",
              }).format(new Date(`${year}-${String(month).padStart(2, "0")}-15`))}
            </p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm sm:w-auto ${DASH_FOCUS}`}
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Intl.DateTimeFormat("en-PH", { month: "long" }).format(new Date(2024, i, 1))}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={2024}
              max={2100}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm sm:w-24 ${DASH_FOCUS}`}
            />
            <button
              type="button"
              onClick={() =>
                openMonthlyReportPdf(year, month).catch(() =>
                  toast.error(t("pages.dashboard.pdfOpenFailed"), { id: "dashboard-pdf-open" }),
                )
              }
              className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto ${DASH_FOCUS}`}
            >
              {t("pages.dashboard.monthlyPdf")}
            </button>
          </div>
        </div>

        {/* Charts row 1: revenue trend + payment pie */}
        <ViewportLazy minHeight={360}>
        <div className="mt-6 grid gap-5 lg:grid-cols-[2fr_1fr]">
          <ChartCard
            title={t("pages.dashboard.chartRevenueTitle")}
            subtitle={t("pages.dashboard.chartRevenueSubtitle", {
              amount: PHP_FULL.format(revenueSeries.reduce((s, r) => s + r.amount, 0)),
            })}
          >
            {!revenueHasData ? (
              <DashboardChartEmpty message={t("pages.dashboard.chartRevenueEmpty")} />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueSeries} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="label" fontSize={11} stroke="#94a3b8" />
                    <YAxis
                      fontSize={11}
                      stroke="#94a3b8"
                      tickFormatter={(v: number) => PHP.format(v)}
                      width={80}
                    />
                    <Tooltip
                      formatter={(value) => PHP_FULL.format(Number(value))}
                      labelFormatter={(l) => t("pages.dashboard.tooltipDay", { label: String(l) })}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={false}
                      fill="url(#revGrad)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartCard>

          <ChartCard
            title={t("pages.dashboard.chartPaymentTitle")}
            subtitle={t("pages.dashboard.chartPaymentSubtitle", {
              amount: PHP_FULL.format(Number(monthly.totalRevenue)),
            })}
          >
            {paymentPie.length === 0 ? (
              <DashboardChartEmpty message={t("pages.dashboard.noPaymentsYet")} />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentPie}
                      dataKey="value"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={3}
                      stroke="#ffffff"
                    >
                      {paymentPie.map((entry) => (
                        <Cell
                          key={entry.key}
                          fill={METHOD_COLORS[entry.key] ?? "#94a3b8"}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => PHP_FULL.format(Number(value))} />
                    <Legend
                      iconType="circle"
                      formatter={(v: string) => (
                        <span className="text-xs text-slate-700">{v}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartCard>
        </div>
        </ViewportLazy>

        {/* Row 2: top procedures + status */}
        <ViewportLazy minHeight={360}>
        <div className="mt-6 grid gap-5 lg:grid-cols-[2fr_1fr]">
          <ChartCard
            title={t("pages.dashboard.chartTopProcTitle")}
            subtitle={t("pages.dashboard.chartTopProcSubtitle")}
          >
            {topProc.length === 0 ? (
              <DashboardChartEmpty message={t("pages.dashboard.noTreatmentsYet")} />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topProc}
                    layout="vertical"
                    margin={{ top: 5, right: 20, bottom: 5, left: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      type="number"
                      fontSize={11}
                      stroke="#94a3b8"
                      tickFormatter={(v: number) => PHP.format(v)}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      fontSize={11}
                      stroke="#94a3b8"
                      width={110}
                    />
                    <Tooltip
                      formatter={(value, _name, ctx) => {
                        const payload = (ctx as { payload?: { count?: number } } | undefined)
                          ?.payload;
                        const count = payload?.count ?? 0;
                        return t("pages.dashboard.tooltipRevenueQty", {
                          amount: PHP_FULL.format(Number(value)),
                          count,
                        });
                      }}
                    />
                    <Bar dataKey="revenueNum" fill="#14b8a6" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartCard>

          <ChartCard
            title={t("pages.dashboard.chartApptStatusTitle")}
            subtitle={t("pages.dashboard.chartApptStatusSubtitle", { count: statusTotal })}
          >
            {statusTotal === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                {t("pages.dashboard.chartApptStatusEmpty")}
              </p>
            ) : (
              <div className="space-y-2">
                {statusRows.map((r) => (
                  <div key={r.key}>
                    <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                      <span>{r.label}</span>
                      <span>{r.value}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className={`h-full ${r.color}`}
                        style={{
                          width: `${statusTotal ? (r.value / statusTotal) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ChartCard>
        </div>
        </ViewportLazy>
          </>
        ) : null}

        {/* Operations row: queue + active treatment panel */}
        <div className="mt-6 grid gap-5 lg:grid-cols-[2fr_1fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                  {t("pages.dashboard.queueTitle")}
                </h3>
                <p className="text-xs text-slate-500">
                  {t("pages.dashboard.queueSubtitle", {
                    waiting: dashboard.queue.waiting,
                    checkedIn: dashboard.queue.checkedIn,
                    inProgress: dashboard.queue.inProgress,
                  })}
                </p>
              </div>
              <Link to="/appointments" className="text-xs font-bold text-emerald-700 hover:underline">
                {t("pages.dashboard.openCalendar")}
              </Link>
            </div>
            {dashboard.queue.rows.length === 0 ? (
              <DashboardChartEmpty message={t("pages.dashboard.queueEmpty")} />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[760px] w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-2 py-2">{t("pages.dashboard.colPatient")}</th>
                    <th className="px-2 py-2">{t("pages.dashboard.colTime")}</th>
                    <th className="px-2 py-2">{t("pages.dashboard.colStatus")}</th>
                    <th className="px-2 py-2">{t("pages.dashboard.colChair")}</th>
                    <th className="px-2 py-2">{t("pages.dashboard.colWaiting")}</th>
                    <th className="px-2 py-2">{t("pages.dashboard.colActions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.queue.rows.slice(0, 8).map((a) => (
                    <tr key={a.id} className="border-b border-slate-100">
                      <td className="px-2 py-2">
                        <p className="font-medium text-slate-900">{a.patientName}</p>
                        <p className="text-xs text-slate-500">
                          {t("pages.common.drPrefix")} {a.dentistName}
                        </p>
                      </td>
                      <td className="px-2 py-2 font-mono text-xs font-bold text-slate-800">{a.time}</td>
                      <td className="px-2 py-2">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[a.status]}`}>
                          {t(`pages.dashboard.queueStatus.${a.status}` as const)}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-xs text-slate-600">{a.chairNo ?? t("pages.common.empty")}</td>
                      <td className="px-2 py-2 text-xs text-slate-600">
                        {t("pages.dashboard.waitingMin", { count: a.waitingMinutes })}
                      </td>
                      <td className="px-2 py-2">
                        <div className="flex flex-wrap gap-1">
                          {a.status === "PENDING" || a.status === "CONFIRMED" ? (
                            <button
                              type="button"
                              onClick={() => void changeQueueStatus(a, "CHECKED_IN")}
                              disabled={queueBusyId === a.id}
                              className="rounded border border-teal-300 px-2 py-0.5 text-[11px] font-semibold text-teal-800 hover:bg-teal-50 disabled:opacity-60"
                            >
                              {t("pages.dashboard.actionCheckIn")}
                            </button>
                          ) : null}
                          {a.status === "CHECKED_IN" ? (
                            <button
                              type="button"
                              onClick={() => void changeQueueStatus(a, "IN_PROGRESS")}
                              disabled={queueBusyId === a.id}
                              className="rounded border border-emerald-400 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-50 disabled:opacity-60"
                            >
                              {t("pages.dashboard.actionStart")}
                            </button>
                          ) : null}
                          {a.status === "IN_PROGRESS" ? (
                            <button
                              type="button"
                              onClick={() => void changeQueueStatus(a, "COMPLETED")}
                              disabled={queueBusyId === a.id}
                              className="rounded border border-emerald-300 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
                            >
                              {t("pages.dashboard.actionComplete")}
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => void sendAlert(a)}
                            disabled={queueBusyId === a.id}
                            className="rounded border border-amber-300 px-2 py-0.5 text-[11px] font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-60"
                          >
                            {t("pages.dashboard.actionSendAlert")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              {t("pages.dashboard.activeTreatmentTitle")}
            </h3>
            {dashboard.activeTreatmentPlan ? (
              <div className="mt-3 space-y-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-semibold text-slate-900">{dashboard.activeTreatmentPlan.patientName}</p>
                  <p className="text-xs text-slate-500">
                    {t("pages.common.drPrefix")} {dashboard.activeTreatmentPlan.dentistName} ·{" "}
                    {new Date(dashboard.activeTreatmentPlan.scheduledAt).toLocaleTimeString("en-PH", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t("pages.dashboard.activeTreatmentOps")}
                  </p>
                  <div className="space-y-2">
                    {dashboard.activeTreatmentPlan.operations.slice(0, 5).map((op, i) => (
                      <div key={`${op.procedure}-${i}`} className="flex items-start justify-between gap-2 text-sm">
                        <div>
                          <p className="font-medium text-slate-800">{op.procedure}</p>
                          <p className="text-xs text-slate-500">
                            {op.toothIds.length
                              ? t("pages.dashboard.toothLine", { ids: op.toothIds.join(", ") })
                              : t("pages.dashboard.treatmentGeneral")}
                          </p>
                        </div>
                        <p className="font-semibold text-slate-900">{PHP_FULL.format(Number(op.fee))}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">{t("pages.dashboard.activeTreatmentEmpty")}</p>
            )}
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                {t("pages.dashboard.opsAlertsTitle")}
              </p>
              <p className="mt-1 text-sm text-amber-900">
                {t("pages.dashboard.opsAlertsBody", {
                  hmo: dashboard.operational.pendingHmoClaims,
                  inv: dashboard.operational.inventoryAlerts,
                })}
              </p>
              <div className="mt-2 flex gap-2">
                <Link to="/hmo-claims" className="text-xs font-semibold text-amber-800 underline">
                  {t("pages.dashboard.openHmo")}
                </Link>
                <Link to="/inventory" className="text-xs font-semibold text-amber-800 underline">
                  {t("pages.dashboard.openInventory")}
                </Link>
              </div>
            </div>
          </section>
        </div>

        {/* Performance by dentist */}
        {canSeeFinance && monthly.byDentist && monthly.byDentist.length > 0 ? (
          <ViewportLazy minHeight={260}>
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">{t("pages.dashboard.perfTitle")}</h3>
              <p className="text-xs text-slate-500">{t("pages.dashboard.perfSubtitle")}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[640px] w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-3 py-2">{t("pages.dashboard.colDentist")}</th>
                    <th className="px-3 py-2 text-right">{t("pages.dashboard.colAppts")}</th>
                    <th className="px-3 py-2 text-right">{t("pages.dashboard.colCompleted")}</th>
                    <th className="px-3 py-2 text-right">{t("pages.dashboard.colRevenue")}</th>
                  </tr>
                </thead>
                <tbody>
                  {monthly.byDentist.map((d) => (
                    <tr key={d.dentistId} className="border-b border-slate-100">
                      <td className="px-3 py-2 font-medium text-slate-800">
                        {t("pages.common.drPrefix")} {d.name}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-700">{d.appointments}</td>
                      <td className="px-3 py-2 text-right text-emerald-700">{d.completed}</td>
                      <td className="px-3 py-2 text-right font-semibold text-slate-900">
                        {PHP_FULL.format(Number(d.revenue))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          </ViewportLazy>
        ) : null}

        {/* Monthly summary strip */}
        {canSeeFinance ? (
        <section className="mt-6 rounded-2xl bg-gradient-to-br from-emerald-950 to-teal-900 p-5 text-white shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-100/90">
                {t("pages.dashboard.snapshotTitle")}
              </p>
              <p className="text-lg font-bold">
                {t("pages.dashboard.snapshotLine1", {
                  revenue: PHP_FULL.format(Number(monthly.totalRevenue)),
                  appts: monthly.totalAppointments,
                })}
              </p>
              <p className="text-xs text-emerald-100/80">
                {t("pages.dashboard.snapshotLine2", {
                  newP: monthly.newPatients,
                  retP: monthly.returningPatients,
                  comp: monthly.completedAppointments,
                  canc: monthly.cancelledAppointments,
                })}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  openMonthlyReportPdf(year, month).catch(() =>
                    toast.error(t("pages.dashboard.pdfOpenFailed"), { id: "dashboard-pdf-open" }),
                  )
                }
                className="rounded-lg bg-white/10 px-4 py-2 text-sm font-bold text-white ring-1 ring-white/20 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-950"
              >
                {t("pages.dashboard.downloadPdf")}
              </button>
            </div>
          </div>
        </section>
        ) : null}
      </div>
    </div>
  );
}
