import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import type { DashboardResponse } from "../../../services/reports";

interface ActiveTreatmentCardProps {
  dashboard: DashboardResponse;
  phpFullFormatter: Intl.NumberFormat;
}

export function ActiveTreatmentCard({
  dashboard,
  phpFullFormatter,
}: ActiveTreatmentCardProps): JSX.Element {
  const { t } = useTranslation();

  return (
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
                  <p className="font-semibold text-slate-900">{phpFullFormatter.format(Number(op.fee))}</p>
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
  );
}
