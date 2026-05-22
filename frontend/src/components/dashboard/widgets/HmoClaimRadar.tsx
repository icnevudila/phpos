import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import type { DashboardResponse } from "../../../services/reports";

interface HmoClaimRadarProps {
  dashboard: DashboardResponse;
  claimRadarCounts: any;
  claimRadarForecastTotals: any;
  claimRadarTeamLoad: any;
  claimRadarRecommendedOwner: any;
  criticalClosureKpi: any;
  criticalProviderHotspots: any;
  assignNowCount: number;
  assignNowByRole: any;
  role: string;
  copyClaimRadarSnapshot: () => void;
  onAssignNowClick: (ownerKey: "ADMIN" | "DENTIST" | "RECEPTIONIST") => void;
  resetAssignNowCounters: () => void;
}

export function HmoClaimRadar({
  dashboard,
  claimRadarCounts,
  claimRadarForecastTotals,
  claimRadarTeamLoad,
  claimRadarRecommendedOwner,
  criticalClosureKpi,
  criticalProviderHotspots,
  assignNowCount,
  assignNowByRole,
  role,
  copyClaimRadarSnapshot,
  onAssignNowClick,
  resetAssignNowCounters,
}: HmoClaimRadarProps): JSX.Element {
  const { t } = useTranslation();
  const [opsExpanded, setOpsExpanded] = useState(false);

  const claimRadarRoleLabel = (() => {
    if (role === "ADMIN") return t("pages.dashboard.claimRadarRoleAdmin");
    if (role === "DENTIST") return t("pages.dashboard.claimRadarRoleDentist");
    return t("pages.dashboard.claimRadarRoleReception");
  })();

  const claimRadarCards = (() => {
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
          className: "border-teal-200 hover:bg-teal-50",
          titleClass: "text-teal-700",
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
          className: "border-teal-200 hover:bg-teal-50",
          titleClass: "text-teal-700",
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
        className: "border-teal-200 hover:bg-teal-50",
        titleClass: "text-teal-700",
      },
    ];
  })();

  return (
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
      <button
        type="button"
        onClick={() => setOpsExpanded((v) => !v)}
        className="mt-3 flex w-full items-center justify-between gap-2 rounded-lg border border-amber-200 bg-white/90 px-3 py-2 text-left text-xs font-semibold text-amber-900 hover:bg-white"
        aria-expanded={opsExpanded}
      >
        <span>
          {opsExpanded
            ? t("pages.dashboard.claimRadarHideOps")
            : t("pages.dashboard.claimRadarShowOps")}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 transition-transform ${opsExpanded ? "rotate-180" : ""}`}
        />
      </button>
      {opsExpanded ? (
      <div className="mt-2 space-y-2">
      <div className="flex flex-wrap items-center gap-1.5">
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
          criticalProviderHotspots.map((provider: any) => (
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
      </div>
      ) : null}
    </section>
  );
}
