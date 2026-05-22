import React from "react";

const PHP_FULL = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function PremiumTooltip({ active, payload, label }: any): JSX.Element | null {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl border border-white/40 bg-white/80 p-3 shadow-2xl backdrop-blur-md">
        <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p>
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
            <p className="text-sm font-bold text-slate-900">
              {typeof p.value === "number" ? PHP_FULL.format(p.value) : p.value}
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
}
