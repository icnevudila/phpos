import { useTranslation } from "react-i18next";

/** Staff kabuğu: `/auth/me` ve ilk boyama sırasında boş sayfa yerine */
export function AppShellLoading(): JSX.Element {
  const { t } = useTranslation();
  return (
    <div
      className="flex min-h-[min(60vh,32rem)] flex-col items-center justify-center gap-6 px-6 py-16"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-900/20">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-10 w-10 text-white" aria-hidden>
          <path d="M12 2a5 5 0 0 0-5 5c0 2 1 3 1 5s-1 4-1 6a3 3 0 0 0 6 0c0-1 .5-1 1-1s1 0 1 1a3 3 0 0 0 6 0c0-2-1-4-1-6s1-3 1-5a5 5 0 0 0-5-5c-1 0-2 .5-2 1s-1 1-2 1-1-.5-2-1-1-1-2-1Z" />
        </svg>
        <span className="absolute inset-0 rounded-2xl border-2 border-white/30 animate-ping opacity-40" />
      </div>
      <div className="text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">{t("common.appName")}</p>
        <p className="mt-2 text-base font-semibold text-slate-700 dark:text-slate-200">{t("common.preparingWorkspace")}</p>
      </div>
      <div className="flex gap-1.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full bg-emerald-500/80 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
