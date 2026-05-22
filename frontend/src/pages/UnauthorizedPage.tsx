import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { LanguageSwitcher } from "../components/LanguageSwitcher";

export function UnauthorizedPage(): JSX.Element {
  const { t } = useTranslation();
  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50">
      <div className="absolute right-4 top-4 flex items-center gap-2 sm:right-6 sm:top-6">
        <LanguageSwitcher />
      </div>
      <main
        id="main"
        tabIndex={-1}
        className="flex flex-1 flex-col items-center justify-center gap-5 px-4 py-16 text-center outline-none"
      >
        <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">403</p>
        <h1 className="text-3xl font-bold text-slate-900">{t("pages.unauthorized.title")}</h1>
        <p className="max-w-md text-slate-600">{t("pages.unauthorized.message")}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/login"
            className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
          >
            {t("pages.unauthorized.backToLogin")}
          </Link>
          <Link
            to="/"
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
          >
            {t("pages.unauthorized.goHome")}
          </Link>
        </div>
      </main>
    </div>
  );
}
