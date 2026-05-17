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
    emerald: "bg-emerald-500",
    sky: "bg-sky-500",
    indigo: "bg-indigo-500",
    amber: "bg-amber-500",
  };
  return (
    <section className="group relative rounded-[3rem] border border-white bg-white/50 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.03)] backdrop-blur-2xl transition-all duration-500 hover:shadow-[0_30px_90px_rgba(0,0,0,0.06)] dark:border-slate-800 dark:bg-slate-950/40">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-2.5 w-2.5 rounded-full ${accentColors[accent] || "bg-emerald-500"} animate-pulse`} />
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">{title}</h3>
            {subtitle ? <p className="mt-0.5 text-sm font-bold text-slate-700 dark:text-slate-300">{subtitle}</p> : null}
          </div>
        </div>
        {right}
      </div>
      <div className="relative overflow-hidden rounded-3xl">{children}</div>
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
          className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-sm"
          style={{ minHeight }}
          role="status"
          aria-live="polite"
        >
          <div className="animate-pulse space-y-3">
            <div className="h-3 w-40 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-2 w-56 rounded bg-slate-100 dark:bg-slate-800/50" />
            <div className="mt-5 h-44 rounded-xl bg-slate-100 dark:bg-slate-800/50" />
          </div>
        </div>
      )}
    </div>
  );
}
