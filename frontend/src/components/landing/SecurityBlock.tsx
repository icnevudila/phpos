import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

import { SectionEyebrow } from "./SectionEyebrow";
import { IconShield } from "./icons/LandingIcons";

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

export function SecurityBlock(): JSX.Element {
  const { t } = useTranslation();

  const items = [
    {
      icon: <I d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />,
      title: t("landing.sec1Title"),
      desc: t("landing.sec1Desc"),
      accent: "from-emerald-400 to-teal-500",
    },
    {
      icon: <I d="M16 11V7a4 4 0 1 0-8 0v4m-3 0h14v10H5zM12 15v3" />,
      title: t("landing.sec2Title"),
      desc: t("landing.sec2Desc"),
      accent: "from-sky-400 to-indigo-500",
    },
    {
      icon: <I d="M3 3h18v4H3zm0 7h18v4H3zm0 7h18v4H3zM7 5h.01M7 12h.01M7 19h.01" />,
      title: t("landing.sec3Title"),
      desc: t("landing.sec3Desc"),
      accent: "from-violet-400 to-fuchsia-500",
    },
    {
      icon: <I d="M12 2a10 10 0 1 0 10 10h-10V2zM12 2v10l8.66 5" />,
      title: t("landing.sec4Title"),
      desc: t("landing.sec4Desc"),
      accent: "from-amber-400 to-orange-500",
    },
    {
      icon: <I d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5 5-5 5 5m-5-5v12" />,
      title: t("landing.sec5Title"),
      desc: t("landing.sec5Desc"),
      accent: "from-rose-400 to-pink-500",
    },
    {
      icon: <I d="M12 8v4l3 3M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z" />,
      title: t("landing.sec6Title"),
      desc: t("landing.sec6Desc"),
      accent: "from-indigo-400 to-sky-500",
    },
  ];

  return (
    <div>
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <SectionEyebrow label={t("landing.secEyebrow")} icon={IconShield} accent="emerald" />
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            {t("landing.secTitle")}
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400">{t("landing.secSubtitle")}</p>
          <div className="mt-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-900/60">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              {t("landing.secPromiseLabel")}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {t("landing.secPromise")}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((it, i) => (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
            >
              <span
                className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br ${it.accent} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-30`}
              />
              <div
                className={`relative inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${it.accent} text-white shadow-md`}
              >
                {it.icon}
              </div>
              <h3 className="relative mt-4 text-base font-bold text-slate-900 dark:text-white">{it.title}</h3>
              <p className="relative mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{it.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
