import { useTranslation } from "react-i18next";

import { MarketingShell } from "../components/marketing/MarketingShell";

export function CookiesPage(): JSX.Element {
  const { t } = useTranslation();
  return (
    <MarketingShell documentTitleKey="pages.cookies.title">
      <article className="prose prose-slate max-w-none">
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">{t("pages.cookies.title", { defaultValue: "Title" })}</h1>
        <p>{t("pages.cookies.intro", { defaultValue: "Intro" })}</p>
        <h2 className="text-xl font-bold text-slate-800">{t("pages.cookies.s1Title", { defaultValue: "S1 Title" })}</h2>
        <p>{t("pages.cookies.s1Body", { defaultValue: "S1 Body" })}</p>
        <h2 className="text-xl font-bold text-slate-800">{t("pages.cookies.s2Title", { defaultValue: "S2 Title" })}</h2>
        <p>{t("pages.cookies.s2Body", { defaultValue: "S2 Body" })}</p>
        <h2 className="text-xl font-bold text-slate-800">{t("pages.cookies.s3Title", { defaultValue: "S3 Title" })}</h2>
        <p>{t("pages.cookies.s3Body", { defaultValue: "S3 Body" })}</p>
      </article>
    </MarketingShell>
  );
}
