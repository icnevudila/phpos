import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import TreatmentRoadmapTimeline from "./TreatmentRoadmapTimeline";

interface AppointmentRow {
  id: string;
  scheduledAt: string;
  status: string;
  type: string | null;
  dentist?: { firstName: string; lastName: string };
}

interface TreatmentRow {
  id: string;
  procedure: string;
  quantity: number;
  unitPrice: string;
  phase: string | null;
  notes: string | null;
  createdAt: string;
  appointmentId?: string | null;
}

interface TreatmentPlanTabProps {
  appointments: AppointmentRow[];
  treatments: TreatmentRow[];
  dateLocale: string;
}

export function TreatmentPlanTab({
  appointments,
  treatments,
  dateLocale,
}: TreatmentPlanTabProps): JSX.Element {
  const { t } = useTranslation();

  const roadmapTreatments = useMemo(
    () =>
      treatments.map((tr) => ({
        id: tr.id,
        procedure: tr.procedure,
        phase: tr.phase ?? t("pages.patientDetail.treatmentPlan.generalPhase"),
        status: "planned",
        date: tr.createdAt,
        notes: tr.notes,
        color: tr.phase ? "#10b981" : "#64748b",
      })),
    [treatments, t],
  );

  const roadmapAppointments = useMemo(
    () =>
      appointments.map((a) => ({
        id: a.id,
        title: a.type ?? t("pages.patientDetail.treatmentPlan.visit"),
        status: a.status,
        date: a.scheduledAt,
        durationDays: 1,
      })),
    [appointments, t],
  );

  if (treatments.length === 0 && appointments.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
        {t("pages.patientDetail.treatmentPlan.empty")}
      </p>
    );
  }

  return (
    <div className="space-y-4 overflow-x-auto">
      <TreatmentRoadmapTimeline
        appointments={roadmapAppointments}
        treatments={roadmapTreatments}
        locale={dateLocale}
        className="min-w-[640px]"
      />
    </div>
  );
}
