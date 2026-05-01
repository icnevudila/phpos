import { useTranslation } from "react-i18next";

import { FAQ } from "../components/landing/FAQ";
import { MarketingShell } from "../components/marketing/MarketingShell";

export function FaqPage(): JSX.Element {
  const { t } = useTranslation();
  return (
    <MarketingShell documentTitleKey="pages.faqPublic.title">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">{t("pages.faqPublic.title")}</h1>
        <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-400">{t("pages.faqPublic.subtitle")}</p>
        <div className="mt-10">
          <FAQ contactHref="/contact" />
        </div>
      </div>
    </MarketingShell>
  );
}
