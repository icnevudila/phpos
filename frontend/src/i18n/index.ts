import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import tr from "./locales/tr.json";
import ph from "./locales/ph.json";
import landingPreviewEn from "./locales/landingPreview.en.json";
import landingPreviewTr from "./locales/landingPreview.tr.json";
import landingPreviewPh from "./locales/landingPreview.ph.json";
import { deepMergeLocale } from "./deepMergeLocale";
import pagesEn from "./locales/pages.en.json";
import pagesTr from "./locales/pages.tr.json";
import { phPagesOverlay } from "./phPagesOverlay";

const pagesForPh = deepMergeLocale(
  pagesEn as unknown as Record<string, unknown>,
  phPagesOverlay,
) as unknown as typeof pagesEn;

const STORAGE_KEY = "dentease.lang";

export const SUPPORTED_LANGUAGES = ["en", "tr", "ph"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/** `?lng=` on first load (e.g. SEO alternate links) overrides the saved UI language. */
function applyQueryLanguageOverride(): void {
  try {
    if (typeof window === "undefined") return;
    const raw = new URLSearchParams(window.location.search).get("lng");
    if (!raw) return;
    const code = raw === "fil" ? "ph" : raw;
    if ((SUPPORTED_LANGUAGES as readonly string[]).includes(code)) {
      localStorage.setItem(STORAGE_KEY, code);
    }
  } catch {
    /* ignore */
  }
}

/** Legacy code stored when Filipino used the `fil` language tag. */
function migrateLegacyFilLanguageCode(): void {
  try {
    if (typeof localStorage === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY) === "fil") {
      localStorage.setItem(STORAGE_KEY, "ph");
    }
  } catch {
    /* ignore */
  }
}

/** Removed regional variants — map old picks to `ph`. */
function migrateRemovedRegionalLanguages(): void {
  try {
    if (typeof localStorage === "undefined") return;
    const cur = localStorage.getItem(STORAGE_KEY);
    if (cur === "tl" || cur === "hil") {
      localStorage.setItem(STORAGE_KEY, "ph");
    }
  } catch {
    /* ignore */
  }
}

applyQueryLanguageOverride();
migrateLegacyFilLanguageCode();
migrateRemovedRegionalLanguages();

export function normalizeLanguageTag(tag: string | undefined): SupportedLanguage {
  if (!tag) return "en";
  const base = tag.split("-")[0]?.toLowerCase() ?? "en";
  if (base === "fil") return "ph";
  if (base === "tl" || base === "hil") return "ph";
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(base) ? (base as SupportedLanguage) : "en";
}

function syncDocumentHtmlLang(lng: string): void {
  if (typeof document === "undefined") return;
  const code = normalizeLanguageTag(lng);
  document.documentElement.lang = code === "ph" ? "fil" : code;
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    /** Default UI language: English. tr/ph apply when chosen or stored in localStorage. */
    lng: "en",
    resources: {
      en: { translation: { ...en, ...landingPreviewEn, pages: pagesEn } },
      tr: { translation: { ...tr, ...landingPreviewTr, pages: pagesTr } },
      ph: { translation: { ...ph, ...landingPreviewPh, pages: pagesForPh } },
    },
    fallbackLng: "en",
    supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
    nonExplicitSupportedLngs: true,
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage"],
      caches: ["localStorage"],
      lookupLocalStorage: STORAGE_KEY,
    },
  });

i18n.on("initialized", () => {
  syncDocumentHtmlLang(i18n.resolvedLanguage ?? "en");
});
i18n.on("languageChanged", (lng) => {
  syncDocumentHtmlLang(lng);
});

export default i18n;
