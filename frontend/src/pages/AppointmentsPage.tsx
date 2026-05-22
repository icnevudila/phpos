import type { DateSelectArg, DatesSetArg, EventClickArg, EventContentArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import FullCalendar from "@fullcalendar/react";
import { useMemo, useRef, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  LayoutGrid,
  List,
  CalendarDays,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { downloadCsv, rowsToCsv } from "../utils/downloadCsv";

import { ListEmptyState } from "../components/ListEmptyState";
import { AppointmentDetailSidebar } from "../components/appointments/AppointmentDetailSidebar";
import { DentistSelect } from "../components/appointments/DentistSelect";
import { NewAppointmentModal } from "../components/appointments/NewAppointmentModal";
import { fetchAppointments, fetchDentists } from "../services/appointments";
import type { AppointmentDto } from "../types/appointment";
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
    <div className="flex flex-col gap-0.5 overflow-hidden px-2 py-1.5 text-[10px] leading-tight group">
      <div className="flex items-center justify-between gap-1">
         <span className="truncate font-semibold uppercase tracking-tight opacity-80">{arg.timeText}</span>
         <div className="h-1.5 w-1.5 rounded-full bg-white opacity-40 group-hover:opacity-100 transition-opacity" />
      </div>
      <span className="truncate font-bold text-xs uppercase tracking-tight leading-none mb-0.5">{a.patient.fullName}</span>
      <span className="truncate font-medium opacity-60 uppercase tracking-wide text-[8px]">
        {t("pages.appointments.eventDentist", { lastName: a.dentist.lastName })}
      </span>
    </div>
  );
}

