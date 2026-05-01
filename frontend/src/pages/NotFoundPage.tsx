import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { LanguageSwitcher } from "../components/LanguageSwitcher";

export function NotFoundPage(): JSX.Element {
  const { t } = useTranslation();
  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <div className="absolute right-4 top-4 flex items-center gap-2 sm:right-6 sm:top-6">
        <LanguageSwitcher />
      </div>
      <main
        id="main"
        tabIndex={-1}
        className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center outline-none"
      >
        <h1 className="text-5xl font-bold text-slate-900 dark:text-white">{t("pages.notFound.title")}</h1>
        <p className="max-w-md text-slate-600 dark:text-slate-400">{t("pages.notFound.message")}</p>
        <Link
          to="/"
          className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:ring-offset-slate-950"
        >
          {t("pages.notFound.backHome")}
        </Link>
      </main>
    </div>
  );
}
