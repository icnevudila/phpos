import React, { useEffect, useRef, useState } from "react";

export function ChartCard({
  title,
  subtitle,
  children,
  right,
  accent = "emerald",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
  accent?: "emerald" | "sky" | "indigo" | "amber";
}): JSX.Element {
  const accentColors: Record<string, string> = {
    emerald: "bg-teal-500",
    sky: "bg-sky-500",
    indigo: "bg-indigo-500",
    amber: "bg-amber-500",
  };
  return (
    <section className="card">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 shrink-0 rounded-full ${accentColors[accent] || "bg-teal-500"}`} />
          <div>
            <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
            {subtitle ? <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p> : null}
          </div>
        </div>
        {right}
      </div>
      <div className="relative overflow-hidden rounded-xl">{children}</div>
    </section>
  );
}

export function ViewportLazy({
  children,
  minHeight = 280,
}: {
  children: React.ReactNode;
  minHeight?: number;
}): JSX.Element {
  const [isVisible, setIsVisible] = useState(false);
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isVisible || !hostRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "220px 0px" },
    );
    observer.observe(hostRef.current);
    return () => observer.disconnect();
  }, [isVisible]);

  return (
    <div ref={hostRef}>
      {isVisible ? (
        children
      ) : (
        <div
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          style={{ minHeight }}
          role="status"
          aria-live="polite"
        >
          <div className="animate-pulse space-y-3">
            <div className="h-3 w-40 rounded bg-slate-200" />
            <div className="h-2 w-56 rounded bg-slate-100" />
            <div className="mt-5 h-44 rounded-xl bg-slate-100" />
          </div>
        </div>
      )}
    </div>
  );
}
