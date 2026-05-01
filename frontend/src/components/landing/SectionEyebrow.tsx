import type { ComponentType, SVGProps } from "react";

type AccentKey =
  | "emerald"
  | "sky"
  | "violet"
  | "amber"
  | "rose"
  | "slate"
  | "indigo";

type Props = {
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  accent?: AccentKey;
  align?: "left" | "center";
};

const ACCENTS: Record<
  AccentKey,
  { iconBg: string; iconText: string; ring: string; dotBg: string }
> = {
  emerald: {
    iconBg: "from-emerald-500 to-teal-500",
    iconText: "text-white",
    ring: "ring-emerald-100 dark:ring-emerald-900/50",
    dotBg: "bg-emerald-500/80",
  },
  sky: {
    iconBg: "from-sky-500 to-blue-500",
    iconText: "text-white",
    ring: "ring-sky-100 dark:ring-sky-900/50",
    dotBg: "bg-sky-500/80",
  },
  violet: {
    iconBg: "from-violet-500 to-fuchsia-500",
    iconText: "text-white",
    ring: "ring-violet-100 dark:ring-violet-900/50",
    dotBg: "bg-violet-500/80",
  },
  amber: {
    iconBg: "from-amber-500 to-orange-500",
    iconText: "text-white",
    ring: "ring-amber-100 dark:ring-amber-900/50",
    dotBg: "bg-amber-500/80",
  },
  rose: {
    iconBg: "from-rose-500 to-pink-500",
    iconText: "text-white",
    ring: "ring-rose-100 dark:ring-rose-900/50",
    dotBg: "bg-rose-500/80",
  },
  slate: {
    iconBg: "from-slate-700 to-slate-900",
    iconText: "text-white",
    ring: "ring-slate-200 dark:ring-slate-800",
    dotBg: "bg-slate-500/80",
  },
  indigo: {
    iconBg: "from-indigo-500 to-violet-500",
    iconText: "text-white",
    ring: "ring-indigo-100 dark:ring-indigo-900/50",
    dotBg: "bg-indigo-500/80",
  },
};

export function SectionEyebrow({
  label,
  icon: Icon,
  accent = "emerald",
  align = "left",
}: Props): JSX.Element {
  const a = ACCENTS[accent];
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 py-1 pl-1 pr-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] backdrop-blur-md dark:border-slate-800/70 dark:bg-slate-900/60 ${
        align === "center" ? "mx-auto" : ""
      }`}
    >
      <span
        className={`inline-flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br ${a.iconBg} ${a.iconText} ring-1 ${a.ring} shadow-sm`}
      >
        <Icon className="h-3 w-3" />
      </span>
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-700 dark:text-slate-300">
        {label}
      </span>
    </div>
  );
}
