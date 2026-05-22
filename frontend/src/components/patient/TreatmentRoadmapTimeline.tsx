import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { useTranslation } from "react-i18next";

type Primitive = string | number | boolean | null | undefined;
type DateLike = Date | Primitive;

export interface AppointmentLike {
  id?: Primitive;
  appointmentId?: Primitive;
  treatmentId?: Primitive;
  treatment_id?: Primitive;
  treatment?: {
    id?: Primitive;
    name?: Primitive;
    title?: Primitive;
  } | null;
  name?: Primitive;
  title?: Primitive;
  label?: Primitive;
  type?: Primitive;
  status?: Primitive;
  date?: DateLike;
  scheduledAt?: DateLike;
  startDate?: DateLike;
  startsAt?: DateLike;
  time?: DateLike;
  createdAt?: DateLike;
  durationMinutes?: number | null;
  durationDays?: number | null;
  notes?: Primitive;
  color?: Primitive;
}

export interface TreatmentLike {
  id?: Primitive;
  treatmentId?: Primitive;
  treatment_id?: Primitive;
  name?: Primitive;
  title?: Primitive;
  label?: Primitive;
  type?: Primitive;
  status?: Primitive;
  state?: Primitive;
  phase?: Primitive;
  startDate?: DateLike;
  startedAt?: DateLike;
  scheduledAt?: DateLike;
  endDate?: DateLike;
  completedAt?: DateLike;
  finishedAt?: DateLike;
  createdAt?: DateLike;
  durationDays?: number | null;
  healingDays?: number | null;
  recoveryDays?: number | null;
  downtimeDays?: number | null;
  color?: Primitive;
  notes?: Primitive;
}

export interface TreatmentRoadmapTimelineProps {
  appointments: ReadonlyArray<AppointmentLike>;
  treatments: ReadonlyArray<TreatmentLike>;
  locale?: string;
  dateFormatter?: Intl.DateTimeFormat;
  className?: string;
}

interface TimelineVisit {
  id: string;
  title: string;
  status: string;
  date: Date;
  durationDays: number;
  sourceIndex: number;
}

interface TimelinePhase {
  id: string;
  title: string;
  status: string;
  colorClass: string;
  startDate: Date;
  endDate: Date;
  healingDays?: number;
  visits: TimelineVisit[];
  synthetic?: boolean;
}

interface DisplayedPhase extends TimelinePhase {
  displayStart: Date;
  displayEnd: Date;
  durationDays: number;
}

interface DragSelection {
  kind: "phase" | "visit";
  phaseId: string;
  visitId?: string;
}

const DAY_MS = 86_400_000;
const PHASE_MIN_WIDTH_PX = 240;
const DAY_WIDTH_PX = 20;
const TIMELINE_PADDING_PX = 16;

const STATUS_CLASSES: Record<string, string> = {
  planned: "border-sky-200 bg-sky-50 text-sky-900",
  scheduled: "border-sky-200 bg-sky-50 text-sky-900",
  upcoming: "border-sky-200 bg-sky-50 text-sky-900",
  active: "border-amber-200 bg-amber-50 text-amber-900",
  inprogress: "border-amber-200 bg-amber-50 text-amber-900",
  in_progress: "border-amber-200 bg-amber-50 text-amber-900",
  completed: "border-teal-200 bg-teal-50 text-teal-900",
  done: "border-teal-200 bg-teal-50 text-teal-900",
  healing: "border-teal-200 bg-teal-50 text-teal-900",
  recovering: "border-teal-200 bg-teal-50 text-teal-900",
  cancelled: "border-rose-200 bg-rose-50 text-rose-900",
  paused: "border-slate-200 bg-slate-50 text-slate-900",
};

