import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";

import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { resolveClinic, type PortalClinic } from "../portal/services/portalApi";

/**
 * Şube kiosk girişi — tek cihaz = tek slug.
 * Hasta: portal OTP (randevu / kayıt akışı). Personel: staff login → randevular.
 */
export function KioskHomePage(): JSX.Element {
  const { slug = "" } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [clinic, setClinic] = useState<PortalClinic | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoadError(false);
    void resolveClinic(slug)
      .then((c) => {
        if (alive) setClinic(c);
      })
      .catch(() => {
        if (alive) setLoadError(true);
      });
    return () => {
      alive = false;
    };
  }, [slug]);

  useEffect(() => {
    if (clinic) {
      document.title = `${clinic.name} · ${t("pages.kiosk.documentTitleSuffix")}`;
    }
  }, [clinic, t]);

  const shell =
    "relative flex min-h-[100dvh] flex-col bg-gradient-to-b from-slate-100 via-white to-slate-50 text-slate-900 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:text-slate-100";

  if (loadError) {
    return (
      <div className={shell}>
        <div className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-10">
          <LanguageSwitcher />
        </div>
        <main
          id="main"
          tabIndex={-1}
          className="flex flex-1 flex-col items-center justify-center px-6 pb-16 pt-24 text-center outline-none"
        >
          <h1 className="text-xl font-bold text-rose-700 dark:text-rose-400">{t("pages.kiosk.errorTitle")}</h1>
          <p className="mt-3 max-w-md text-sm text-slate-600 dark:text-slate-300">{t("pages.kiosk.errorBody")}</p>
          <Link
            to="/"
            className="mt-8 inline-flex min-h-12 min-w-[12rem] items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-950"
          >
            {t("pages.kiosk.backMarketing")}
          </Link>
        </main>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className={shell}>
        <div className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-10">
          <LanguageSwitcher />
        </div>
        <main id="main" tabIndex={-1} className="flex flex-1 items-center justify-center px-6 outline-none">
          <p className="text-base font-medium text-slate-500">{t("pages.kiosk.loading")}</p>
        </main>
      </div>
    );
  }

  /** Kiosk’tan gelindiğinde portal kabuğu daha geniş tip ve `max-w` kullanır (`PortalLayout`). */
  const portalLogin = `/${encodeURIComponent(slug)}/portal/login?kiosk=1`;

  return (
    <div className={shell}>
      <header className="flex items-center justify-between gap-3 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-600 text-lg font-black text-white shadow-md">
            {clinic.name[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-sky-700 dark:text-sky-400">{t("pages.kiosk.badge")}</p>
            <p className="truncate text-lg font-bold text-slate-900 dark:text-slate-100 sm:text-xl">{clinic.name}</p>
          </div>
        </div>
        <LanguageSwitcher className="shrink-0" />
      </header>

      <main
        id="main"
        tabIndex={-1}
        className="mx-auto flex w-full min-w-0 max-w-lg flex-1 flex-col justify-center gap-6 px-4 py-10 outline-none sm:max-w-2xl sm:gap-8 sm:px-6 sm:py-12"
      >
        <div className="text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">{t("pages.kiosk.title")}</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">
            {t("pages.kiosk.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          <Link
            to={portalLogin}
            className="group flex min-h-[8.5rem] flex-col justify-between rounded-3xl border-2 border-sky-200 bg-white p-6 shadow-md transition hover:border-sky-400 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:border-sky-800 dark:bg-slate-900 dark:hover:border-sky-600 dark:focus-visible:ring-offset-slate-950 sm:min-h-44 sm:p-7"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">{t("pages.kiosk.patientKicker")}</p>
              <p className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100 sm:text-xl">{t("pages.kiosk.patientTitle")}</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{t("pages.kiosk.patientDesc")}</p>
            </div>
            <span className="mt-4 inline-flex items-center text-sm font-bold text-sky-700 dark:text-sky-300">
              {t("pages.kiosk.patientCta")}
              <span className="ml-1 transition group-hover:translate-x-0.5" aria-hidden>
                →
              </span>
            </span>
          </Link>

          <button
            type="button"
            onClick={() =>
              void navigate("/login", {
                state: { from: { pathname: "/appointments" } },
              })
            }
            className="group flex min-h-[8.5rem] flex-col justify-between rounded-3xl border-2 border-emerald-200 bg-white p-6 text-left shadow-md transition hover:border-emerald-400 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:border-emerald-800 dark:bg-slate-900 dark:hover:border-emerald-600 dark:focus-visible:ring-offset-slate-950 sm:min-h-44 sm:p-7"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">{t("pages.kiosk.staffKicker")}</p>
              <p className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100 sm:text-xl">{t("pages.kiosk.staffTitle")}</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{t("pages.kiosk.staffDesc")}</p>
            </div>
            <span className="mt-4 inline-flex items-center text-sm font-bold text-emerald-700 dark:text-emerald-300">
              {t("pages.kiosk.staffCta")}
              <span className="ml-1 transition group-hover:translate-x-0.5" aria-hidden>
                →
              </span>
            </span>
          </button>
        </div>

        <p className="text-center text-xs leading-relaxed text-slate-500 dark:text-slate-400 sm:text-sm">{t("pages.kiosk.footerHint")}</p>

        <div className="flex justify-center pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-sm font-semibold text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:text-slate-400 dark:hover:text-slate-200 dark:focus-visible:ring-offset-slate-950"
          >
            {t("pages.kiosk.backMarketing")}
          </Link>
        </div>
      </main>
    </div>
  );
}
