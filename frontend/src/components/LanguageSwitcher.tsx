import { useTranslation } from "react-i18next";

import { normalizeLanguageTag, SUPPORTED_LANGUAGES, type SupportedLanguage } from "../i18n";

const FLAGS: Record<SupportedLanguage, string> = {
  en: "🇺🇸",
  tr: "🇹🇷",
  ph: "🇵🇭",
};

export function LanguageSwitcher({ className = "" }: { className?: string }): JSX.Element {
  const { i18n, t } = useTranslation();
  const current = normalizeLanguageTag(i18n.resolvedLanguage);

  return (
    <label className={`inline-flex items-center gap-2 text-sm ${className}`}>
      <span className="sr-only">{t("language.label")}</span>
      <select
        value={current}
        onChange={(e) => void i18n.changeLanguage(e.target.value)}
        className="max-w-[11rem] rounded-lg border border-slate-300 bg-white/80 px-2 py-1 text-sm font-medium text-slate-700 shadow-sm backdrop-blur hover:bg-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:max-w-none dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-100"
      >
        {SUPPORTED_LANGUAGES.map((lng) => (
          <option key={lng} value={lng}>
            {FLAGS[lng]} {t(`language.${lng}`)}
          </option>
        ))}
      </select>
    </label>
  );
}
