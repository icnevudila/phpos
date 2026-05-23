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

import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
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
    <div className="flex flex-col gap-0.5 overflow-hidden px-2 py-1.5 text-[10px] leading-tight group h-full">
      <div className="flex items-center justify-between gap-1">
         <span className="truncate font-bold uppercase tracking-tight opacity-90">{arg.timeText}</span>
         <div className="h-1.5 w-1.5 rounded-full bg-white opacity-40 group-hover:opacity-100 transition-opacity" />
      </div>
      <span className="truncate font-black text-xs uppercase tracking-tight leading-none my-0.5">{a.patient.fullName}</span>
      <span className="truncate font-semibold opacity-75 uppercase tracking-wide text-[9px]">
        Dr. {a.dentist.lastName}
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
          classNames: [style.bg, style.border, style.text, "border", "!rounded-xl", "!shadow-sm", "!m-[1px]", "!cursor-pointer", "hover:brightness-95", "transition-all"],
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
      t("pages.appointments.csvHeaders.patient", { defaultValue: "Patient" }),
      t("pages.appointments.csvHeaders.phone", { defaultValue: "Phone" }),
      t("pages.appointments.csvHeaders.dentist", { defaultValue: "Dentist" }),
      t("pages.appointments.csvHeaders.scheduledAt", { defaultValue: "Time" }),
      t("pages.appointments.csvHeaders.status", { defaultValue: "Status" }),
    ];
    const rows = appointments.map((a) => [
      a.patient.fullName,
      a.patient.phone,
      `Dr. ${a.dentist.lastName}`,
      new Date(a.scheduledAt).toLocaleString(),
      a.status,
    ]);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`appointments-${range.from}-${stamp}.csv`, rowsToCsv(headers, rows));
    toast.success(t("pages.appointments.exportReady", { defaultValue: "Exported", count: appointments.length }));
  }

  return (
    <div className="page-container space-y-6">
      <PageHeader 
        title={t("pages.appointments.heroTitle", { defaultValue: "Calendar" })}
        subtitle={t("pages.appointments.subtitle", { defaultValue: "Manage schedule and appointments." })}
        actions={
          <>
            <button
              type="button"
              disabled={!appointments.length}
              onClick={onExportCsv}
              className="btn-secondary hidden sm:flex items-center gap-2 disabled:opacity-40"
            >
              <Download size={16} />
              <span>{t("pages.appointments.exportCsv", { defaultValue: "Export" })}</span>
            </button>
            <button 
              onClick={() => openNew()}
              className="btn-primary flex items-center gap-2"
            >
               <Plus size={18} />
               <span>{t("pages.appointments.new", { defaultValue: "New Appointment" })}</span>
            </button>
          </>
        }
      />

      {/* Calendar Controls Strip */}
      <div className="card p-2 sm:p-3 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 border-brand-border-strong">
         {/* View Selection */}
         <div className="flex items-center gap-1 p-1 bg-brand-surface-soft rounded-[var(--radius-md)] border border-brand-border self-start lg:self-auto">
           {[
             { key: "timeGridDay", label: "Day", icon: List },
             { key: "timeGridWeek", label: "Week", icon: LayoutGrid },
             { key: "dayGridMonth", label: "Month", icon: CalendarDays }
           ].map((v) => (
              <button
                key={v.key}
                onClick={() => changeView(v.key as CalView)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-bold uppercase tracking-wider transition-all ${fcView === v.key ? 'bg-brand-surface border border-brand-border text-brand-primary shadow-sm' : 'text-brand-muted hover:text-brand-text'}`}
              >
                <v.icon size={14} />
                <span className="hidden sm:inline">{v.label}</span>
              </button>
           ))}
         </div>

         {/* Navigation */}
         <div className="flex-1 flex items-center justify-center gap-2">
            <button onClick={goPrev} className="h-10 w-10 flex items-center justify-center rounded-[var(--radius-md)] bg-brand-surface text-brand-muted hover:bg-brand-primary hover:text-white transition-colors border border-brand-border shadow-sm"><ChevronLeft size={16} /></button>
            <button onClick={goToday} className="h-10 px-4 rounded-[var(--radius-md)] bg-brand-surface text-xs font-bold uppercase tracking-wider text-brand-text hover:bg-brand-primary hover:text-white transition-colors border border-brand-border shadow-sm">{t("pages.appointments.today", { defaultValue: "Today" })}</button>
            <button onClick={goNext} className="h-10 w-10 flex items-center justify-center rounded-[var(--radius-md)] bg-brand-surface text-brand-muted hover:bg-brand-primary hover:text-white transition-colors border border-brand-border shadow-sm"><ChevronRight size={16} /></button>
            <div className="h-8 w-px bg-brand-border mx-2 hidden sm:block" />
            <div className="relative hidden sm:flex max-w-[160px]">
               <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={14} />
               <input 
                 type="date" 
                 value={range.from}
                 onChange={(e) => {
                   const v = e.target.value;
                   if (v) calendarRef.current?.getApi().gotoDate(`${v}T12:00:00+08:00`);
                 }}
                 className="h-10 w-full pl-9 pr-3 rounded-[var(--radius-md)] bg-brand-surface text-xs font-bold text-brand-text border border-brand-border shadow-sm outline-none focus:ring-2 focus:ring-brand-primary transition-shadow"
               />
            </div>
         </div>

         {/* Provider Selection */}
         <div className="flex-shrink-0 w-full lg:w-64">
            <DentistSelect
              dentists={dentists}
              value={dentistFilter}
              onChange={setDentistFilter}
              includeAll
            />
         </div>
      </div>

      {/* Live Queue Strip (Conditional) */}
      <AnimatePresence>
        {queueItems.length > 0 && (
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, height: 0 }}
             className="card bg-brand-primary-soft border border-brand-primary/20"
          >
             <div className="flex items-center gap-2 mb-3">
                <div className="h-2 w-2 rounded-full bg-brand-primary animate-pulse" />
                <p className="text-xs font-bold uppercase tracking-wider text-brand-primary">{t("pages.appointments.queueStripTitle", { defaultValue: "In Clinic Now" })}</p>
             </div>
             <div className="flex flex-wrap gap-2">
                {queueItems.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    aria-label={a.patient.fullName}
                    onClick={() => setSelected(a)}
                    className="group flex items-center gap-3 bg-brand-surface pl-3 pr-4 py-2 rounded-[var(--radius-md)] shadow-sm border border-brand-primary/10 hover:border-brand-primary hover:shadow-md transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                  >
                    <div className={`h-6 px-2 rounded-[var(--radius-sm)] flex items-center justify-center text-[10px] font-bold uppercase tracking-wide ${a.status === "IN_PROGRESS" ? "bg-brand-primary text-white" : "bg-brand-surface-soft text-brand-text"}`}>
                       {a.status.replace("_", " ")}
                    </div>
                    <div className="text-left leading-tight">
                       <p className="text-xs font-bold text-brand-text truncate max-w-[120px]">{a.patient.fullName}</p>
                       <p className="text-[10px] font-semibold text-brand-muted mt-0.5">
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
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
         {/* Calendar Column */}
         <div className={`relative card p-0 overflow-hidden ${selected ? 'xl:col-span-8' : 'xl:col-span-12'}`}>
            <div className={`calendar-diagnostic-hub bg-brand-surface p-4 ${fcView === "dayGridMonth" ? "min-h-[600px]" : "h-[70vh] min-h-[600px]"}`}>
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
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-brand-surface/60 backdrop-blur-[2px] z-10">
                <div className="pointer-events-auto bg-brand-surface p-8 rounded-2xl shadow-popover border border-brand-border">
                  <EmptyState
                    icon={CalendarDays}
                    title={t("pages.appointments.emptyRangeTitle", { defaultValue: "No appointments" })}
                    description={t("pages.appointments.emptyRangeDescription", { range: rangeLabel, defaultValue: "No appointments scheduled for this date range." })}
                    action={<button className="btn-primary mt-2" onClick={() => openNew()}>{t("pages.appointments.new", { defaultValue: "New Appointment" })}</button>}
                  />
                </div>
              </div>
            ) : null}
         </div>

         {/* Selected Appointment Details Drawer embedded in right col */}
         {selected && (
           <div className="xl:col-span-4 hidden xl:block sticky top-24">
             <div className="card h-full p-0 overflow-hidden shadow-sm border-brand-border-strong">
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
             </div>
           </div>
         )}
      </div>

      {/* Mobile Selected Drawer */}
      <AnimatePresence>
        {selected && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="xl:hidden fixed inset-0 z-50 flex flex-col justify-end bg-brand-text/40 backdrop-blur-sm sm:p-4 sm:justify-center"
          >
             <motion.div 
               initial={{ y: "100%" }}
               animate={{ y: 0 }}
               exit={{ y: "100%" }}
               transition={{ type: "spring", damping: 25, stiffness: 200 }}
               className="w-full sm:max-w-md max-h-[90vh] overflow-hidden bg-brand-surface sm:rounded-2xl shadow-popover flex flex-col rounded-t-2xl"
             >
                <div className="overflow-y-auto flex-1 p-0">
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
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
