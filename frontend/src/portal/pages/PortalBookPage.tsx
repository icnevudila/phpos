import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

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
  }, []);

  useEffect(() => {
    if (!selectedDentist || !selectedDate) return;
    setLoadingAvail(true);
    setSelectedSlot(null);
    setSlotsError(null);
    fetchPortalAvailability(selectedDentist, selectedDate)
      .then(setAvailability)
      .catch((e: unknown) => setSlotsError(translatePortalError(e, t)))
      .finally(() => setLoadingAvail(false));
  }, [selectedDentist, selectedDate]);

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

  const fieldFocus =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus-visible:ring-offset-slate-950";

  return (
    <div className="min-w-0 space-y-5 px-4 pb-8 pt-5 dark:text-slate-100">
      <div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white">{t("pages.portal.book.title")}</h1>
        <div className="mt-2 flex gap-1">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className={`h-1 flex-1 rounded-full ${n <= step ? "bg-emerald-500" : "bg-slate-200"}`}
            />
          ))}
        </div>
      </div>

      <section>
        <h2 className="mb-2 text-[11px] font-black uppercase tracking-widest text-slate-500">
          {t("pages.portal.book.step1")}
        </h2>
        {dentistsLoading ? (
          <p className="text-sm text-slate-500">{t("pages.portal.book.loadingDentists")}</p>
        ) : dentistsError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm font-semibold text-rose-800">
            {t("pages.portal.book.dentistsLoadFailed", { message: dentistsError })}
          </div>
        ) : dentists.length === 0 ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm font-semibold text-amber-900">
            {t("pages.portal.book.noDentists")}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {dentists.map((d) => {
              const active = selectedDentist === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDentist(d.id)}
                  className={`flex min-h-[44px] flex-col items-center justify-center rounded-2xl border-2 p-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 ${
                    active
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40"
                      : "border-slate-200 bg-white hover:border-emerald-300 dark:border-slate-600 dark:bg-slate-900"
                  }`}
                >
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-full text-xl font-black ${
                      active ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {d.initials}
                  </div>
                  <p className="mt-2 text-center text-sm font-bold text-slate-900 dark:text-white">
                    {t("pages.common.drPrefix")} {d.firstName} {d.lastName}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {selectedDentist ? (
        <section>
          <h2 className="mb-2 text-[11px] font-black uppercase tracking-widest text-slate-500">
            {t("pages.portal.book.step2")}
          </h2>
          <div className="-mx-4 overflow-x-auto px-4">
            <div className="flex gap-2">
              {days.map((d) => {
                const iso = isoDay(d);
                const isSunday = d.getDay() === 0;
                const active = selectedDate === iso;
                return (
                  <button
                    key={iso}
                    type="button"
                    disabled={isSunday}
                    onClick={() => setSelectedDate(iso)}
                    className={`flex min-h-[44px] min-w-[64px] flex-col items-center justify-center rounded-xl border-2 px-3 py-2 ${
                      isSunday
                        ? "cursor-not-allowed border-rose-200 bg-rose-50 text-rose-500"
                        : active
                          ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                          : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300"
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase">
                      {d.toLocaleDateString(locale, { weekday: "short" })}
                    </span>
                    <span className="text-lg font-black">{d.getDate()}</span>
                    <span className="text-[9px] font-bold uppercase">
                      {d.toLocaleDateString(locale, { month: "short" })}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">{t("pages.portal.book.legendAvail")}</p>
        </section>
      ) : null}

      {selectedDentist && selectedDate ? (
        <section>
          <h2 className="mb-2 text-[11px] font-black uppercase tracking-widest text-slate-500">
            {t("pages.portal.book.step3")}
          </h2>
          {loadingAvail ? (
            <p className="text-sm text-slate-500">{t("pages.portal.book.loadingSlots")}</p>
          ) : slotsError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 text-xs font-semibold text-rose-800" role="alert">
              {t("pages.portal.book.slotsLoadFailed", { message: slotsError })}
            </div>
          ) : availability?.closed ? (
            <div className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700">
              {availability.reason ?? t("pages.portal.book.closedDefault")}
            </div>
          ) : !availability?.slots?.length ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-semibold text-slate-600">
              {t("pages.portal.book.noSlotsReturned")}
            </div>
          ) : !hasOpenSlot ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs font-semibold text-amber-900">
              {t("pages.portal.book.noSlotsAvailable")}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {availability.slots.map((s) => {
                const active = selectedSlot === s.iso;
                return (
                  <button
                    key={s.iso}
                    type="button"
                    disabled={!s.available}
                    onClick={() => setSelectedSlot(s.iso)}
                    className={`min-h-[44px] rounded-xl border py-2.5 text-sm font-bold transition ${
                      !s.available
                        ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 line-through"
                        : active
                          ? "border-emerald-500 bg-emerald-600 text-white shadow-md shadow-emerald-600/25"
                          : "border-slate-200 bg-white text-slate-700 hover:border-emerald-400"
                    }`}
                  >
                    {s.time}
                  </button>
                );
              })}
            </div>
          )}
        </section>
      ) : null}

      {selectedDentist && selectedDate && selectedSlot ? (
        <>
          <section>
            <h2 className="mb-2 text-[11px] font-black uppercase tracking-widest text-slate-500">
              {t("pages.portal.book.step4")}
            </h2>
            <div className="flex flex-wrap gap-2">
              {APPOINTMENT_TYPE_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setType(key)}
                  className={`min-h-11 rounded-full border px-3 py-2 text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 ${
                    type === key
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-slate-200 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                  }`}
                >
                  {t(`pages.portal.book.types.${key}`)}
                </button>
              ))}
            </div>
            <textarea
              placeholder={t("pages.portal.book.notesPlaceholder")}
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`mt-3 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ${fieldFocus}`}
            />
          </section>

          <section className="rounded-2xl bg-slate-900 p-4 text-white">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-300">
              {t("pages.portal.book.summary")}
            </p>
            <p className="mt-1 text-sm font-bold">
              {t("pages.common.drPrefix")} {selectedDentistObj?.firstName} {selectedDentistObj?.lastName}
            </p>
            <p className="text-xs text-slate-300">
              {new Intl.DateTimeFormat(locale, {
                dateStyle: "full",
                timeStyle: "short",
                timeZone: "Asia/Manila",
              }).format(new Date(selectedSlot))}
            </p>
            <p className="mt-1 text-xs text-slate-300">
              {t("pages.portal.book.typePrefix", { type: t(`pages.portal.book.types.${type}`) })}
            </p>
          </section>

          {error ? (
            <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
              {error}
            </div>
          ) : null}
          {success ? (
            <div className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
              {success}
            </div>
          ) : null}

          <button
            type="button"
            onClick={onConfirm}
            disabled={booking}
            className="w-full min-h-[44px] rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 disabled:opacity-50 dark:focus-visible:ring-offset-slate-950"
          >
            {booking ? t("pages.portal.book.booking") : t("pages.portal.book.confirm")}
          </button>
        </>
      ) : null}
    </div>
  );
}
