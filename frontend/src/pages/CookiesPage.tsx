import { useTranslation } from "react-i18next";

import { MarketingShell } from "../components/marketing/MarketingShell";

export function CookiesPage(): JSX.Element {
  const { t } = useTranslation();
  return (
    <MarketingShell documentTitleKey="pages.cookies.title">
      <article className="prose prose-slate max-w-none dark:prose-invert">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">{t("pages.cookies.title")}</h1>
        <p>{t("pages.cookies.intro")}</p>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t("pages.cookies.s1Title")}</h2>
        <p>{t("pages.cookies.s1Body")}</p>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t("pages.cookies.s2Title")}</h2>
        <p>{t("pages.cookies.s2Body")}</p>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t("pages.cookies.s3Title")}</h2>
        <p>{t("pages.cookies.s3Body")}</p>
      </article>
    </MarketingShell>
  );
}
