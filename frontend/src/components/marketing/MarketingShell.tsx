import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

import { LanguageSwitcher } from "../LanguageSwitcher";
import { PORTAL_DEMO_SLUG } from "../../constants/portal";

function LogoMark(): JSX.Element {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 text-white shadow-md">
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M12 2a5 5 0 0 0-5 5c0 2 1 3 1 5s-1 4-1 6a3 3 0 0 0 6 0c0-1 .5-1 1-1s1 0 1 1a3 3 0 0 0 6 0c0-2-1-4-1-6s1-3 1-5a5 5 0 0 0-5-5c-1 0-2 .5-2 1s-1 1-2 1-1-.5-2-1-1-1-2-1Z" />
      </svg>
    </div>
  );
}

const NAV: { to: string; labelKey: string; externalHash?: boolean }[] = [
  { to: "/#features", labelKey: "pages.marketingShell.navFeatures", externalHash: true },
  { to: "/pricing", labelKey: "pages.marketingShell.navPricing" },
  { to: "/#how", labelKey: "pages.marketingShell.navHow", externalHash: true },
  { to: "/faq", labelKey: "pages.marketingShell.navFaq" },
  { to: "/about", labelKey: "pages.marketingShell.navAbout" },
  { to: "/contact", labelKey: "pages.marketingShell.navContact" },
];

function NavLink({
  to,
  label,
  active,
  onClick,
  isHash,
}: {
  to: string;
  label: string;
  active: boolean;
  onClick?: () => void;
  isHash?: boolean;
}): JSX.Element {
  const cls = `block min-h-11 rounded-xl px-3 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 ${
    active
      ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100"
      : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
  }`;
  if (isHash) {
    return (
      <a href={to} className={cls} onClick={onClick}>
        {label}
      </a>
    );
  }
  return (
    <Link to={to} className={cls} onClick={onClick}>
      {label}
    </Link>
  );
}

