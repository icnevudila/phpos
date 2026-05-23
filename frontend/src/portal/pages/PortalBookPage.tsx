import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, User as UserIcon, CheckCircle2, Sparkles } from "lucide-react";

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
  const [type, setType] = useState<string | null>(null);
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
    if (!selectedDentist || !selectedSlot || !type) return;
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
      setError(e instanceof Error ? e.message : t("pages.portal.book.bookingFailed", { defaultValue: "Booking Failed" }));
    } finally {
      setBooking(false);
    }
  }

  const selectedDentistObj = dentists.find((d) => d.id === selectedDentist);

  const hasOpenSlot =
    availability &&
    !availability.closed &&
    (availability.slots?.some((s) => s.available) ?? false);

  const slideUp = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
  };

  return (
    <div className="min-h-[100dvh] bg-brand-surface-soft flex flex-col items-center pt-8 sm:pt-16 pb-24 px-4 sm:px-6">
      
      {/* Header */}
      <div className="w-full max-w-5xl mx-auto mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-brand-text mb-2">
          {t("pages.portal.book.title", { defaultValue: "Appointment Builder" })}
        </h1>
        <p className="text-sm font-medium text-brand-muted">
          We'll get you booked in just a few taps.
        </p>
      </div>

      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
         
         {/* Left Column: Questions */}
         <div className="lg:col-span-8 space-y-8">
            
            {/* Q1: What do you need help with? */}
            <motion.section variants={slideUp} initial="hidden" animate="visible" className="card p-6 border-brand-border-strong">
               <h2 className="text-lg font-bold text-brand-text mb-4">What do you need help with?</h2>
               <div className="flex flex-wrap gap-2">
                 {APPOINTMENT_TYPE_KEYS.map((key) => {
                   const active = type === key;
                   return (
                     <button
                       key={key}
                       type="button"
                       onClick={() => setType(key)}
                       className={`min-h-12 rounded-xl border px-5 py-2.5 text-sm font-bold transition-all ${ active ? "border-brand-primary bg-brand-primary text-white shadow-md scale-[1.02]" : "border-brand-border bg-brand-surface text-brand-text hover:border-brand-primary/50 hover:bg-brand-surface-soft" }`}
                     >
                       {t(`pages.portal.book.types.${key}`)}
                     </button>
                   );
                 })}
               </div>
            </motion.section>

            {/* Q2: Preferred Dentist? */}
            <AnimatePresence>
              {type && (
                <motion.section variants={slideUp} initial="hidden" animate="visible" exit="hidden" className="card p-6 border-brand-border-strong">
                   <h2 className="text-lg font-bold text-brand-text mb-4">Do you have a preferred provider?</h2>
                   
                   {dentistsLoading ? (
                     <div className="h-32 rounded-2xl bg-brand-surface-soft animate-pulse" />
                   ) : dentistsError ? (
                     <div className="rounded-xl border border-brand-danger/20 bg-brand-danger-soft px-4 py-4 text-sm font-semibold text-brand-danger">
                       {t("pages.portal.book.dentistsLoadFailed", { message: dentistsError })}
                     </div>
                   ) : dentists.length === 0 ? (
                     <div className="rounded-xl border border-brand-warning/20 bg-brand-warning-soft px-4 py-4 text-sm font-semibold text-brand-warning">
                       {t("pages.portal.book.noDentists", { defaultValue: "No providers available." })}
                     </div>
                   ) : (
                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                       {dentists.map((d) => {
                         const active = selectedDentist === d.id;
                         return (
                           <button
                             key={d.id}
                             type="button"
                             onClick={() => { setSelectedDentist(d.id); setSelectedDate(null); setSelectedSlot(null); }}
                             className={`relative flex flex-col items-center justify-center rounded-2xl border p-4 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${ active ? "border-brand-primary bg-brand-primary-soft shadow-sm scale-[1.02]" : "border-brand-border bg-brand-surface hover:border-brand-primary/50 hover:bg-brand-surface-soft" }`}
                           >
                             {active && <CheckCircle2 className="absolute top-3 right-3 text-brand-primary" size={16} />}
                             <div className={`flex h-12 w-12 items-center justify-center rounded-full text-base font-bold shadow-sm mb-3 ${ active ? "bg-brand-primary text-white" : "bg-brand-surface-muted text-brand-muted" }`}>
                               {d.initials}
                             </div>
                             <p className={`text-sm font-bold text-center ${active ? 'text-brand-primary' : 'text-brand-text'}`}>
                               Dr. {d.firstName} {d.lastName}
                             </p>
                           </button>
                         );
                       })}
                     </div>
                   )}
                </motion.section>
              )}
            </AnimatePresence>

            {/* Q3: Date & Time */}
            <AnimatePresence>
              {type && selectedDentist && (
                <motion.section variants={slideUp} initial="hidden" animate="visible" exit="hidden" className="card p-6 border-brand-border-strong">
                   <h2 className="text-lg font-bold text-brand-text mb-4">When works best for you?</h2>
                   
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

                   {/* Time Slots */}
                   <AnimatePresence>
                     {selectedDate && (
                       <motion.div variants={slideUp} initial="hidden" animate="visible" exit="hidden" className="pt-6 mt-2 border-t border-brand-border">
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
                       </motion.div>
                     )}
                   </AnimatePresence>
                </motion.section>
              )}
            </AnimatePresence>

            {/* Q4: Contact Details (Notes) */}
            <AnimatePresence>
               {type && selectedDentist && selectedDate && selectedSlot && (
                  <motion.section variants={slideUp} initial="hidden" animate="visible" exit="hidden" className="card p-6 border-brand-border-strong">
                     <h2 className="text-lg font-bold text-brand-text mb-4">Any details we should know before you arrive?</h2>
                     <textarea
                       placeholder="e.g. My tooth hurts when drinking cold water..."
                       rows={3}
                       value={notes}
                       onChange={(e) => setNotes(e.target.value)}
                       className="w-full rounded-xl border border-brand-border bg-brand-surface-soft px-4 py-3 text-sm font-medium text-brand-text outline-none transition-colors focus:bg-brand-surface focus:border-brand-primary focus:ring-1 focus:ring-brand-primary resize-none placeholder:text-brand-muted"
                     />
                  </motion.section>
               )}
            </AnimatePresence>
         </div>

         {/* Right Column: Live Appointment Card (Sticky) */}
         <div className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="card p-6 border-brand-border-strong flex flex-col min-h-[300px]">
               <h3 className="text-sm font-bold uppercase tracking-widest text-brand-muted mb-6 flex items-center gap-2">
                 <Sparkles size={14} className="text-brand-primary" /> 
                 Live Summary
               </h3>

               <div className="space-y-6 flex-1">
                  {/* Type */}
                  <div className="flex gap-4">
                     <div className="w-10 h-10 rounded-full bg-brand-surface-soft flex items-center justify-center shrink-0">
                        <CheckCircle2 size={16} className={type ? "text-brand-primary" : "text-brand-muted"} />
                     </div>
                     <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-0.5">Visit Reason</p>
                        <p className={`text-sm font-bold ${type ? "text-brand-text" : "text-brand-muted italic"}`}>
                           {type ? t(`pages.portal.book.types.${type}`) : "Not selected"}
                        </p>
                     </div>
                  </div>

                  {/* Dentist */}
                  <div className="flex gap-4">
                     <div className="w-10 h-10 rounded-full bg-brand-surface-soft flex items-center justify-center shrink-0">
                        <UserIcon size={16} className={selectedDentist ? "text-brand-primary" : "text-brand-muted"} />
                     </div>
                     <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-0.5">Provider</p>
                        <p className={`text-sm font-bold ${selectedDentistObj ? "text-brand-text" : "text-brand-muted italic"}`}>
                           {selectedDentistObj ? `Dr. ${selectedDentistObj.firstName} ${selectedDentistObj.lastName}` : "Not selected"}
                        </p>
                     </div>
                  </div>

                  {/* Date & Time */}
                  <div className="flex gap-4">
                     <div className="w-10 h-10 rounded-full bg-brand-surface-soft flex items-center justify-center shrink-0">
                        <CalendarIcon size={16} className={selectedSlot ? "text-brand-primary" : "text-brand-muted"} />
                     </div>
                     <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-0.5">Date & Time</p>
                        <p className={`text-sm font-bold ${selectedSlot ? "text-brand-text" : "text-brand-muted italic"}`}>
                           {selectedSlot ? (
                             <>
                               {new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "Asia/Manila" }).format(new Date(selectedSlot))} <br/>
                               {new Intl.DateTimeFormat(locale, { timeStyle: "short", timeZone: "Asia/Manila" }).format(new Date(selectedSlot))}
                             </>
                           ) : "Not selected"}
                        </p>
                     </div>
                  </div>
               </div>

               <div className="mt-8 pt-6 border-t border-brand-border">
                  {error ? (
                    <div className="rounded-xl border border-brand-danger/20 bg-brand-danger-soft px-4 py-3 text-sm font-semibold text-brand-danger mb-4">
                      {error}
                    </div>
                  ) : null}
                  {success ? (
                    <div className="rounded-xl border border-brand-success/20 bg-brand-success-soft px-4 py-3 text-sm font-semibold text-brand-success mb-4">
                      {success}
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={onConfirm}
                    disabled={!type || !selectedDentist || !selectedSlot || booking}
                    className="btn-primary w-full h-12 text-sm"
                  >
                    {booking ? "Confirming..." : "Confirm Appointment"}
                  </button>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
}
