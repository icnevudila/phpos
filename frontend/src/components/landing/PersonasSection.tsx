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

  const personas: { key: PersonaKey; img: string; title: string; desc: string; bullets: string[]; gradient: string }[] = [
    {
      key: "owner",
      img: "/owner.png",
      title: t("landing.persona1Title", { defaultValue: "Persona1 Title" }),
      desc: t("landing.persona1Desc", { defaultValue: "Persona1 Desc" }),
      bullets: [t("landing.persona1B1", { defaultValue: "Persona1 B1" }), t("landing.persona1B2", { defaultValue: "Persona1 B2" }), t("landing.persona1B3", { defaultValue: "Persona1 B3" })],
      gradient: "from-teal-500 to-teal-500",
    },
    {
      key: "dentist",
      img: "/dentist.png",
      title: t("landing.persona2Title", { defaultValue: "Persona2 Title" }),
      desc: t("landing.persona2Desc", { defaultValue: "Persona2 Desc" }),
      bullets: [t("landing.persona2B1", { defaultValue: "Persona2 B1" }), t("landing.persona2B2", { defaultValue: "Persona2 B2" }), t("landing.persona2B3", { defaultValue: "Persona2 B3" })],
      gradient: "from-sky-500 to-teal-500",
    },
    {
      key: "reception",
      img: "/receptionist.png",
      title: t("landing.persona3Title", { defaultValue: "Persona3 Title" }),
      desc: t("landing.persona3Desc", { defaultValue: "Persona3 Desc" }),
      bullets: [t("landing.persona3B1", { defaultValue: "Persona3 B1" }), t("landing.persona3B2", { defaultValue: "Persona3 B2" }), t("landing.persona3B3", { defaultValue: "Persona3 B3" })],
      gradient: "from-amber-500 to-rose-500",
    },
    {
      key: "patient",
      img: "/patient.png",
      title: t("landing.persona4Title", { defaultValue: "Persona4 Title" }),
      desc: t("landing.persona4Desc", { defaultValue: "Persona4 Desc" }),
      bullets: [t("landing.persona4B1", { defaultValue: "Persona4 B1" }), t("landing.persona4B2", { defaultValue: "Persona4 B2" }), t("landing.persona4B3", { defaultValue: "Persona4 B3" })],
      gradient: "from-rose-400 to-fuchsia-500",
    },
  ];

  const current = personas.find((p) => p.key === active) ?? personas[0];

  return (
    <div>
      <div className="mx-auto max-w-2xl text-center">
        <SectionEyebrow label={t("landing.personasEyebrow", { defaultValue: "Personas Eyebrow" })} icon={IconUsers} accent="sky" align="center" />
        <h2 className="mt-3 text-4xl font-black tracking-tight text-brand-text sm:text-5xl">
          {t("landing.personasTitle", { defaultValue: "Personas Title" })}
        </h2>
        <p className="mt-4 text-lg font-medium text-brand-muted">{t("landing.personasSubtitle", { defaultValue: "Personas Subtitle" })}</p>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.5fr]">
        <div className="space-y-4">
          {personas.map((p) => (
            <button
              key={p.key}
              onClick={() => setActive(p.key)}
              className={`group relative w-full overflow-hidden rounded-[2rem] border p-4 text-left transition-all duration-300 ${ active === p.key ? "border-teal-200 bg-brand-surface shadow-xl " : "border-transparent bg-brand-surface-soft/50 hover:bg-brand-surface " }`}
            >
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl shadow-inner">
                  <img src={p.img} alt={p.title} className="h-full w-full object-cover" />
                  <div className={`absolute inset-0 bg-gradient-to-br ${p.gradient} opacity-20`} />
                </div>
                <div className="min-w-0">
                  <p className={`text-lg font-black transition-colors ${active === p.key ? "text-teal-600" : "text-brand-text "}`}>
                    {p.title}
                  </p>
                  <p className="truncate text-xs font-medium text-brand-muted">{p.desc}</p>
                </div>
              </div>
              {active === p.key && (
                <motion.div layoutId="personaPill" className="absolute -left-1 h-12 w-1.5 rounded-full bg-teal-500" />
              )}
            </button>
          ))}
        </div>

        <motion.div
          key={current.key}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[3rem] border border-brand-border bg-brand-surface p-8 shadow-2xl"
        >
          <div className="grid gap-8 md:grid-cols-[1fr_1.2fr]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-lg">
              <img src={current.img} alt={current.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
            </div>
            <div className="flex flex-col justify-center">
              <div className={`mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${current.gradient} px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg`}>
                <IconUsers className="h-3 w-3" />
                {current.key}
              </div>
              <h3 className="text-3xl font-black tracking-tight text-brand-text">
                {current.title}
              </h3>
              <p className="mt-4 text-lg font-medium text-brand-muted">
                {current.desc}
              </p>
              <ul className="mt-8 space-y-4">
                {current.bullets.map((b, i) => (
                  <motion.li
                    key={b}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.07 }}
                    className="flex items-start gap-3"
                  >
                    <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${current.gradient} text-white shadow-sm ring-2 ring-brand-border/10/20`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-3.5 w-3.5">
                        <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="text-sm font-semibold text-brand-text">{b}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
