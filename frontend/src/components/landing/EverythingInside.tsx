import { motion } from "framer-motion";
import type { ComponentType, SVGProps } from "react";
import { useTranslation } from "react-i18next";

import { SectionEyebrow } from "./SectionEyebrow";
import {
  IconAllergy,
  IconAudit,
  IconBox,
  IconCSV,
  IconCalendar,
  IconCard,
  IconClockAlert,
  IconClockGlobe,
  IconDark,
  IconDragHandle,
  IconEye,
  IconHistory,
  IconHospital,
  IconHourglass,
  IconKeyboard,
  IconLang,
  IconMail,
  IconMultiBranch,
  IconPDF,
  IconPeso,
  IconPesoMono,
  IconPower,
  IconRegister,
  IconRoles,
  IconSelfBook,
  IconSparkle,
  IconTreatmentPlan,
  IconXray,
} from "./icons/LandingIcons";

type IconComp = ComponentType<SVGProps<SVGSVGElement>>;

const CHIPS: { key: string; Icon: IconComp; accent: string }[] = [
  { key: "csv", Icon: IconCSV, accent: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900" },
  { key: "drag", Icon: IconDragHandle, accent: "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:ring-sky-900" },
  { key: "audit", Icon: IconAudit, accent: "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:ring-violet-900" },
  { key: "roles", Icon: IconRoles, accent: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900" },
  { key: "dark", Icon: IconDark, accent: "bg-slate-100 text-slate-800 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700" },
  { key: "lang", Icon: IconLang, accent: "bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:ring-indigo-900" },
  { key: "gcash", Icon: IconPeso, accent: "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:ring-sky-900" },
  { key: "maya", Icon: IconPeso, accent: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900" },
  { key: "paymongo", Icon: IconCard, accent: "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:ring-violet-900" },
  { key: "philhealth", Icon: IconHospital, accent: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-900" },
  { key: "stock", Icon: IconBox, accent: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900" },
  { key: "sms", Icon: IconMail, accent: "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:ring-sky-900" },
  { key: "pdf", Icon: IconPDF, accent: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-900" },
  { key: "selfbook", Icon: IconSelfBook, accent: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900" },
  { key: "conflict", Icon: IconClockAlert, accent: "bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:ring-indigo-900" },
  { key: "waitlist", Icon: IconHourglass, accent: "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:ring-violet-900" },
  { key: "xray", Icon: IconXray, accent: "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700" },
  { key: "allergy", Icon: IconAllergy, accent: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-900" },
  { key: "plan", Icon: IconTreatmentPlan, accent: "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:ring-sky-900" },
  { key: "multi", Icon: IconMultiBranch, accent: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900" },
  { key: "preview", Icon: IconEye, accent: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900" },
  { key: "tz", Icon: IconClockGlobe, accent: "bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:ring-indigo-900" },
  { key: "php", Icon: IconPesoMono, accent: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900" },
  { key: "cal", Icon: IconCalendar, accent: "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:ring-sky-900" },
  { key: "register", Icon: IconRegister, accent: "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:ring-violet-900" },
  { key: "kbd", Icon: IconKeyboard, accent: "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700" },
  { key: "history", Icon: IconHistory, accent: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-900" },
  { key: "autologout", Icon: IconPower, accent: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900" },
];

export function EverythingInside(): JSX.Element {
  const { t } = useTranslation();

  return (
    <div>
      <div className="mx-auto max-w-2xl text-center">
        <SectionEyebrow label={t("landing.chipEyebrow")} icon={IconSparkle} accent="indigo" align="center" />
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          {t("landing.chipTitle")}
        </h2>
        <p className="mt-4 text-slate-600 dark:text-slate-400">{t("landing.chipSubtitle")}</p>
      </div>

      <div className="relative mt-10">
        <div className="pointer-events-none absolute -left-10 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-sky-200/30 blur-3xl" />

        <div className="relative flex flex-wrap justify-center gap-2.5">
          {CHIPS.map((c, i) => (
            <motion.span
              key={c.key}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ y: -3, scale: 1.04 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{
                delay: i * 0.02,
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`inline-flex cursor-default items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold shadow-sm ring-1 transition ${c.accent}`}
            >
              <c.Icon className="h-4 w-4 shrink-0" />
              {t(`landing.chip_${c.key}`)}
            </motion.span>
          ))}
        </div>
      </div>

      <p className="mt-10 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
        {t("landing.chipFoot")}
      </p>
    </div>
  );
}
