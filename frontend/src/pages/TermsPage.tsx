import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { MarketingShell } from "../components/marketing/MarketingShell";

export function TermsPage(): JSX.Element {
  const { t } = useTranslation();
  return (
    <MarketingShell documentTitleKey="pages.terms.title">
      <article className="prose prose-slate max-w-none">
        <p className="not-prose text-sm">
          <Link to="/" className="font-semibold text-teal-600 hover:underline">
            {t("pages.terms.backHome", { defaultValue: "Back Home" })}
          </Link>
        </p>
        <h1 className="not-prose text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">{t("pages.terms.title", { defaultValue: "Title" })}</h1>
        <p>{t("pages.terms.intro", { defaultValue: "Intro" })}</p>
      </article>
    </MarketingShell>
  );
}