export function MarketingShell({
  children,
  documentTitleKey,
  documentTitleDefault,
}: {
  children: React.ReactNode;
  /** i18n key for `document.title` (optional) */
  documentTitleKey?: string;
  documentTitleDefault?: string;
}): JSX.Element {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (documentTitleKey) {
      document.title = `${t(documentTitleKey)} · ${t("common.appName")}`;
    } else if (documentTitleDefault) {
      document.title = `${documentTitleDefault} · ${t("common.appName")}`;
    }
  }, [documentTitleKey, documentTitleDefault, t]);

  return (
    <div className="relative min-h-[100dvh] bg-gradient-to-b from-emerald-50/90 via-white to-slate-50 text-slate-800 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 dark:text-slate-200">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
        <div
          className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-3.5"
          style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
        >
          <Link
            to="/"
            className="flex min-h-11 min-w-0 items-center gap-2 rounded-xl pr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
          >
            <LogoMark />
            <div className="min-w-0">
              <span className="block truncate text-base font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-lg">
                Dent<span className="bg-gradient-to-br from-emerald-500 to-sky-500 bg-clip-text text-transparent">Ease</span>
              </span>
              <span className="hidden text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 sm:block">
                {t("landing.brandSubLabel")}
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex" aria-label={t("pages.marketingShell.navAria")}>
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                label={t(item.labelKey)}
                active={
                  !item.externalHash &&
                  (pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to)))
                }
                isHash={item.externalHash}
              />
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <LanguageSwitcher />
            <Link
              to={`/${PORTAL_DEMO_SLUG}/portal/login`}
              className="hidden min-h-11 max-w-[7.5rem] items-center truncate rounded-lg px-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40 sm:inline-flex sm:max-w-none sm:px-3 sm:text-sm"
            >
              {t("landing.navPatientPortal")}
            </Link>
            <Link
              to="/login"
              className="hidden min-h-11 items-center rounded-lg bg-slate-900 px-3 text-xs font-bold text-white shadow-sm hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 sm:inline-flex sm:px-4 sm:text-sm"
            >
              {t("landing.navSignIn")}
            </Link>
            <button
              type="button"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 lg:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              aria-expanded={menuOpen}
              aria-controls="marketing-menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className="sr-only">{menuOpen ? t("pages.marketingShell.menuClose") : t("pages.marketingShell.menuOpen")}</span>
              {menuOpen ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5" aria-hidden>
                  <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div
            id="marketing-menu"
            className="border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950 lg:hidden"
          >
            <div className="mx-auto flex max-w-6xl flex-col gap-1">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  label={t(item.labelKey)}
                  active={!item.externalHash && pathname === item.to}
                  isHash={item.externalHash}
                  onClick={() => setMenuOpen(false)}
                />
              ))}
              <Link
                to={`/${PORTAL_DEMO_SLUG}/portal/login`}
                className="min-h-11 rounded-xl px-3 py-2.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400"
                onClick={() => setMenuOpen(false)}
              >
                {t("landing.navPatientPortal")}
              </Link>
              <Link
                to="/login"
                className="min-h-11 rounded-xl bg-slate-900 px-3 py-2.5 text-center text-sm font-bold text-white dark:bg-white dark:text-slate-900"
                onClick={() => setMenuOpen(false)}
              >
                {t("landing.navSignIn")}
              </Link>
              <div className="flex justify-end border-t border-slate-100 pt-2 dark:border-slate-800">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        ) : null}
      </header>

      <main id="main" tabIndex={-1} className="mx-auto max-w-3xl px-4 py-8 outline-none sm:px-6 sm:py-12 lg:py-14">
        {children}
      </main>

      <footer className="mt-auto border-t border-slate-200 bg-white/80 py-10 dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-2">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{t("common.appName")}</p>
              <p className="mt-2 max-w-md text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {t("pages.marketingShell.footerTagline")}
              </p>
              <p className="mt-3 max-w-md text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {t("landing.footerLegalIntro")}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t("landing.footerCompany")}
              </p>
              <p className="mt-2 max-w-xs text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {t("landing.footerCompanyIntro")}
              </p>
              <ul className="mt-3 space-y-1">
                <li>
                  <Link
                    to="/about"
                    className="flex min-h-10 items-center rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-white"
                  >
                    {t("landing.footerAbout")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="flex min-h-10 items-center rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-white"
                  >
                    {t("landing.footerContactQuotes")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/#security"
                    className="flex min-h-10 items-center rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-white"
                  >
                    {t("landing.footerSecurityOverview")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login"
                    className="flex min-h-10 items-center rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-white"
                  >
                    {t("landing.footerStaffSignIn")}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t("landing.footerLegal")}
              </p>
              <ul className="mt-3 space-y-1">
                <li>
                  <Link
                    to="/privacy"
                    className="flex min-h-10 items-center rounded-lg text-sm font-medium text-sky-700 hover:bg-sky-50 hover:underline dark:text-sky-400 dark:hover:bg-sky-950/30"
                  >
                    {t("landing.footerPrivacy")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="flex min-h-10 items-center rounded-lg text-sm font-medium text-sky-700 hover:bg-sky-50 hover:underline dark:text-sky-400 dark:hover:bg-sky-950/30"
                  >
                    {t("landing.footerTerms")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/cookies"
                    className="flex min-h-10 items-center rounded-lg text-sm font-medium text-sky-700 hover:bg-sky-50 hover:underline dark:text-sky-400 dark:hover:bg-sky-950/30"
                  >
                    {t("landing.footerCookies")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between dark:text-slate-400">
            <Link to="/" className="min-h-10 font-medium text-slate-600 hover:underline dark:text-slate-300">
              {t("pages.marketingShell.navHome")}
            </Link>
            <p className="text-xs">{t("landing.footerCopyright", { year: new Date().getFullYear() })}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
