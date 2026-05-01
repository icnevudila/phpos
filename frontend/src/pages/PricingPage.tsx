import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { PricingTeaser } from "../components/landing/PricingTeaser";
import { MarketingShell } from "../components/marketing/MarketingShell";

export function PricingPage(): JSX.Element {
  const { t } = useTranslation();
  return (
    <MarketingShell documentTitleKey="pages.pricingFull.title">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">{t("pages.pricingFull.title")}</h1>
        <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-400">{t("pages.pricingFull.subtitle")}</p>

        <div className="mt-12">
          <PricingTeaser ctaHref="/contact" />
        </div>

        <div className="not-prose mt-14 rounded-2xl border border-slate-200 bg-slate-50/80 p-6 dark:border-slate-700 dark:bg-slate-900/60 sm:p-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t("pages.pricingFull.afterCardsTitle")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{t("pages.pricingFull.afterCardsBody")}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/contact"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
            >
              {t("pages.pricingFull.ctaContact")}
            </Link>
            <Link
              to="/"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-5 text-sm font-bold text-slate-800 hover:bg-white dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              {t("pages.pricingFull.ctaHome")}
            </Link>
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
