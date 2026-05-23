import { useMemo } from "react";
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

  const roadmapTreatments = useMemo(
    () =>
      treatments.map((tr) => ({
        id: tr.id,
        procedure: tr.procedure.replace(/_/g, ' '),
        phase: tr.phase ?? "General Phase",
        status: "planned",
        date: tr.createdAt,
        notes: tr.notes,
        color: tr.phase ? "var(--color-teal-500)" : "var(--color-slate-400)",
      })),
    [treatments],
  );

  const roadmapAppointments = useMemo(
    () =>
      appointments.map((a) => ({
        id: a.id,
        title: a.type ? a.type.replace(/_/g, ' ') : "Clinical Visit",
        status: a.status,
        date: a.scheduledAt,
        durationDays: 1,
      })),
    [appointments],
  );

  if (treatments.length === 0 && appointments.length === 0) {
    return (
      <div className="card p-8 flex flex-col items-center justify-center text-center bg-brand-surface-soft border border-brand-border">
        <p className="text-sm font-bold text-brand-muted uppercase tracking-widest">No Treatment Plan Found</p>
      </div>
    );
  }

  return (
    <div className="card border border-brand-border p-6 bg-white overflow-x-auto">
      <div className="mb-6 flex items-center justify-between">
         <div>
            <h3 className="text-sm font-bold text-brand-text uppercase tracking-widest">Treatment Roadmap</h3>
            <p className="text-xs text-brand-muted mt-1">Phased clinical procedures and corresponding visits.</p>
         </div>
         <div className="flex gap-4">
            <div className="flex items-center gap-2">
               <span className="h-2 w-2 rounded-full bg-teal-500" />
               <span className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Planned Procedures</span>
            </div>
            <div className="flex items-center gap-2">
               <span className="h-2 w-2 rounded-full bg-brand-primary" />
               <span className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Scheduled Visits</span>
            </div>
         </div>
      </div>
      
      <TreatmentRoadmapTimeline
        appointments={roadmapAppointments}
        treatments={roadmapTreatments}
        locale={dateLocale}
        className="min-w-[640px]"
      />
    </div>
  );
}
