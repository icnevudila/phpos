import React from "react";

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent: "emerald" | "teal" | "amber" | "slate" | "indigo" | "rose";
  icon?: React.ReactNode;
}

export function MetricCard({
  label,
  value,
  sub,
  accent,
  icon,
}: MetricCardProps): JSX.Element {
  const palettes: Record<
    typeof accent,
    { iconBg: string; iconText: string }
  > = {
    emerald: { iconBg: "bg-teal-100", iconText: "text-teal-700" },
    teal: { iconBg: "bg-teal-100", iconText: "text-teal-700" },
    amber: { iconBg: "bg-amber-100", iconText: "text-amber-700" },
    indigo: { iconBg: "bg-sky-100", iconText: "text-sky-700" },
    rose: { iconBg: "bg-rose-100", iconText: "text-rose-700" },
    slate: { iconBg: "bg-slate-100", iconText: "text-slate-700" },
  };

  const p = palettes[accent];

  return (
    <div className="stat-card h-full transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <p className="stat-card-label">{label}</p>
        {icon ? (
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${p.iconBg} ${p.iconText}`}
          >
            {icon}
          </div>
        ) : null}
      </div>
      <p className="stat-card-value mt-1">{value}</p>
      {sub ? <p className="mt-1 text-xs font-medium text-slate-500">{sub}</p> : null}
    </div>
  );
}
