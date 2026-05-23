import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { MarketingShell } from "../components/marketing/MarketingShell";

/** Placeholder — gerçek hukuki metin müşteri/avukat onayı ile değişir (`GAP-102`). */
export function PrivacyPage(): JSX.Element {
  const { t } = useTranslation();
  return (
    <MarketingShell documentTitleKey="pages.privacy.title">
      <article className="prose prose-slate max-w-none">
        <p className="not-prose text-sm">
          <Link to="/" className="font-semibold text-teal-600 hover:underline">
            {t("pages.privacy.backHome", { defaultValue: "Back Home" })}
          </Link>
        </p>
        <h1 className="not-prose text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">{t("pages.privacy.title", { defaultValue: "Title" })}</h1>
        <p>{t("pages.privacy.intro", { defaultValue: "Intro" })}</p>
        <ul>
          <li>{t("pages.privacy.bullet1", { defaultValue: "Bullet1" })}</li>
          <li>{t("pages.privacy.bullet2", { defaultValue: "Bullet2" })}</li>
          <li>{t("pages.privacy.bullet3", { defaultValue: "Bullet3" })}</li>
        </ul>
      </article>
    </MarketingShell>
  );
}
