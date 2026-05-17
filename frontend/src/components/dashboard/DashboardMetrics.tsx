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
  const palettes: Record<typeof accent, { bg: string; text: string; iconBg: string }> = {
    emerald: { bg: "from-emerald-500/10 to-teal-500/5", text: "text-emerald-600", iconBg: "bg-emerald-500/10" },
    teal: { bg: "from-teal-500/10 to-cyan-500/5", text: "text-teal-600", iconBg: "bg-teal-500/10" },
    amber: { bg: "from-amber-500/10 to-orange-500/5", text: "text-amber-600", iconBg: "bg-amber-500/10" },
    indigo: { bg: "from-indigo-500/10 to-sky-500/5", text: "text-indigo-600", iconBg: "bg-indigo-500/10" },
    rose: { bg: "from-rose-500/10 to-pink-500/5", text: "text-rose-600", iconBg: "bg-rose-500/10" },
    slate: { bg: "from-slate-500/10 to-slate-400/5", text: "text-slate-600", iconBg: "bg-slate-500/10" },
  };
  const p = palettes[accent];
  return (
    <div
      className="group relative overflow-hidden rounded-[2.5rem] border border-white bg-white/60 p-7 shadow-[0_20px_50px_rgba(0,0,0,0.02)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] dark:border-slate-800 dark:bg-slate-900/60"
    >
      <div className={`absolute -right-6 -top-6 h-32 w-32 rounded-full bg-gradient-to-br ${p.bg} opacity-40 transition-transform duration-700 group-hover:scale-125`} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{label}</p>
           {icon && <div className={`h-8 w-8 rounded-xl ${p.iconBg} flex items-center justify-center`}>{icon}</div>}
        </div>
        <div className="flex items-end gap-2">
           <p className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">{value}</p>
        </div>
        {sub ? <p className={`mt-2 text-xs font-bold ${p.text}`}>{sub}</p> : null}
      </div>
    </div>
  );
}