const FALLBACK_PHASE_CLASSES = [
  "border-sky-200 bg-sky-50 text-sky-900",
  "border-teal-200 bg-teal-50 text-teal-900",
  "border-amber-200 bg-amber-50 text-amber-900",
  "border-teal-200 bg-teal-50 text-teal-900",
  "border-indigo-200 bg-indigo-50 text-indigo-900",
];

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getField(source: unknown, keys: ReadonlyArray<string>): unknown {
  if (!isObject(source)) {
    return undefined;
  }

  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return undefined;
}

function getStringField(source: unknown, keys: ReadonlyArray<string>): string | undefined {
  const value = getField(source, keys);
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return undefined;
}

function getNumberField(source: unknown, keys: ReadonlyArray<string>): number | null {
  const value = getField(source, keys);
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function createLocalNoonDate(year: number, month: number, day: number): Date {
  return new Date(year, month, day, 12, 0, 0, 0);
}

function coerceDate(value: DateLike): Date | null {
  if (value === null || value === undefined || value === "" || typeof value === "boolean") {
    return null;
  }

  const parsed = value instanceof Date ? new Date(value) : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return createLocalNoonDate(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function getDateField(source: unknown, keys: ReadonlyArray<string>): Date | null {
  return coerceDate(getField(source, keys) as DateLike);
}

function startOfToday(): Date {
  const now = new Date();
  return createLocalNoonDate(now.getFullYear(), now.getMonth(), now.getDate());
}

function addDays(date: Date, days: number): Date {
  return createLocalNoonDate(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function diffDays(later: Date, earlier: Date): number {
  return Math.round(
    (Date.UTC(later.getFullYear(), later.getMonth(), later.getDate()) -
      Date.UTC(earlier.getFullYear(), earlier.getMonth(), earlier.getDate())) /
      DAY_MS,
  );
}

function minDate(dates: ReadonlyArray<Date | null | undefined>): Date | null {
  const available = dates.filter((date): date is Date => date instanceof Date);
  if (available.length === 0) {
    return null;
  }

  return available.reduce((earliest, current) => (current.getTime() < earliest.getTime() ? current : earliest));
}

function maxDate(dates: ReadonlyArray<Date | null | undefined>): Date | null {
  const available = dates.filter((date): date is Date => date instanceof Date);
  if (available.length === 0) {
    return null;
  }

  return available.reduce((latest, current) => (current.getTime() > latest.getTime() ? current : latest));
}

function normalizeStatus(value: string | undefined): string {
  if (!value) {
    return "planned";
  }

  return value.trim().toLowerCase().replace(/\s+/g, "_");
}

function getStatusClass(status: string, index: number): string {
  return STATUS_CLASSES[status] ?? FALLBACK_PHASE_CLASSES[index % FALLBACK_PHASE_CLASSES.length];
}

function getTextLabel(value: unknown, fallback: string): string {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : fallback;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return fallback;
}

function formatDateRange(formatter: Intl.DateTimeFormat, start: Date, end: Date): string {
  const startLabel = formatter.format(start);
  const endLabel = formatter.format(end);
  return diffDays(end, start) === 0 ? startLabel : `${startLabel} – ${endLabel}`;
}

function buildRoadmapSeed(
  appointments: ReadonlyArray<AppointmentLike>,
  treatments: ReadonlyArray<TreatmentLike>,
): TimelinePhase[] {
  const collectedDates: Date[] = [];

  for (const appointment of appointments) {
    const appointmentDate = getDateField(appointment, [
      "date",
      "scheduledAt",
      "startDate",
      "startsAt",
      "time",
      "createdAt",
    ]);
    if (appointmentDate) {
      collectedDates.push(appointmentDate);
    }
  }

  for (const treatment of treatments) {
    const startDate = getDateField(treatment, ["startDate", "startedAt", "scheduledAt", "createdAt"]);
    const endDate = getDateField(treatment, ["endDate", "completedAt", "finishedAt"]);
    if (startDate) {
      collectedDates.push(startDate);
    }
    if (endDate) {
      collectedDates.push(endDate);
    }
  }

  const referenceStart = minDate(collectedDates) ?? startOfToday();

  const normalizedTreatments = treatments.map((treatment, index) => {
    const id =
      getStringField(treatment, ["id", "treatmentId", "treatment_id"]) ?? `treatment-${index + 1}`;
    const title =
      getTextLabel(getField(treatment, ["title", "name", "label", "type"]), `Treatment ${index + 1}`);
    const status = normalizeStatus(getStringField(treatment, ["status", "state", "phase"]));
    const startDate =
      getDateField(treatment, ["startDate", "startedAt", "scheduledAt", "createdAt"]) ??
      addDays(referenceStart, index * 14);
    const healingDays = getNumberField(treatment, ["healingDays", "recoveryDays", "downtimeDays"]) ?? undefined;
    const durationDays =
      getNumberField(treatment, ["durationDays"]) ??
      healingDays ??
      7;
    const endDate =
      getDateField(treatment, ["endDate", "completedAt", "finishedAt"]) ??
      addDays(startDate, Math.max(1, durationDays) - 1);

    return {
      id,
      title,
      status,
      startDate,
      endDate: endDate.getTime() < startDate.getTime() ? startDate : endDate,
      healingDays,
      colorClass: getStatusClass(status, index),
      sourceIndex: index,
      key: id.toLowerCase(),
      fallbackKey: title.toLowerCase(),
    };
  });

  const treatmentLookup = new Map<string, (typeof normalizedTreatments)[number]>();
  for (const treatment of normalizedTreatments) {
    treatmentLookup.set(treatment.key, treatment);
    treatmentLookup.set(treatment.fallbackKey, treatment);
  }

  const normalizedAppointments = appointments.map((appointment, index) => {
    const id =
      getStringField(appointment, ["id", "appointmentId"]) ?? `appointment-${index + 1}`;
    const title =
      getTextLabel(getField(appointment, ["title", "name", "label", "type"]), `Visit ${index + 1}`);
    const status = normalizeStatus(getStringField(appointment, ["status"]));
    const durationMinutes = getNumberField(appointment, ["durationMinutes"]);
    const durationDaysFromSource = getNumberField(appointment, ["durationDays"]);
    const durationDays =
      durationMinutes && durationMinutes > 0
        ? Math.max(1, Math.round(durationMinutes / (24 * 60)))
        : Math.max(1, durationDaysFromSource ?? 1);
    const date =
      getDateField(appointment, ["date", "scheduledAt", "startDate", "startsAt", "time", "createdAt"]) ??
      addDays(referenceStart, index);
    const treatmentKey =
      getStringField(appointment, ["treatmentId", "treatment_id"]) ??
      getStringField(getField(appointment, ["treatment"]), ["id", "name", "title"]) ??
      getStringField(appointment, ["treatmentName", "treatmentTitle", "procedureName"]);

    return {
      id,
      title,
      status,
      date,
      durationDays,
      sourceIndex: index,
      treatmentKey: treatmentKey?.toLowerCase() ?? null,
    };
  });

  const assignedAppointments = new Map<string, TimelineVisit[]>();
  const orphanVisits: TimelineVisit[] = [];

  for (const appointment of normalizedAppointments) {
    const match = appointment.treatmentKey ? treatmentLookup.get(appointment.treatmentKey) : undefined;
    if (!match) {
      orphanVisits.push({
        id: appointment.id,
        title: appointment.title,
        status: appointment.status,
        date: appointment.date,
        durationDays: appointment.durationDays,
        sourceIndex: appointment.sourceIndex,
      });
      continue;
    }

    const current = assignedAppointments.get(match.id) ?? [];
    current.push({
      id: appointment.id,
      title: appointment.title,
      status: appointment.status,
      date: appointment.date,
      durationDays: appointment.durationDays,
      sourceIndex: appointment.sourceIndex,
    });
    assignedAppointments.set(match.id, current);
  }

  const phases: TimelinePhase[] = normalizedTreatments.map((treatment) => {
    const visits = (assignedAppointments.get(treatment.id) ?? []).slice().sort((left, right) => {
      const dateDelta = diffDays(left.date, right.date);
      return dateDelta !== 0 ? dateDelta : left.sourceIndex - right.sourceIndex;
    });

    const visitStarts = visits.map((visit) => visit.date);
    const visitEnds = visits.map((visit) => addDays(visit.date, Math.max(1, visit.durationDays) - 1));
    const startDate = minDate([treatment.startDate, ...visitStarts]) ?? treatment.startDate;
    const endDate = maxDate([treatment.endDate, ...visitEnds]) ?? treatment.endDate;

    return {
      id: treatment.id,
      title: treatment.title,
      status: treatment.status,
      colorClass: treatment.colorClass,
      startDate,
      endDate,
      healingDays: treatment.healingDays,
      visits,
    };
  });

  if (orphanVisits.length > 0) {
    const latestKnownDate =
      maxDate([
        ...phases.map((phase) => phase.endDate),
        ...phases.flatMap((phase) => phase.visits.map((visit) => addDays(visit.date, Math.max(1, visit.durationDays) - 1))),
      ]) ?? referenceStart;
    const syntheticStart = addDays(latestKnownDate, 7);

    const sortedOrphans = orphanVisits.slice().sort((left, right) => {
      const dateDelta = diffDays(left.date, right.date);
      return dateDelta !== 0 ? dateDelta : left.sourceIndex - right.sourceIndex;
    });

    phases.push({
      id: "unassigned-visits",
      title: "Unassigned visits",
      status: "planned",
      colorClass: "border-slate-200 bg-slate-50 text-slate-900",
      startDate: minDate(sortedOrphans.map((visit) => visit.date)) ?? syntheticStart,
      endDate:
        maxDate(sortedOrphans.map((visit) => addDays(visit.date, Math.max(1, visit.durationDays) - 1))) ??
        addDays(syntheticStart, Math.max(1, sortedOrphans.length)),
      visits: sortedOrphans,
      synthetic: true,
    });
  }

  return phases.sort((left, right) => {
    const dateDelta = diffDays(left.startDate, right.startDate);
    return dateDelta !== 0 ? dateDelta : left.title.localeCompare(right.title);
  });
}

function getPhaseMetrics(phases: ReadonlyArray<DisplayedPhase>) {
  if (phases.length === 0) {
    const today = startOfToday();
    return {
      start: today,
      end: addDays(today, 7),
      totalSpanDays: 8,
      totalGapDays: 0,
      visitCount: 0,
    };
  }

  const start = minDate(phases.map((phase) => phase.displayStart)) ?? startOfToday();
  const end = maxDate(phases.map((phase) => phase.displayEnd)) ?? addDays(start, 7);

  const totalGapDays = phases.reduce((sum, phase, index) => {
    if (index === 0) {
      return sum;
    }

    const previous = phases[index - 1];
    return sum + Math.max(0, diffDays(phase.displayStart, previous.displayEnd) - 1);
  }, 0);

  const visitCount = phases.reduce((sum, phase) => sum + phase.visits.length, 0);

  return {
    start: addDays(start, -3),
    end: addDays(end, 3),
    totalSpanDays: Math.max(1, diffDays(addDays(end, 3), addDays(start, -3)) + 1),
    totalGapDays,
    visitCount,
  };
}

export default function TreatmentRoadmapTimeline({
  appointments,
  treatments,
  locale,
  dateFormatter,
  className,
}: TreatmentRoadmapTimelineProps) {
  const { t } = useTranslation();
  const TRM = "pages.patientDetail.treatmentRoadmap";
  const formatDuration = (days: number) => t(`${TRM}.days`, { count: days });
  const formatStatusLabel = (status: string) => {
    const normalized = normalizeStatus(status).replace(/-/g, "_");
    const camel = normalized
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("");
    return t(`${TRM}.status${camel}`, { defaultValue: status });
  };
  const seed = useMemo(() => buildRoadmapSeed(appointments, treatments), [appointments, treatments]);
  const [phases, setPhases] = useState<TimelinePhase[]>(seed);
  const [dragState, setDragState] = useState<DragSelection | null>(null);
  const dragStateRef = useRef<DragSelection | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setPhases(seed);
  }, [seed]);

  const formatter = useMemo(
    () => dateFormatter ?? new Intl.DateTimeFormat(locale ?? undefined, { month: "short", day: "numeric" }),
    [dateFormatter, locale],
  );

  const displayPhases = useMemo<DisplayedPhase[]>(
    () =>
      phases
        .map((phase) => {
          const visitStarts = phase.visits.map((visit) => visit.date);
          const visitEnds = phase.visits.map((visit) => addDays(visit.date, Math.max(1, visit.durationDays) - 1));
          const displayStart = minDate([phase.startDate, ...visitStarts]) ?? phase.startDate;
          const displayEnd = maxDate([phase.endDate, ...visitEnds]) ?? phase.endDate;
          return {
            ...phase,
            displayStart,
            displayEnd,
            durationDays: Math.max(1, diffDays(displayEnd, displayStart) + 1),
          };
        })
        .sort((left, right) => {
          const dateDelta = diffDays(left.displayStart, right.displayStart);
          return dateDelta !== 0 ? dateDelta : left.title.localeCompare(right.title);
        }),
    [phases],
  );

  const metrics = useMemo(() => getPhaseMetrics(displayPhases), [displayPhases]);

  const shiftPhase = (phaseId: string, deltaDays: number) => {
    if (deltaDays === 0) {
      return;
    }

    setPhases((current) =>
      current.map((phase) =>
        phase.id === phaseId
          ? {
              ...phase,
              startDate: addDays(phase.startDate, deltaDays),
              endDate: addDays(phase.endDate, deltaDays),
              visits: phase.visits.map((visit) => ({
                ...visit,
                date: addDays(visit.date, deltaDays),
              })),
            }
          : phase,
      ),
    );
  };

  const shiftVisit = (phaseId: string, visitId: string, deltaDays: number) => {
    if (deltaDays === 0) {
      return;
    }

    setPhases((current) =>
      current.map((phase) =>
        phase.id === phaseId
          ? {
              ...phase,
              visits: phase.visits.map((visit) =>
                visit.id === visitId ? { ...visit, date: addDays(visit.date, deltaDays) } : visit,
              ),
            }
          : phase,
      ),
    );
  };

  const handleDragStart = (selection: DragSelection) => (event: DragEvent<HTMLElement>) => {
    dragStateRef.current = selection;
    setDragState(selection);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", JSON.stringify(selection));
  };

  const handleDragEnd = () => {
    dragStateRef.current = null;
    setDragState(null);
  };

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();

    const selection = dragStateRef.current;
    const container = scrollRef.current;
    if (!selection || !container) {
      dragStateRef.current = null;
      setDragState(null);
      return;
    }

    const rect = container.getBoundingClientRect();
    const xPosition = event.clientX - rect.left + container.scrollLeft - TIMELINE_PADDING_PX;
    const targetDate = addDays(metrics.start, Math.max(0, Math.round(xPosition / DAY_WIDTH_PX)));

    if (selection.kind === "phase") {
      const selectedPhase = phases.find((phase) => phase.id === selection.phaseId);
      if (selectedPhase) {
        const deltaDays = diffDays(targetDate, selectedPhase.startDate);
        shiftPhase(selectedPhase.id, deltaDays);
      }
    } else {
      const selectedPhase = phases.find((phase) => phase.id === selection.phaseId);
      const selectedVisit = selectedPhase?.visits.find((visit) => visit.id === selection.visitId);
      if (selectedPhase && selectedVisit) {
        const deltaDays = diffDays(targetDate, selectedVisit.date);
        shiftVisit(selectedPhase.id, selectedVisit.id, deltaDays);
      }
    }

    dragStateRef.current = null;
    setDragState(null);
  };

  if (displayPhases.length === 0) {
    return (
      <section className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className ?? ""}`}>
        <div className="border-b border-slate-100 px-4 py-4">
          <p className="text-sm font-semibold text-slate-900">{t(`${TRM}.title`)}</p>
          <p className="mt-1 text-xs text-slate-500">
            {t(`${TRM}.emptySubtitle`)}
          </p>
        </div>
        <div className="px-4 py-8 text-sm text-slate-500">
          {t(`${TRM}.emptyBody`)}
        </div>
      </section>
    );
  }

  return (
    <section className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className ?? ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-4 py-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">{t(`${TRM}.title`)}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {t(`${TRM}.subtitle`)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium">
            {t(`${TRM}.phaseCount`, { count: displayPhases.length })}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium">
            {t(`${TRM}.visitCount`, { count: metrics.visitCount })}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium">
            {formatDuration(metrics.totalSpanDays)}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium">
            {t(`${TRM}.healingDays`, { count: metrics.totalGapDays })}
          </span>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="overflow-x-auto"
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDrop={handleDrop}
      >
        <div className="min-w-max px-4 py-4">
          <div className="mb-3 flex min-w-max items-center gap-2 text-[11px] text-slate-400">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 font-medium text-slate-500">
              {t(`${TRM}.starts`, { date: formatter.format(metrics.start) })}
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 font-medium text-slate-500">
              {t(`${TRM}.ends`, { date: formatter.format(metrics.end) })}
            </span>
            <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-1 font-medium text-sky-700">
              {t(`${TRM}.dragTestHint`)}
            </span>
          </div>

          <div className="min-w-max space-y-3">
            {displayPhases.map((phase, index) => {
              const previous = index > 0 ? displayPhases[index - 1] : null;
              const gapDays = previous ? Math.max(0, diffDays(phase.displayStart, previous.displayEnd) - 1) : 0;
              const width = Math.max(phase.durationDays * DAY_WIDTH_PX, PHASE_MIN_WIDTH_PX);
              const isPhaseDragged = dragState?.kind === "phase" && dragState.phaseId === phase.id;
              const phaseShellClass = phase.synthetic
                ? "border-slate-200 bg-slate-50"
                : phase.colorClass;

              return (
                <div key={phase.id} className="min-w-max">
                  {gapDays > 0 ? (
                    <div className="mb-3 flex items-stretch">
                      <div
                        className="flex flex-shrink-0 items-center justify-center rounded-2xl border border-dashed border-teal-200 bg-teal-50/70 px-4 text-center text-[11px] font-medium text-teal-700"
                        style={{ width: Math.max(gapDays * DAY_WIDTH_PX, 72) }}
                      >
                        <div>
                          <div className="uppercase tracking-[0.16em] text-teal-600">{t(`${TRM}.idleHealing`)}</div>
                          <div className="mt-1 text-sm font-semibold">
                            +{t(`${TRM}.days`, { count: gapDays })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div
                    className={`rounded-2xl border p-4 shadow-sm transition-all duration-150 ${phaseShellClass} ${ isPhaseDragged ? "ring-2 ring-sky-300" : "" }`}
                    style={{ width }}
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {phase.id === "unassigned-visits" ? t(`${TRM}.unassignedVisits`) : phase.title}
                        </p>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.16em] opacity-75">
                          {formatDateRange(formatter, phase.displayStart, phase.displayEnd)}
                        </p>
                      </div>

                      <button
                        type="button"
                        draggable
                        onDragStart={handleDragStart({ kind: "phase", phaseId: phase.id })}
                        onDragEnd={handleDragEnd}
                        className="flex flex-shrink-0 cursor-grab select-none items-center gap-2 rounded-full border border-current/15 px-2.5 py-1 text-[11px] font-medium active:cursor-grabbing"
                        title={t(`${TRM}.dragPhaseTitle`)}
                      >
                        <span aria-hidden="true">↔</span>
                        <span>{t(`${TRM}.dragPhase`)}</span>
                      </button>
                    </div>

                    <div className="mb-3 flex flex-wrap gap-2 text-[11px]">
                      <span
                        className={`rounded-full border px-2.5 py-1 font-medium ${ phase.synthetic ? "border-slate-200 bg-white text-slate-600" : "border-white/60 bg-white/90 text-slate-700" }`}
                      >
                        {t(`${TRM}.phaseVisits`, { count: phase.visits.length })}
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-1 font-medium ${ phase.synthetic ? "border-slate-200 bg-white text-slate-600" : "border-white/60 bg-white/90 text-slate-700" }`}
                      >
                        {formatDuration(phase.durationDays)}
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-1 font-medium ${ phase.synthetic ? "border-slate-200 bg-white text-slate-600" : "border-white/60 bg-white/90 text-slate-700" }`}
                      >
                        {phase.status}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {phase.visits.length > 0 ? (
                        phase.visits
                          .slice()
                          .sort((left, right) => {
                            const dateDelta = diffDays(left.date, right.date);
                            return dateDelta !== 0 ? dateDelta : left.sourceIndex - right.sourceIndex;
                          })
                          .map((visit) => {
                          const isVisitDragged =
                            dragState?.kind === "visit" &&
                            dragState.phaseId === phase.id &&
                            dragState.visitId === visit.id;

                          return (
                            <div
                              key={visit.id}
                              draggable
                              onDragStart={handleDragStart({
                                kind: "visit",
                                phaseId: phase.id,
                                visitId: visit.id,
                              })}
                              onDragEnd={handleDragEnd}
                              className={`inline-flex max-w-full cursor-grab items-center gap-2 rounded-full border px-3 py-1 text-[11px] shadow-sm transition ${ isVisitDragged ? "opacity-60" : "opacity-100" } ${ phase.synthetic ? "border-slate-200 bg-white text-slate-700" : "border-white/60 bg-white/90 text-slate-700" } active:cursor-grabbing`}
                              title={t(`${TRM}.dragVisitTitle`)}
                            >
                              <span className="inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-current/70" />
                              <span className="truncate font-medium">{visit.title}</span>
                              <span className="whitespace-nowrap text-slate-500">{formatter.format(visit.date)}</span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="rounded-xl border border-dashed border-current/15 bg-white/50 px-3 py-4 text-sm text-slate-600">
                          {t(`${TRM}.noLinkedVisits`)}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 rounded-xl border border-current/10 bg-white/45 px-3 py-2 text-[11px] leading-5">
                      <span className="font-medium">Roadmap window:</span>{" "}
                      {formatDateRange(formatter, phase.displayStart, phase.displayEnd)}
                      {phase.healingDays ? (
                        <>
                          <span className="mx-1 text-slate-400">·</span>
                          <span className="font-medium">Healing target:</span> {formatDuration(phase.healingDays)}
                        </>
                      ) : null}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-full border border-current/15 px-2.5 py-1 text-[11px] font-medium text-current/80 transition hover:bg-white/70"
                        onClick={() => shiftPhase(phase.id, -1)}
                      >
                        {t(`${TRM}.shiftBackDay`)}
                      </button>
                      <button
                        type="button"
                        className="rounded-full border border-current/15 px-2.5 py-1 text-[11px] font-medium text-current/80 transition hover:bg-white/70"
                        onClick={() => shiftPhase(phase.id, 1)}
                      >
                        {t(`${TRM}.shiftForwardDay`)}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}