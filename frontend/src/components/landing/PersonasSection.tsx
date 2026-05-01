import { motion } from "framer-motion";
import { useState, type ComponentType, type SVGProps } from "react";
import { useTranslation } from "react-i18next";

import { SectionEyebrow } from "./SectionEyebrow";
import {
  IconPersonaDentist,
  IconPersonaOwner,
  IconPersonaPatient,
  IconPersonaReception,
  IconUsers,
} from "./icons/LandingIcons";

type PersonaKey = "owner" | "dentist" | "reception" | "patient";

type IconComp = ComponentType<SVGProps<SVGSVGElement>>;

export function PersonasSection(): JSX.Element {
  const { t } = useTranslation();
  const [active, setActive] = useState<PersonaKey>("owner");

  const personas: { key: PersonaKey; Icon: IconComp; title: string; desc: string; bullets: string[]; gradient: string }[] = [
    {
      key: "owner",
      Icon: IconPersonaOwner,
      title: t("landing.persona1Title"),
      desc: t("landing.persona1Desc"),
      bullets: [
        t("landing.persona1B1"),
        t("landing.persona1B2"),
        t("landing.persona1B3"),
      ],
      gradient: "from-emerald-500 to-sky-500",
    },
    {
      key: "dentist",
      Icon: IconPersonaDentist,
      title: t("landing.persona2Title"),
      desc: t("landing.persona2Desc"),
      bullets: [
        t("landing.persona2B1"),
        t("landing.persona2B2"),
        t("landing.persona2B3"),
      ],
      gradient: "from-sky-500 to-violet-500",
    },
    {
      key: "reception",
      Icon: IconPersonaReception,
      title: t("landing.persona3Title"),
      desc: t("landing.persona3Desc"),
      bullets: [
        t("landing.persona3B1"),
        t("landing.persona3B2"),
        t("landing.persona3B3"),
      ],
      gradient: "from-amber-500 to-rose-500",
    },
    {
      key: "patient",
      Icon: IconPersonaPatient,
      title: t("landing.persona4Title"),
      desc: t("landing.persona4Desc"),
      bullets: [
        t("landing.persona4B1"),
        t("landing.persona4B2"),
        t("landing.persona4B3"),
      ],
      gradient: "from-rose-400 to-fuchsia-500",
    },
  ];

  const current = personas.find((p) => p.key === active) ?? personas[0];

  return (
    <div>
      <div className="mx-auto max-w-2xl text-center">
        <SectionEyebrow label={t("landing.personasEyebrow")} icon={IconUsers} accent="sky" align="center" />
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          {t("landing.personasTitle")}
        </h2>
        <p className="mt-4 text-slate-600 dark:text-slate-400">{t("landing.personasSubtitle")}</p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-3">
          {personas.map((p) => (
            <button
              key={p.key}
              onClick={() => setActive(p.key)}
              className={`relative w-full overflow-hidden rounded-2xl border text-left transition ${
                active === p.key
                  ? "border-transparent bg-white shadow-lg dark:bg-slate-900"
                  : "border-slate-200 bg-white/70 hover:bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-900"
              }`}
            >
              {active === p.key && (
                <motion.span
                  layoutId="personaGlow"
                  className={`absolute inset-0 -z-10 bg-gradient-to-br ${p.gradient} opacity-10`}
                  transition={{ type: "spring", stiffness: 260, damping: 28 }}
                />
              )}
              {active === p.key && (
                <motion.span
                  layoutId="personaBar"
                  className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${p.gradient}`}
                  transition={{ type: "spring", stiffness: 260, damping: 28 }}
                />
              )}
              <div className="flex items-center gap-3 p-4">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    active === p.key
                      ? `bg-gradient-to-br ${p.gradient} text-white shadow-md`
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  <p.Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{p.title}</p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">{p.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <motion.div
          key={current.key}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className={`absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br ${current.gradient} opacity-10 blur-3xl`} />
          <div className="relative">
            <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${current.gradient} text-white shadow-md`}>
              <current.Icon className="h-7 w-7" />
            </div>
            <h3 className="mt-5 text-2xl font-bold text-slate-900 dark:text-white">{current.title}</h3>
            <p className="mt-2 text-slate-600 dark:text-slate-400">{current.desc}</p>

            <ul className="mt-6 space-y-3">
              {current.bullets.map((b, i) => (
                <motion.li
                  key={b}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                  className="flex items-start gap-3"
                >
                  <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${current.gradient} text-white shadow-sm`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-3.5 w-3.5">
                      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{b}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
