import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { MarketingShell } from "../components/marketing/MarketingShell";

/** Placeholder — gerçek hukuki metin müşteri/avukat onayı ile değişir (`GAP-102`). */
export function PrivacyPage(): JSX.Element {
  const { t } = useTranslation();
  return (
    <MarketingShell documentTitleKey="pages.privacy.title">
      <article className="prose prose-slate max-w-none dark:prose-invert">
        <p className="not-prose text-sm">
          <Link to="/" className="font-semibold text-sky-600 hover:underline dark:text-sky-400">
            {t("pages.privacy.backHome")}
          </Link>
        </p>
        <h1 className="not-prose text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">{t("pages.privacy.title")}</h1>
        <p>{t("pages.privacy.intro")}</p>
        <ul>
          <li>{t("pages.privacy.bullet1")}</li>
          <li>{t("pages.privacy.bullet2")}</li>
          <li>{t("pages.privacy.bullet3")}</li>
        </ul>
      </article>
    </MarketingShell>
  );
}
