import { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link, NavLink, Outlet, useNavigate, useParams } from "react-router-dom";

import { LanguageSwitcher } from "../components/LanguageSwitcher";
import {
  clearPortalSession,
  hasPortalToken,
  loadPortalPatient,
  resolveClinic,
  type PortalClinic,
  type PortalPatient,
} from "./services/portalApi";
import { usePortalKioskSuffix } from "./usePortalKioskSuffix";

interface PortalContext {
  clinic: PortalClinic;
  patient: PortalPatient | null;
  slug: string;
  requireAuth: boolean;
  /** URL `?kiosk=1` — tablet/kiosk için daha geniş kabuk */
  kiosk: boolean;
}

export function PortalLayout(): JSX.Element {
  const { t } = useTranslation();
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const kioskQuery = usePortalKioskSuffix();
  const isKiosk = kioskQuery.length > 0;
  const [clinic, setClinic] = useState<PortalClinic | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [patient, setPatient] = useState<PortalPatient | null>(loadPortalPatient());

  useEffect(() => {
    let mounted = true;
    setLoadError(false);
    resolveClinic(slug)
      .then((c) => {
        if (!mounted) return;
        setClinic(c);
      })
      .catch(() => {
        if (!mounted) return;
        setLoadError(true);
      });
    return () => {
      mounted = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!clinic) return;
    document.title = `${clinic.name} · ${t("portal.patientPortal")}`;
  }, [clinic, t]);

  function onLogout(): void {
    clearPortalSession();
    setPatient(null);
    navigate(`/${slug}/portal/login${kioskQuery}`, { replace: true });
  }

  if (loadError) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="absolute right-4 top-4">
          <LanguageSwitcher />
        </div>
        <div className="rounded-2xl bg-white p-6 text-center shadow-md">
          <h1 className="text-lg font-bold text-rose-700">{t("portal.errorTitle")}</h1>
          <p className="mt-2 text-sm text-slate-600">
            <Trans i18nKey="portal.errorBody" values={{ slug }} />
          </p>
          <Link
            to="/"
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg text-sm font-bold text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
          >
            {t("portal.goHome")}
          </Link>
        </div>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-slate-100">
        <div className="absolute right-4 top-4">
          <LanguageSwitcher />
        </div>
        <p className="text-sm text-slate-500">{t("portal.loading")}</p>
      </div>
    );
  }

  const context: PortalContext = {
    clinic,
    patient,
    slug,
    requireAuth: hasPortalToken(),
    kiosk: isKiosk,
  };

  const isLogin =
    typeof window !== "undefined" && window.location.pathname.endsWith("/portal/login");

  return (
    <div
      className={`flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-white ${ isKiosk ? "text-[16px] sm:text-[17px]" : "" }`}
    >
      <div
        className={`relative mx-auto flex w-full min-w-0 flex-1 flex-col bg-white shadow-xl ${ isKiosk ? "max-w-2xl" : "max-w-md sm:max-w-lg" }`}
      >
        <header className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-500 text-sm font-black text-white shadow-sm">
              {clinic.name[0]}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600">
                {t("common.appName")}
              </p>
              <p className="truncate text-sm font-bold text-slate-800">{clinic.name}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <LanguageSwitcher className="[&_select]:max-w-[9rem] [&_select]:text-[11px] [&_select]:py-0.5" />
            {patient && !isLogin ? (
              <button
                type="button"
                onClick={onLogout}
                className="min-h-9 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
              >
                {t("portal.logout")}
              </button>
            ) : null}
          </div>
        </header>

        <main
          id="main"
          tabIndex={-1}
          className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden pb-24 outline-none focus-visible:ring-2 focus-visible:ring-teal-500/30 focus-visible:ring-inset"
        >
          <Outlet context={context} />
        </main>

        {!isLogin && patient ? <BottomNav slug={slug} kioskQuery={kioskQuery} /> : null}
      </div>
    </div>
  );
}

function BottomNav({ slug, kioskQuery }: { slug: string; kioskQuery: string }): JSX.Element {
  const { t } = useTranslation();
  const base = `/${slug}/portal`;
  const q = kioskQuery;
  const items = [
    { to: `${base}/home${q}`, labelKey: "portal.home" as const, icon: "🏠" },
    { to: `${base}/book${q}`, labelKey: "portal.book" as const, icon: "📅" },
    { to: `${base}/appointments${q}`, labelKey: "portal.myAppointments" as const, icon: "📋" },
    { to: `${base}/history${q}`, labelKey: "portal.history" as const, icon: "📝" },
  ];
  return (
    <nav
      className={`pointer-events-auto fixed bottom-0 left-1/2 z-30 w-full -translate-x-1/2 border-t border-slate-200 bg-white/95 backdrop-blur ${ q ? "max-w-2xl" : "max-w-md sm:max-w-lg" }`}
    >
      <ul className="grid grid-cols-4">
        {items.map((it) => (
          <li key={it.to}>
            <NavLink
              to={it.to}
              className={({ isActive }) =>
                `flex min-h-[52px] flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500 ${
                  isActive ? "text-teal-700 " : "text-slate-500 hover:text-teal-700  "
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-lg ${ isActive ? "bg-teal-100 " : "" }`}
                  >
                    {it.icon}
                  </span>
                  <span>{t(it.labelKey)}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
