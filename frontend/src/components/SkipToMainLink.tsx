import { useTranslation } from "react-i18next";

/**
 * Tek odaklanabilir “içeriğe atla” bağlantısı — `index.html` + sayfa içi kopyaları
 * çift Tab sırasına neden olmamalı; `main.tsx` içinde bir kez render edin.
 */
export function SkipToMainLink(): JSX.Element {
  const { t } = useTranslation();
  return (
    <a
      href="#main"
      onClick={(e) => {
        e.preventDefault();
        const el = document.getElementById("main");
        if (!el) return;
        el.focus({ preventScroll: true });
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-teal-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
    >
      {t("landing.skipToContent", { defaultValue: "Skip To Content" })}
    </a>
  );
}
