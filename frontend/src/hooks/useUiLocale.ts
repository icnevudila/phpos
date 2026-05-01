import { useTranslation } from "react-i18next";

import { normalizeLanguageTag, type SupportedLanguage } from "../i18n";

/** Tarih/sayı için `Intl` yerel ayarı — Türkçe UI’da `tr-TR`, diğerlerinde `en-PH`. */
export function useUiLocale(): string {
  const { i18n } = useTranslation();
  const base = normalizeLanguageTag(i18n.resolvedLanguage) as SupportedLanguage;
  if (base === "tr") return "tr-TR";
  return "en-PH";
}
