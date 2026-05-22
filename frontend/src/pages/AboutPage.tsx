import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { MarketingShell } from "../components/marketing/MarketingShell";

export function AboutPage(): JSX.Element {
  const { t } = useTranslation();
  return (
    <MarketingShell documentTitleKey="pages.about.title">
      <article className="prose prose-slate max-w-none prose-headings:scroll-mt-24 prose-p:leading-relaxed prose-li:marker:text-teal-500">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{t("pages.about.title")}</h1>
        <p className="text-lg text-slate-600">{t("pages.about.subtitle")}</p>
        <p className="text-slate-700">{t("pages.about.lead")}</p>

        <h2 className="mt-10 text-xl font-bold text-slate-900">{t("pages.about.missionTitle")}</h2>
        <p>{t("pages.about.missionBody")}</p>

        <h2 className="mt-10 text-xl font-bold text-slate-900">{t("pages.about.pillarsTitle")}</h2>
        <ul className="space-y-4">
          <li>
            <strong className="text-slate-900">{t("pages.about.pillar1Title")}</strong>
            <span> — {t("pages.about.pillar1Body")}</span>
          </li>
          <li>
            <strong className="text-slate-900">{t("pages.about.pillar2Title")}</strong>
            <span> — {t("pages.about.pillar2Body")}</span>
          </li>
          <li>
            <strong className="text-slate-900">{t("pages.about.pillar3Title")}</strong>
            <span> — {t("pages.about.pillar3Body")}</span>
          </li>
        </ul>

        <h2 className="mt-10 text-xl font-bold text-slate-900">{t("pages.about.trustTitle")}</h2>
        <p>{t("pages.about.trustBody")}</p>

        <div className="not-prose mt-10 flex flex-col gap-3 rounded-2xl border border-teal-200 bg-teal-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold text-slate-900">{t("pages.about.ctaTitle")}</p>
            <p className="mt-1 text-sm text-slate-600">{t("pages.about.ctaBody")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/login"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-4 text-sm font-bold text-white hover:bg-slate-800"
            >
              {t("pages.about.ctaStaff")}
            </Link>
            <Link
              to="/contact"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-4 text-sm font-bold text-slate-800 hover:bg-white"
            >
              {t("pages.about.ctaContact")}
            </Link>
          </div>
        </div>
      </article>
    </MarketingShell>
  );
}
