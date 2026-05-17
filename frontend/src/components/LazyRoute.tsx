import { Suspense, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

export function RouteFallback(): JSX.Element {
  const { t } = useTranslation("pages");
  return (
    <div className="flex min-h-[40vh] items-center justify-center p-8">
      <p className="text-sm font-semibold text-slate-500 animate-pulse" role="status" aria-live="polite">
        {t("common.loading", { defaultValue: "Loading…" })}
      </p>
    </div>
  );
}

export function SuspenseRoute({ children }: { children: ReactNode }): JSX.Element {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>;
}
