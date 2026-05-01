import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { MarketingShell } from "../components/marketing/MarketingShell";

export function TermsPage(): JSX.Element {
  const { t } = useTranslation();
  return (
    <MarketingShell documentTitleKey="pages.terms.title">
      <article className="prose prose-slate max-w-none dark:prose-invert">
        <p className="not-prose text-sm">
          <Link to="/" className="font-semibold text-sky-600 hover:underline dark:text-sky-400">
            {t("pages.terms.backHome")}
          </Link>
        </p>
        <h1 className="not-prose text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">{t("pages.terms.title")}</h1>
        <p>{t("pages.terms.intro")}</p>
      </article>
    </MarketingShell>
  );
}