export function AppointmentsPage(): JSX.Element {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [dentistFilter, setDentistFilter] = useState("");
  const [fcView, setFcView] = useState<CalView>("timeGridDay");
  const [range, setRange] = useState<{ from: string; to: string }>(() => {
    const k = manilaDateKey(new Date());
    return { from: k, to: k };
  });
  const [selected, setSelected] = useState<AppointmentDto | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AppointmentDto | null>(null);
  const [initialSlot, setInitialSlot] = useState<{ scheduledAt?: string; dentistId?: string }>({});

  const calendarRef = useRef<FullCalendar>(null);
  const rangeLabel = useMemo(() => formatRangeLabel(range.from, range.to), [range.from, range.to]);

  const { data: dentists = [] } = useQuery({
    queryKey: ["dentists"],
    queryFn: fetchDentists,
  });

  const { data: appointments = [], isFetched, isFetching } = useQuery({
    queryKey: ["appointments", range.from, range.to, dentistFilter],
    queryFn: () => fetchAppointments({
      from: range.from,
      to: range.to,
      dentistId: dentistFilter || undefined,
    }),
  });

  // loading/error removed

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
          classNames: [style.bg, style.border, style.text, "border", "!rounded-2xl", "!shadow-sm", "!mx-0.5", "!cursor-pointer", "hover:brightness-95", "transition-all"],
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
    setSelected(saved);
    void queryClient.invalidateQueries({ queryKey: ["appointments"] });
  }

  function onStatusChanged(updated: AppointmentDto): void {
    setSelected(updated);
    void queryClient.invalidateQueries({ queryKey: ["appointments"] });
  }

  function onDeleted(_id: string): void {
    setSelected(null);
    void queryClient.invalidateQueries({ queryKey: ["appointments"] });
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

  function goPrev(): void { calendarRef.current?.getApi().prev(); }
  function goNext(): void { calendarRef.current?.getApi().next(); }
  function goToday(): void { calendarRef.current?.getApi().today(); }
  function changeView(v: CalView): void {
    setFcView(v);
    calendarRef.current?.getApi().changeView(v);
  }

  function onExportCsv(): void {
    if (!appointments.length) return;
    const headers = [
      t("pages.appointments.csvHeaders.patient"),
      t("pages.appointments.csvHeaders.phone"),
      t("pages.appointments.csvHeaders.dentist"),
      t("pages.appointments.csvHeaders.scheduledAt"),
      t("pages.appointments.csvHeaders.status"),
      t("pages.appointments.csvHeaders.type"),
    ];
    const rows = appointments.map((a) => [
      a.patient.fullName,
      a.patient.phone,
      `Dr. ${a.dentist.lastName}`,
      new Date(a.scheduledAt).toLocaleString(),
      a.status,
      a.type ?? "",
    ]);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`appointments-${range.from}-${stamp}.csv`, rowsToCsv(headers, rows));
    toast.success(t("pages.appointments.exportReady", { count: appointments.length }));
  }

  return (
    <div className="min-h-screen w-full pb-24 bg-[#f5f7f9]">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-10 space-y-6 pt-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">{t("pages.appointments.deskKicker")}</span>
            </div>
            <h1 className="page-header-title">
              {t("pages.appointments.heroTitle")}<span className="text-teal-500">.</span>
            </h1>
            <p className="page-header-sub">{t("pages.appointments.subtitle")}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={!appointments.length}
              onClick={onExportCsv}
              className="btn-secondary flex items-center gap-2 disabled:opacity-40"
            >
              <Download size={16} />
              <span className="text-xs font-semibold uppercase tracking-widest">{t("pages.appointments.exportCsv")}</span>
            </button>
            <button 
              onClick={() => openNew()}
              className="btn-primary flex items-center gap-2"
            >
               <Plus size={18} />
               <span className="text-xs font-semibold uppercase tracking-widest">{t("pages.appointments.new")}</span>
            </button>
          </div>
        </div>

        {/* Calendar Controls Strip */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-12">
           
           {/* View Selection & Filters */}
           <div className="lg:col-span-8 flex flex-wrap items-center gap-4 bg-white p-4 rounded-2xl shadow-sm ring-1 ring-slate-100">
              <div className="flex gap-1 p-1 bg-slate-50 rounded-xl">
                {[
                  { key: "timeGridDay", label: t("pages.appointments.viewDay"), icon: List },
                  { key: "timeGridWeek", label: t("pages.appointments.viewWeek"), icon: LayoutGrid },
                  { key: "dayGridMonth", label: t("pages.appointments.viewMonth"), icon: CalendarDays }
                ].map((v) => (
                   <button
                     key={v.key}
                     onClick={() => changeView(v.key as CalView)}
                     className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${fcView === v.key ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                   >
                     <v.icon size={14} />
                     {v.label}
                   </button>
                ))}
              </div>

              <div className="h-8 w-px bg-slate-100 mx-1 hidden md:block" />

              <div className="flex-1 flex items-center gap-3">
                 <div className="flex items-center gap-1">
                    <button onClick={goPrev} className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-teal-500 hover:text-white transition-all"><ChevronLeft size={16} /></button>
                    <button onClick={goToday} className="h-10 px-4 rounded-xl bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600 hover:bg-teal-500 hover:text-white transition-all">{t("pages.appointments.today")}</button>
                    <button onClick={goNext} className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-teal-500 hover:text-white transition-all"><ChevronRight size={16} /></button>
                 </div>
                 
                 <div className="relative flex-1">
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                    <input 
                      type="date" 
                      value={range.from}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v) calendarRef.current?.getApi().gotoDate(`${v}T12:00:00+08:00`);
                      }}
                      className="h-10 w-full pl-10 pr-3 rounded-xl bg-slate-50 text-xs font-medium outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                    />
                 </div>
              </div>
           </div>

           {/* Metrics & Provider Selection */}
           <div className="lg:col-span-4 flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm ring-1 ring-slate-100">
              <div className="flex-1 px-3">
                 <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{t("pages.appointments.countsTotalLabel")}</p>
                 <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-800 tabular-nums">{counts.total}</span>
                    <span className="text-xs font-semibold text-teal-500">+{counts.confirmed} OK</span>
                 </div>
              </div>
              <div className="h-8 w-px bg-slate-100 mx-3" />
              <div className="flex-1">
                 <DentistSelect
                   dentists={dentists}
                   value={dentistFilter}
                   onChange={setDentistFilter}
                   includeAll
                 />
              </div>
           </div>
        </div>

        {/* Live Queue Strip (Conditional) */}
        <AnimatePresence>
          {queueItems.length > 0 && (
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="rounded-2xl bg-teal-50 border border-teal-100 p-5"
            >
               <div className="flex items-center gap-3 mb-3">
                  <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-teal-600">{t("pages.appointments.queueStripTitle")}</p>
               </div>
               <div className="flex flex-wrap gap-2">
                  {queueItems.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      aria-label={a.patient.fullName}
                      onClick={() => setSelected(a)}
                      className="group flex items-center gap-3 bg-white pl-3 pr-5 py-2.5 rounded-xl shadow-sm ring-1 ring-teal-100 hover:ring-teal-400 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                    >
                      <div className={`h-7 px-2.5 rounded-lg flex items-center justify-center text-[9px] font-bold uppercase tracking-wide ${a.status === "IN_PROGRESS" ? "bg-teal-50 text-teal-600" : "bg-sky-50 text-sky-600"}`}>
                         {a.status === "IN_PROGRESS"
                           ? t("pages.appointments.queueBadgeChair")
                           : t("pages.appointments.queueBadgeLobby")}
                      </div>
                      <div className="text-left">
                         <p className="text-xs font-bold text-slate-800 uppercase leading-none">{a.patient.fullName}</p>
                         <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                            {new Date(a.scheduledAt).toLocaleTimeString("en-PH", { hour: 'numeric', minute: '2-digit' })}
                         </p>
                      </div>
                    </button>
                  ))}
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Calendar Workspace */}
        <div className="relative">
           <div className="relative rounded-2xl bg-white shadow-sm p-6 lg:p-8 ring-1 ring-slate-100">
              <div className={`calendar-diagnostic-hub ${fcView === "dayGridMonth" ? "min-h-[600px]" : "h-[70vh] min-h-[600px]"}`}>
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
                   height="100%"
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
              {isFetched && !isFetching && appointments.length === 0 ? (
                <div className="pointer-events-none absolute inset-6 flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm">
                  <div className="pointer-events-auto">
                    <ListEmptyState
                      icon="chart"
                      title={t("pages.appointments.emptyRangeTitle")}
                      description={t("pages.appointments.emptyRangeDescription", { range: rangeLabel })}
                      primary={{ kind: "button", onClick: () => openNew(), label: t("pages.appointments.new") }}
                    />
                  </div>
                </div>
              ) : null}
           </div>
        </div>
      </div>

      {selected && (
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
      )}

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
