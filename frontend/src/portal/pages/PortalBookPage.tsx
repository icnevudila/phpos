import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, Clock, User as UserIcon, CheckCircle2 } from "lucide-react";

import { useUiLocale } from "../../hooks/useUiLocale";
import { translatePortalError } from "../translatePortalError";
import { usePortalKioskSuffix } from "../usePortalKioskSuffix";
import {
  bookAppointment,
  fetchPortalAvailability,
  fetchPortalDentists,
  type PortalAvailability,
  type PortalDentist,
} from "../services/portalApi";

const APPOINTMENT_TYPE_KEYS = [
  "CHECKUP",
  "CLEANING",
  "FILLING",
  "EXTRACTION",
  "ROOT_CANAL",
  "CONSULTATION",
  "OTHER",
] as const;

function isoDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function nextNDays(n: number): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });
}

export function PortalBookPage(): JSX.Element {
  const { t } = useTranslation();
  const locale = useUiLocale();
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const kioskSuffix = usePortalKioskSuffix();

  const [dentists, setDentists] = useState<PortalDentist[]>([]);
  const [dentistsLoading, setDentistsLoading] = useState(true);
  const [selectedDentist, setSelectedDentist] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [availability, setAvailability] = useState<PortalAvailability | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [type, setType] = useState<string>("CHECKUP");
  const [notes, setNotes] = useState("");

  const [loadingAvail, setLoadingAvail] = useState(false);
  const [booking, setBooking] = useState(false);
  const [dentistsError, setDentistsError] = useState<string | null>(null);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setDentistsLoading(true);
    setDentistsError(null);
    fetchPortalDentists()
      .then(setDentists)
      .catch((e: unknown) => setDentistsError(translatePortalError(e, t)))
      .finally(() => setDentistsLoading(false));
  }, [t]);

  useEffect(() => {
    if (!selectedDentist || !selectedDate) return;
    setLoadingAvail(true);
    setSelectedSlot(null);
    setSlotsError(null);
    fetchPortalAvailability(selectedDentist, selectedDate)
      .then(setAvailability)
      .catch((e: unknown) => setSlotsError(translatePortalError(e, t)))
      .finally(() => setLoadingAvail(false));
  }, [selectedDentist, selectedDate, t]);

  const calendarDayKey = Math.floor(Date.now() / 86_400_000);
  const days = useMemo(() => nextNDays(14), [calendarDayKey]);

  async function onConfirm(): Promise<void> {
    if (!selectedDentist || !selectedSlot) return;
    setBooking(true);
    setError(null);
    try {
      const res = await bookAppointment({
        dentistId: selectedDentist,
        scheduledAt: selectedSlot,
        type,
        notes: notes.trim() || undefined,
      });
      setSuccess(t("pages.portal.book.success", { status: res.status }));
      setTimeout(() => navigate(`/${slug}/portal/appointments${kioskSuffix}`), 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("pages.portal.book.bookingFailed"));
    } finally {
      setBooking(false);
    }
  }

  const selectedDentistObj = dentists.find((d) => d.id === selectedDentist);
  const step = !selectedDentist ? 1 : !selectedDate ? 2 : !selectedSlot ? 3 : 4;

  const hasOpenSlot =
    availability &&
    !availability.closed &&
    (availability.slots?.some((s) => s.available) ?? false);

  const slideUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <div className="min-h-[100dvh] bg-brand-surface sm:bg-brand-bg flex flex-col items-center pt-8 sm:pt-16 pb-24 px-4 sm:px-6">
      
      {/* Container */}
      <div className="w-full max-w-xl mx-auto bg-brand-surface sm:rounded-[24px] sm:shadow-popover sm:border border-brand-border p-6 sm:p-10">
         
         <div className="text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-brand-text mb-4">{t("pages.portal.book.title", { defaultValue: "Book Your Visit" })}</h1>
            <div className="flex items-center justify-center gap-2 max-w-[200px] mx-auto">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${n <= step ? "bg-brand-primary" : "bg-brand-surface-muted"}`}
                />
              ))}
            </div>
         </div>

         <div className="space-y-10">
            {/* STEP 1: Select Provider */}
            <motion.section variants={slideUp} initial="hidden" animate="visible" className="space-y-4">
               <div className="flex items-center gap-2 mb-4">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-brand-primary text-white' : 'bg-brand-surface-muted text-brand-muted'}`}>1</div>
                  <h2 className="text-lg font-bold text-brand-text">{t("pages.portal.book.step1", { defaultValue: "Select Provider" })}</h2>
               </div>
               
               {dentistsLoading ? (
                 <div className="h-32 rounded-2xl bg-brand-surface-soft animate-pulse" />
               ) : dentistsError ? (
                 <div className="rounded-2xl border border-brand-danger/20 bg-brand-danger-soft px-4 py-4 text-sm font-semibold text-brand-danger">
                   {t("pages.portal.book.dentistsLoadFailed", { message: dentistsError })}
                 </div>
               ) : dentists.length === 0 ? (
                 <div className="rounded-2xl border border-brand-warning/20 bg-brand-warning-soft px-4 py-4 text-sm font-semibold text-brand-warning">
                   {t("pages.portal.book.noDentists", { defaultValue: "No providers available." })}
                 </div>
               ) : (
                 <div className="grid grid-cols-2 gap-4">
                   {dentists.map((d) => {
                     const active = selectedDentist === d.id;
                     return (
                       <button
                         key={d.id}
                         type="button"
                         onClick={() => { setSelectedDentist(d.id); setSelectedDate(null); setSelectedSlot(null); }}
                         className={`relative flex flex-col items-center justify-center rounded-2xl border p-4 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${ active ? "border-brand-primary bg-brand-primary-soft shadow-sm scale-[1.02]" : "border-brand-border bg-brand-surface hover:border-brand-primary/50 hover:bg-brand-surface-soft" }`}
                       >
                         {active && <CheckCircle2 className="absolute top-3 right-3 text-brand-primary" size={18} />}
                         <div
                           className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold shadow-sm mb-3 ${ active ? "bg-brand-primary text-white" : "bg-brand-surface-muted text-brand-muted" }`}
                         >
                           {d.initials}
                         </div>
                         <p className={`text-sm font-bold ${active ? 'text-brand-primary' : 'text-brand-text'}`}>
                           {t("pages.common.drPrefix", { defaultValue: "Dr." })} {d.firstName} {d.lastName}
                         </p>
                       </button>
                     );
                   })}
                 </div>
               )}
            </motion.section>

            {/* STEP 2: Select Date */}
            <AnimatePresence>
              {selectedDentist && (
                <motion.section variants={slideUp} initial="hidden" animate="visible" exit="hidden" className="space-y-4 pt-4 border-t border-brand-border">
                   <div className="flex items-center gap-2 mb-4">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-brand-primary text-white' : 'bg-brand-surface-muted text-brand-muted'}`}>2</div>
                      <h2 className="text-lg font-bold text-brand-text">{t("pages.portal.book.step2", { defaultValue: "Select Date" })}</h2>
                   </div>
                   
                   <div className="-mx-6 px-6 sm:mx-0 sm:px-0 overflow-x-auto pb-4 scrollbar-hide">
                     <div className="flex gap-3">
                       {days.map((d) => {
                         const iso = isoDay(d);
                         const isSunday = d.getDay() === 0;
                         const active = selectedDate === iso;
                         return (
                           <button
                             key={iso}
                             type="button"
                             disabled={isSunday}
                             onClick={() => { setSelectedDate(iso); setSelectedSlot(null); }}
                             className={`flex min-w-[72px] flex-col items-center justify-center rounded-2xl border px-3 py-3 transition-all ${ isSunday ? "cursor-not-allowed border-brand-danger/20 bg-brand-danger-soft text-brand-danger/50 opacity-50" : active ? "border-brand-primary bg-brand-primary text-white shadow-md scale-[1.05]" : "border-brand-border bg-brand-surface text-brand-text hover:border-brand-primary/50" }`}
                           >
                             <span className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${active ? 'text-brand-primary-soft' : 'text-brand-muted'}`}>
                               {d.toLocaleDateString(locale, { weekday: "short" })}
                             </span>
                             <span className="text-2xl font-black">{d.getDate()}</span>
                             <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${active ? 'text-brand-primary-soft' : 'text-brand-muted'}`}>
                               {d.toLocaleDateString(locale, { month: "short" })}
                             </span>
                           </button>
                         );
                       })}
                     </div>
                   </div>
                </motion.section>
              )}
            </AnimatePresence>

            {/* STEP 3: Select Slot */}
            <AnimatePresence>
              {selectedDentist && selectedDate && (
                <motion.section variants={slideUp} initial="hidden" animate="visible" exit="hidden" className="space-y-4 pt-4 border-t border-brand-border">
                  <div className="flex items-center gap-2 mb-4">
                     <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 3 ? 'bg-brand-primary text-white' : 'bg-brand-surface-muted text-brand-muted'}`}>3</div>
                     <h2 className="text-lg font-bold text-brand-text">{t("pages.portal.book.step3", { defaultValue: "Select Time" })}</h2>
                  </div>
                  
                  {loadingAvail ? (
                    <div className="h-24 rounded-2xl bg-brand-surface-soft animate-pulse" />
                  ) : slotsError ? (
                    <div className="rounded-xl border border-brand-danger/20 bg-brand-danger-soft px-4 py-4 text-sm font-semibold text-brand-danger" role="alert">
                      {t("pages.portal.book.slotsLoadFailed", { message: slotsError, defaultValue: "Failed to load slots." })}
                    </div>
                  ) : availability?.closed ? (
                    <div className="rounded-xl bg-brand-surface-soft p-4 text-center text-sm font-semibold text-brand-muted">
                      {availability.reason ?? t("pages.portal.book.closedDefault", { defaultValue: "Clinic is closed on this date." })}
                    </div>
                  ) : !availability?.slots?.length ? (
                    <div className="rounded-xl bg-brand-surface-soft p-4 text-center text-sm font-semibold text-brand-muted">
                      {t("pages.portal.book.noSlotsReturned", { defaultValue: "No slots available on this date." })}
                    </div>
                  ) : !hasOpenSlot ? (
                    <div className="rounded-xl bg-brand-warning-soft border border-brand-warning/20 p-4 text-center text-sm font-semibold text-brand-warning">
                      {t("pages.portal.book.noSlotsAvailable", { defaultValue: "All slots are fully booked." })}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {availability.slots.map((s) => {
                        const active = selectedSlot === s.iso;
                        return (
                          <button
                            key={s.iso}
                            type="button"
                            disabled={!s.available}
                            onClick={() => setSelectedSlot(s.iso)}
                            className={`min-h-[48px] rounded-xl border py-2 text-sm font-bold transition-all ${ !s.available ? "cursor-not-allowed border-brand-border bg-brand-surface-muted text-brand-muted opacity-60 line-through" : active ? "border-brand-primary bg-brand-primary text-white shadow-md scale-105" : "border-brand-border bg-brand-surface text-brand-text hover:border-brand-primary/50 hover:bg-brand-surface-soft" }`}
                          >
                            {s.time}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </motion.section>
              )}
            </AnimatePresence>

            {/* STEP 4: Details & Confirm */}
            <AnimatePresence>
              {selectedDentist && selectedDate && selectedSlot && (
                <motion.section variants={slideUp} initial="hidden" animate="visible" exit="hidden" className="space-y-6 pt-4 border-t border-brand-border">
                   <div className="flex items-center gap-2 mb-4">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 4 ? 'bg-brand-primary text-white' : 'bg-brand-surface-muted text-brand-muted'}`}>4</div>
                      <h2 className="text-lg font-bold text-brand-text">{t("pages.portal.book.step4", { defaultValue: "Final Details" })}</h2>
                   </div>
                   
                   <div className="space-y-4">
                     <h3 className="text-sm font-bold text-brand-text">{t("pages.portal.book.visitType", { defaultValue: "Reason for visit" })}</h3>
                     <div className="flex flex-wrap gap-2">
                       {APPOINTMENT_TYPE_KEYS.map((key) => (
                         <button
                           key={key}
                           type="button"
                           onClick={() => setType(key)}
                           className={`min-h-11 rounded-xl border px-4 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${ type === key ? "border-brand-primary bg-brand-primary-soft text-brand-primary" : "border-brand-border bg-brand-surface text-brand-muted hover:border-brand-border-strong hover:text-brand-text" }`}
                         >
                           {t(`pages.portal.book.types.${key}`)}
                         </button>
                       ))}
                     </div>
                   </div>

                   <div className="space-y-2">
                     <h3 className="text-sm font-bold text-brand-text">{t("pages.portal.book.notesLabel", { defaultValue: "Additional Notes (Optional)" })}</h3>
                     <textarea
                       placeholder={t("pages.portal.book.notesPlaceholder")}
                       rows={3}
                       value={notes}
                       onChange={(e) => setNotes(e.target.value)}
                       className="w-full rounded-xl border border-brand-border bg-brand-surface-soft px-4 py-3 text-sm text-brand-text outline-none transition-colors focus:bg-brand-surface focus:border-brand-primary focus:ring-1 focus:ring-brand-primary resize-none placeholder:text-brand-muted"
                     />
                   </div>

                   {/* Summary Card */}
                   <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-lg mt-8 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary opacity-10 blur-3xl rounded-full" />
                     
                     <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                       {t("pages.portal.book.summary", { defaultValue: "Booking Summary" })}
                     </h3>
                     
                     <div className="space-y-4 relative z-10">
                        <div className="flex items-center gap-3">
                           <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                              <UserIcon size={18} className="text-brand-primary" />
                           </div>
                           <div>
                              <p className="text-xs font-semibold text-slate-400">{t("pages.portal.book.summaryProvider", { defaultValue: "Provider" })}</p>
                              <p className="text-base font-bold text-white">
                                {t("pages.common.drPrefix", { defaultValue: "Dr." })} {selectedDentistObj?.firstName} {selectedDentistObj?.lastName}
                              </p>
                           </div>
                        </div>

                        <div className="flex items-center gap-3">
                           <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                              <CalendarIcon size={18} className="text-brand-primary" />
                           </div>
                           <div>
                              <p className="text-xs font-semibold text-slate-400">{t("pages.portal.book.summaryDate", { defaultValue: "Date & Time" })}</p>
                              <p className="text-base font-bold text-white">
                                {new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "Asia/Manila" }).format(new Date(selectedSlot))} at {new Intl.DateTimeFormat(locale, { timeStyle: "short", timeZone: "Asia/Manila" }).format(new Date(selectedSlot))}
                              </p>
                           </div>
                        </div>
                     </div>
                   </div>

                   {error ? (
                     <div className="rounded-xl border border-brand-danger/20 bg-brand-danger-soft px-4 py-3 text-sm font-semibold text-brand-danger">
                       {error}
                     </div>
                   ) : null}
                   {success ? (
                     <div className="rounded-xl border border-brand-success/20 bg-brand-success-soft px-4 py-3 text-sm font-semibold text-brand-success">
                       {success}
                     </div>
                   ) : null}

                   <button
                     type="button"
                     onClick={onConfirm}
                     disabled={booking}
                     className="w-full min-h-[56px] rounded-xl bg-brand-primary text-white text-base font-bold shadow-lg shadow-brand-primary/25 transition-all hover:bg-brand-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-primary"
                   >
                     {booking ? t("pages.portal.book.booking", { defaultValue: "Confirming..." }) : t("pages.portal.book.confirm", { defaultValue: "Confirm Appointment" })}
                   </button>
                </motion.section>
              )}
            </AnimatePresence>
         </div>
      </div>
    </div>
  );
}
