import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

import { SectionEyebrow } from "./SectionEyebrow";
import { IconGrid } from "./icons/LandingIcons";

interface Row {
  icon: JSX.Element;
  title: string;
  desc: string;
  accent: string;
}

function I({ d }: { d: string }): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d={d} />
    </svg>
  );
}

export function CapabilitiesList(): JSX.Element {
  const { t } = useTranslation();

  const rows: Row[] = [
    {
      icon: <I d="M20 7H4M20 12H4M20 17H10M4 4h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />,
      title: t("landing.cap1Title"),
      desc: t("landing.cap1Desc"),
      accent: "text-teal-600 bg-teal-50 ring-teal-100",
    },
    {
      icon: <I d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2m19-4a4 4 0 0 0-3-7.75M16 3.13a4 4 0 0 1 0 7.75M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />,
      title: t("landing.cap2Title"),
      desc: t("landing.cap2Desc"),
      accent: "text-sky-600 bg-sky-50 ring-sky-100",
    },
    {
      icon: <I d="M14 3h7v7M10 14 21 3M21 14v7h-7M3 10V3h7M3 21l7-7" />,
      title: t("landing.cap3Title"),
      desc: t("landing.cap3Desc"),
      accent: "text-teal-600 bg-teal-50 ring-teal-100",
    },
    {
      icon: <I d="M2 4h20v16H2zM2 9h20M6 14h4M6 17h2" />,
      title: t("landing.cap4Title"),
      desc: t("landing.cap4Desc"),
      accent: "text-amber-600 bg-amber-50 ring-amber-100",
    },
    {
      icon: <I d="M12 22c5.523 0 10-4.477 10-10 0-4.97-3-8-6-8s-4 2-4 4 1 4 3 4c-2 0-4 2-4 4s2 6 6 6M3 10a8 8 0 0 1 8-8" />,
      title: t("landing.cap5Title"),
      desc: t("landing.cap5Desc"),
      accent: "text-rose-600 bg-rose-50 ring-rose-100",
    },
    {
      icon: <I d="M12 8v8M8 12h8M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z" />,
      title: t("landing.cap6Title"),
      desc: t("landing.cap6Desc"),
      accent: "text-indigo-600 bg-indigo-50 ring-indigo-100",
    },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <div>
        <SectionEyebrow label={t("landing.capEyebrow")} icon={IconGrid} accent="emerald" />
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-brand-text sm:text-4xl">
          {t("landing.capTitle")}
        </h2>
        <p className="mt-4 text-brand-muted">{t("landing.capSubtitle")}</p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-surface px-4 py-2 text-xs font-semibold text-white">
          <span className="flex h-2 w-2 items-center justify-center">
            <span className="h-2 w-2 animate-ping rounded-full bg-teal-400 opacity-70" />
            <span className="absolute h-1.5 w-1.5 rounded-full bg-teal-400" />
          </span>
          {t("landing.capCloud")}
        </div>
      </div>

      <div className="relative">
        <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-teal-100/40 to-sky-100/40 blur-2xl" />
        <div className="relative rounded-3xl border border-brand-border bg-brand-surface/90 p-6 shadow-sm backdrop-blur sm:p-8">
          <ul className="divide-y divide-slate-100">
            {rows.map((r, i) => (
              <motion.li
                key={r.title}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${r.accent}`}>
                  {r.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-brand-text">{r.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-brand-muted">{r.desc}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
