import type { DateSelectArg, DatesSetArg, EventClickArg, EventContentArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import FullCalendar from "@fullcalendar/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { AppointmentDetailSidebar } from "../components/appointments/AppointmentDetailSidebar";
import { DentistSelect } from "../components/appointments/DentistSelect";
import { NewAppointmentModal } from "../components/appointments/NewAppointmentModal";
import { fetchAppointments, fetchDentists } from "../services/appointments";
import type { AppointmentDto, DentistRow } from "../types/appointment";
import { APPOINTMENT_STATUS_STYLES } from "../types/appointment";

type CalView = "timeGridDay" | "timeGridWeek" | "dayGridMonth";

function manilaDateKey(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const y = parts.find((p) => p.type === "year")?.value ?? "";
  const m = parts.find((p) => p.type === "month")?.value ?? "";
  const day = parts.find((p) => p.type === "day")?.value ?? "";
  return `${y}-${m}-${day}`;
}

function manilaDateKeyFromDate(d: Date): string {
  return manilaDateKey(d);
}

function humanDate(key: string): string {
  const dt = new Date(`${key}T12:00:00+08:00`);
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(dt);
}

function formatRangeLabel(from: string, to: string): string {
  if (from === to) return humanDate(from);
  const a = new Date(`${from}T12:00:00+08:00`);
  const b = new Date(`${to}T12:00:00+08:00`);
  const opts: Intl.DateTimeFormatOptions = { timeZone: "Asia/Manila", month: "short", day: "numeric" };
  const left = new Intl.DateTimeFormat("en-PH", opts).format(a);
  const right = new Intl.DateTimeFormat("en-PH", { ...opts, year: "numeric" }).format(b);
  return `${left} – ${right}`;
}

function CalendarEventContent({ arg }: { arg: EventContentArg }): JSX.Element {
  const { t } = useTranslation();
  const a = arg.event.extendedProps.appointment as AppointmentDto;
  return (
    <div className="flex flex-col gap-0.5 overflow-hidden px-1 py-0.5 text-[11px] leading-tight">
      <span className="truncate font-semibold">{arg.timeText}</span>
      <span className="truncate">{a.patient.fullName}</span>
      <span className="truncate opacity-75">
        {t("pages.appointments.eventDentist", { lastName: a.dentist.lastName })}
      </span>
    </div>
  );
}

export function AppointmentsPage(): JSX.Element {
  const { t } = useTranslation();
  const [dentists, setDentists] = useState<DentistRow[]>([]);
  const [dentistFilter, setDentistFilter] = useState("");
  const [fcView, setFcView] = useState<CalView>("timeGridDay");
  const [range, setRange] = useState<{ from: string; to: string }>(() => {
    const k = manilaDateKey(new Date());
    return { from: k, to: k };
  });
  const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AppointmentDto | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AppointmentDto | null>(null);
  const [initialSlot, setInitialSlot] = useState<{ scheduledAt?: string; dentistId?: string }>({});

  const calendarRef = useRef<FullCalendar>(null);
  const rangeLabel = useMemo(() => formatRangeLabel(range.from, range.to), [range.from, range.to]);

  useEffect(() => {
    fetchDentists()
      .then(setDentists)
      .catch((e) =>
        setError(e instanceof Error ? e.message : t("pages.appointments.loadDentistsFailed")),
      );
  }, [t]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await fetchAppointments({
        from: range.from,
        to: range.to,
        dentistId: dentistFilter || undefined,
      });
      setAppointments(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("pages.appointments.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [range.from, range.to, dentistFilter, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const onDatesSet = useCallback((arg: DatesSetArg) => {
    const start = arg.start;
    const endEx = arg.end;
    const endIncl = new Date(endEx.getTime() - 1);
    const from = manilaDateKeyFromDate(start);
    const to = manilaDateKeyFromDate(endIncl);
    setRange((prev) => (prev.from === from && prev.to === to ? prev : { from, to }));
    const v = arg.view.type;
    if (v === "timeGridDay") setFcView("timeGridDay");
    else if (v === "timeGridWeek") setFcView("timeGridWeek");
    else if (v === "dayGridMonth") setFcView("dayGridMonth");
  }, []);

  const events = useMemo(
    () =>
      appointments.map((a) => {
        const style = APPOINTMENT_STATUS_STYLES[a.status];
        return {
          id: a.id,
          title: a.patient.fullName,
          start: a.scheduledAt,
          end: a.endsAt,
          extendedProps: { appointment: a, styleClasses: style },
          classNames: [style.bg, style.border, style.text, "border", "!rounded-lg", "!shadow-sm"],
        };
      }),
    [appointments],
  );

  function openNew(slot?: DateSelectArg): void {
    setEditing(null);
    setInitialSlot({
      scheduledAt: slot?.start?.toISOString(),
      dentistId: dentistFilter || undefined,
    });
    setModalOpen(true);
  }

  function onEventClick(arg: EventClickArg): void {
    const apt = arg.event.extendedProps.appointment as AppointmentDto | undefined;
    if (apt) setSelected(apt);
  }

  function onSaved(saved: AppointmentDto): void {
    setModalOpen(false);
    setEditing(null);
    setAppointments((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });
    setSelected(saved);
    void load();
  }

  function onStatusChanged(updated: AppointmentDto): void {
    setAppointments((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setSelected(updated);
  }

  function onDeleted(id: string): void {
    setAppointments((prev) => prev.filter((p) => p.id !== id));
    setSelected(null);
  }

  const counts = useMemo(() => {
    const c = { total: appointments.length, confirmed: 0, completed: 0, pending: 0 };
    for (const a of appointments) {
      if (a.status === "CONFIRMED") c.confirmed += 1;
      if (a.status === "COMPLETED") c.completed += 1;
      if (a.status === "PENDING") c.pending += 1;
    }
    return c;
  }, [appointments]);

  const queueItems = useMemo(
    () =>
      appointments
        .filter((a) => a.status === "CHECKED_IN" || a.status === "IN_PROGRESS")
        .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)),
    [appointments],
  );

  function goPrev(): void {
    calendarRef.current?.getApi().prev();
  }
  function goNext(): void {
    calendarRef.current?.getApi().next();
  }
  function goToday(): void {
    calendarRef.current?.getApi().today();
  }

  function changeView(v: CalView): void {
    setFcView(v);
    calendarRef.current?.getApi().changeView(v);
  }

  const calendarHeight =
    fcView === "dayGridMonth" ? "auto" : ("100%" as const);
  const calendarAspect = fcView === "dayGridMonth" ? 1.45 : undefined;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">Schedule Desk</p>
          <h1 className="text-xl font-semibold text-slate-900">{t("pages.appointments.title")}</h1>
          <p className="text-xs text-slate-500">{t("pages.appointments.subtitle")}</p>
        </div>
        <button
          type="button"
          onClick={() => openNew()}
          className="inline-flex min-h-11 items-center gap-2 self-start rounded-lg bg-gradient-to-br from-emerald-500 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
            <path d="M12 5v14m-7-7h14" strokeLinecap="round" />
          </svg>
          {t("pages.appointments.new")}
        </button>
      </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white px-2 py-2 shadow-sm sm:px-3">
        <div className="flex flex-wrap gap-1">
          {(
            [
              ["timeGridDay", t("pages.appointments.viewDay")] as const,
              ["timeGridWeek", t("pages.appointments.viewWeek")] as const,
              ["dayGridMonth", t("pages.appointments.viewMonth")] as const,
            ] as const
          ).map(([v, label]) => (
            <button
              key={v}
              type="button"
              onClick={() => changeView(v)}
              className={`min-h-11 rounded-lg px-3 py-2 text-xs font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 sm:text-sm dark:focus-visible:ring-offset-slate-950 ${
                fcView === v
                  ? "bg-emerald-600 text-white shadow"
                  : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 gap-y-2 rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm sm:gap-3 sm:px-4">
        <div className="flex w-full flex-wrap items-center gap-1 sm:w-auto sm:flex-nowrap">
          <button
            type="button"
            onClick={() => goPrev()}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition duration-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 active:scale-[0.98] dark:focus-visible:ring-offset-slate-950"
            aria-label={t("pages.appointments.ariaPrevPeriod")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
              <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => goToday()}
            className="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition duration-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 active:scale-[0.98] dark:focus-visible:ring-offset-slate-950"
          >
            {t("pages.appointments.today")}
          </button>
          <button
            type="button"
            onClick={() => goNext()}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition duration-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 active:scale-[0.98] dark:focus-visible:ring-offset-slate-950"
            aria-label={t("pages.appointments.ariaNextPeriod")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
              <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <input
            type="date"
            value={range.from}
            onChange={(e) => {
              const v = e.target.value;
              if (v) calendarRef.current?.getApi().gotoDate(`${v}T12:00:00+08:00`);
            }}
            className="min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 sm:ml-2 sm:w-auto dark:focus-visible:ring-offset-slate-950"
          />
        </div>

        <span className="w-full text-center text-xs font-semibold leading-snug text-slate-900 sm:w-auto sm:min-w-[12rem] sm:flex-1 sm:text-left sm:text-sm">
          {rangeLabel}
        </span>

        <div className="hidden flex-1 lg:block" />

        <div className="w-full sm:w-auto">
          <DentistSelect
            dentists={dentists}
            value={dentistFilter}
            onChange={setDentistFilter}
            includeAll
          />
        </div>

        <div className="flex w-full flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-slate-600 sm:w-auto sm:justify-end sm:text-xs">
          <span>
            <strong className="text-slate-900">{counts.total}</strong> {t("pages.appointments.countsTotalLabel")}
          </span>
          <span>
            <strong className="text-sky-700">{counts.confirmed}</strong>{" "}
            {t("pages.appointments.countsConfirmedLabel")}
          </span>
          <span>
            <strong className="text-amber-700">{counts.pending}</strong>{" "}
            {t("pages.appointments.countsPendingLabel")}
          </span>
          <span>
            <strong className="text-emerald-700">{counts.completed}</strong>{" "}
            {t("pages.appointments.countsDoneLabel")}
          </span>
        </div>
      </div>

      {queueItems.length > 0 ? (
        <div className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-white px-3 py-3 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-800">
            {t("pages.appointments.queueStripTitle")}
          </p>
          <p className="text-[11px] text-indigo-700/80">{t("pages.appointments.queueStripHint")}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {queueItems.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setSelected(a)}
                className="inline-flex min-h-10 max-w-full items-center gap-2 rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-left text-xs font-semibold text-indigo-950 shadow-sm hover:bg-indigo-50"
              >
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] uppercase ${
                    a.status === "IN_PROGRESS" ? "bg-fuchsia-100 text-fuchsia-900" : "bg-sky-100 text-sky-900"
                  }`}
                >
                  {a.status === "IN_PROGRESS"
                    ? t("pages.appointments.queueBadgeChair")
                    : t("pages.appointments.queueBadgeDesk")}
                </span>
                <span className="truncate">
                  {new Date(a.scheduledAt).toLocaleTimeString("en-PH", {
                    timeZone: "Asia/Manila",
                    hour: "numeric",
                    minute: "2-digit",
                  })}{" "}
                  · {a.patient.fullName}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {fcView === "dayGridMonth" ? (
        <p className="text-xs text-slate-500">{t("pages.appointments.monthSelectHint")}</p>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="border-b border-slate-100 bg-slate-50 px-3 py-2 text-center text-xs font-medium text-slate-500">
            {t("pages.appointments.loading")}
          </div>
        ) : null}
        <div
          className={`px-2 py-2 ${
            fcView === "dayGridMonth" ? "min-h-[480px]" : "h-[52vh] min-h-[380px] sm:h-[calc(100vh-280px)] sm:min-h-[500px]"
          }`}
        >
          <FullCalendar
            ref={calendarRef}
            plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
            initialView="timeGridDay"
            initialDate={`${range.from}T12:00:00+08:00`}
            timeZone="Asia/Manila"
            headerToolbar={false}
            firstDay={1}
            allDaySlot={false}
            slotMinTime="07:00:00"
            slotMaxTime="19:00:00"
            slotDuration="00:15:00"
            slotLabelInterval="01:00"
            businessHours={{
              daysOfWeek: [1, 2, 3, 4, 5, 6],
              startTime: "08:00",
              endTime: "18:00",
            }}
            height={calendarHeight}
            aspectRatio={calendarAspect}
            selectable={fcView === "timeGridDay" || fcView === "timeGridWeek"}
            selectMirror
            nowIndicator
            dayMaxEventRows={3}
            events={events}
            datesSet={onDatesSet}
            eventClick={onEventClick}
            select={(arg) => openNew(arg)}
            eventContent={(arg) => <CalendarEventContent arg={arg} />}
          />
        </div>
      </div>

      {selected ? (
        <AppointmentDetailSidebar
          appointment={selected}
          onClose={() => setSelected(null)}
          onChanged={onStatusChanged}
          onEdit={(a) => {
            setEditing(a);
            setModalOpen(true);
          }}
          onDeleted={onDeleted}
        />
      ) : null}

      <NewAppointmentModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSaved={onSaved}
        dentists={dentists}
        initial={initialSlot}
        editing={editing}
      />
    </div>
  );
}
