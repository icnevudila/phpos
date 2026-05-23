import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { useUiLocale } from "../../hooks/useUiLocale";
import { translatePortalError } from "../translatePortalError";
import { fetchPortalHome, type PortalHome } from "../services/portalApi";
import { usePortalKioskSuffix } from "../usePortalKioskSuffix";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800  ",
  CONFIRMED: "bg-sky-100 text-sky-800  ",
  COMPLETED: "bg-teal-100 text-teal-800  ",
  CANCELLED: "bg-rose-100 text-rose-700  ",
  NO_SHOW: "bg-slate-200 text-slate-700  ",
};

const INVOICE_STATUS_STYLES: Record<string, string> = {
  UNPAID: "bg-rose-100 text-rose-700  ",
  PARTIAL: "bg-amber-100 text-amber-800  ",
  PAID: "bg-teal-100 text-teal-800  ",
};

export function PortalHomePage(): JSX.Element {
  const { t } = useTranslation();
  const locale = useUiLocale();
  const { slug = "" } = useParams();
  const kioskSuffix = usePortalKioskSuffix();
  const [home, setHome] = useState<PortalHome | null>(null);
  const [error, setError] = useState<string | null>(null);

  const php = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
      }),
    [locale],
  );

  const fmtLongDate = (iso: string): string =>
    new Intl.DateTimeFormat(locale, {
      weekday: "long",
      day: "2-digit",
      month: "long",
      timeZone: "Asia/Manila",
    }).format(new Date(iso));

  useEffect(() => {
    fetchPortalHome()
      .then(setHome)
      .catch((e: unknown) => setError(translatePortalError(e, t)));
  }, [t]);

  if (error) {
    return (
      <div className="min-w-0 px-6 py-8 text-sm text-rose-700">{error}</div>
    );
  }
  if (!home) {
    return (
      <div className="min-w-0 px-6 py-8 text-sm text-slate-500">
        {t("pages.portal.home.loading", { defaultValue: "Loading" })}
      </div>
    );
  }

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return t("pages.portal.home.greetingMorning", { defaultValue: "Greeting Morning" });
    if (h < 18) return t("pages.portal.home.greetingAfternoon", { defaultValue: "Greeting Afternoon" });
    return t("pages.portal.home.greetingEvening", { defaultValue: "Greeting Evening" });
  })();

  const unpaidLine =
    home.unpaidCount > 0
      ? t("pages.portal.home.unpaid", { count: home.unpaidCount })
      : t("pages.portal.home.caughtUp", { defaultValue: "Caught Up" });

  return (
    <div className="min-w-0 space-y-5 px-4 pt-5">
      <section className="rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 p-5 text-white shadow-lg">
        <p className="text-xs font-bold uppercase tracking-widest text-teal-100">{greeting}</p>
        <h1 className="mt-1 text-2xl font-black">
          {t("pages.portal.home.nameBang", { name: home.patient.firstName })}
        </h1>
        <p className="mt-1 text-sm text-teal-50">{unpaidLine}</p>
      </section>

      <section>
        <h2 className="mb-2 text-[11px] font-black uppercase tracking-widest text-slate-500">
          {t("pages.portal.home.nextAppt", { defaultValue: "Next Appt" })}
        </h2>
        {home.nextAppointment ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between bg-slate-50 px-4 py-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                {fmtLongDate(home.nextAppointment.scheduledAt)}
              </p>
              <span
                className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${ STATUS_STYLES[home.nextAppointment.status] ?? "bg-slate-200 text-slate-700 " }`}
              >
                {t(`pages.dashboard.queueStatus.${home.nextAppointment.status}`, {
                  defaultValue: home.nextAppointment.status,
                })}
              </span>
            </div>
            <div className="flex items-center gap-3 p-4">
              <div className="flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                <span className="text-[9px] font-bold uppercase">{t("pages.portal.home.time", { defaultValue: "Time" })}</span>
                <span className="font-black">{home.nextAppointment.localTime}</span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-900">
                  {t("pages.common.drPrefix", { defaultValue: "Dr Prefix" })} {home.nextAppointment.dentistName}
                </p>
                <p className="text-xs text-slate-500">
                  {home.nextAppointment.type?.replace(/_/g, " ") ??
                    t("pages.portal.home.defaultConsultation", { defaultValue: "Default Consultation" })}
                </p>
                {home.nextAppointment.canCancel ? (
                  <Link
                    to={`/${slug}/portal/appointments${kioskSuffix}`}
                    className="mt-1 inline-flex min-h-8 items-center text-[11px] font-bold text-rose-600 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
                  >
                    {t("pages.portal.home.manage", { defaultValue: "Manage" })}
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-6 text-center">
            <p className="text-sm font-semibold text-slate-600">{t("pages.portal.home.noUpcoming", { defaultValue: "No Upcoming" })}</p>
            <Link
              to={`/${slug}/portal/book${kioskSuffix}`}
              className="mt-3 inline-block rounded-xl bg-teal-600 px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-sm hover:brightness-110"
            >
              {t("pages.portal.home.bookNow", { defaultValue: "Book Now" })}
            </Link>
          </div>
        )}
      </section>

      <section className="grid grid-cols-2 gap-3">
        <Link
          to={`/${slug}/portal/book${kioskSuffix}`}
          className="group relative min-h-[88px] overflow-hidden rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
        >
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-teal-100 opacity-60 transition group-hover:scale-125" />
          <p className="relative text-2xl">📅</p>
          <p className="relative mt-2 text-sm font-black text-slate-900">
            {t("pages.portal.home.bookCardTitle", { defaultValue: "Book Card Title" })}
          </p>
          <p className="relative text-[11px] text-slate-500">{t("pages.portal.home.bookCardSub", { defaultValue: "Book Card Sub" })}</p>
        </Link>
        <Link
          to={`/${slug}/portal/history${kioskSuffix}`}
          className="group relative min-h-[88px] overflow-hidden rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
        >
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-sky-100 opacity-60 transition group-hover:scale-125" />
          <p className="relative text-2xl">📝</p>
          <p className="relative mt-2 text-sm font-black text-slate-900">
            {t("pages.portal.home.historyCardTitle", { defaultValue: "History Card Title" })}
          </p>
          <p className="relative text-[11px] text-slate-500">{t("pages.portal.home.historyCardSub", { defaultValue: "History Card Sub" })}</p>
        </Link>
      </section>

      {home.lastInvoice ? (
        <section>
          <h2 className="mb-2 text-[11px] font-black uppercase tracking-widest text-slate-500">
            {t("pages.portal.home.latestBill", { defaultValue: "Latest Bill" })}
          </h2>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-bold text-slate-600">
                {home.lastInvoice.orNumber ?? t("pages.portal.home.draft", { defaultValue: "Draft" })}
              </p>
              <span
                className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${ INVOICE_STATUS_STYLES[home.lastInvoice.status] ?? "bg-slate-200 text-slate-700" }`}
              >
                {t(`pages.patientDetail.invoices.statusLabels.${home.lastInvoice.status}`, {
                  defaultValue: home.lastInvoice.status,
                })}
              </span>
            </div>
            <p className="text-2xl font-black text-slate-900">
              {php.format(Number(home.lastInvoice.total))}
            </p>
            {Number(home.lastInvoice.remaining) > 0 ? (
              <p className="mt-1 text-xs text-rose-700">
                {t("pages.portal.home.remaining", { amount: php.format(Number(home.lastInvoice.remaining)) })}
              </p>
            ) : (
              <p className="mt-1 text-xs text-teal-700">{t("pages.portal.home.paidFull", { defaultValue: "Paid Full" })}</p>
            )}
            <Link
              to={`/${slug}/portal/history${kioskSuffix}`}
              className="mt-3 flex min-h-11 items-center justify-center rounded-xl bg-white py-2.5 text-center text-xs font-black uppercase tracking-wider text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
            >
              {t("pages.portal.home.viewPay", { defaultValue: "View Pay" })}
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}
