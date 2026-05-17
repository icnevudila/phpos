import { AnimatePresence, motion } from "framer-motion";
import { useState, type ComponentType, type SVGProps } from "react";
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

const COMING_SOON_CHIPS = new Set(["multi", "cal"]);

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
  const [activeKey, setActiveKey] = useState<string | null>("chart");

  const categories = [
    {
      title: "Clinical tools",
      items: ["xray", "allergy", "plan", "history", "chart", "odontogram"],
      color: "emerald"
    },
    {
      title: "Operations",
      items: ["drag", "waitlist", "conflict", "stock", "roles", "audit"],
      color: "sky"
    },
    {
      title: "Payments & HMO",
      items: ["gcash", "maya", "paymongo", "philhealth", "pdf", "php"],
      color: "indigo"
    },
    {
      title: "Clinic Experience",
      items: ["selfbook", "register", "lang", "dark", "tz", "kbd"],
      color: "amber"
    }
  ];

  const activeChip = CHIPS.find(c => c.key === activeKey);

  return (
    <div className="space-y-12">
      <div className="mx-auto max-w-2xl text-center">
        <SectionEyebrow label={t("landing.chipEyebrow")} icon={IconSparkle} accent="indigo" align="center" />
        <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl dark:text-white">
          {t("landing.chipTitle")}
        </h2>
        <p className="mt-4 text-lg font-medium text-slate-600 dark:text-slate-400">{t("landing.chipSubtitle")}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
        <div className="grid gap-6 sm:grid-cols-2">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <h3 className="mb-4 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
                {cat.title}
              </h3>
              <div className="flex flex-wrap gap-2">
                {cat.items.map((key) => {
                  const chip = CHIPS.find(c => c.key === key);
                  if (!chip) return null;
                  const isActive = activeKey === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveKey(key)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold ring-1 transition-all hover:scale-105 active:scale-95 ${
                        isActive 
                          ? `${chip.accent} ring-current shadow-md` 
                          : "bg-white/80 text-slate-600 ring-slate-200 hover:bg-white dark:bg-slate-800/80 dark:text-slate-400 dark:ring-slate-700"
                      }`}
                    >
                      <chip.Icon className="h-3.5 w-3.5" />
                      {t(`landing.chip_${key}`)}
                      {COMING_SOON_CHIPS.has(key) ? (
                        <span className="ml-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-black uppercase text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                          {t("landing.comingSoon")}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            {activeChip && (
              <motion.div
                key={activeKey}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="sticky top-24 rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
              >
                <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${activeChip.accent} ring-4 ring-current/10`}>
                  <activeChip.Icon className="h-7 w-7" />
                </div>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                  {t(`landing.chip_${activeKey}`)}
                </h4>
                <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-400">
                  {/* Descriptions could be in i18n, adding fallback/placeholder logic for now */}
                  {t(`landing.chip_${activeKey}_desc`) || "Professional-grade tool designed specifically for high-volume dental practices, ensuring data integrity and clinical precision across all branches."}
                </p>
                {COMING_SOON_CHIPS.has(activeKey ?? "") ? (
                  <p className="mt-6 text-xs font-bold uppercase tracking-widest text-amber-600">
                    {t("landing.comingSoon")}
                  </p>
                ) : (
                  <div className="mt-8 flex items-center gap-2 text-xs font-bold text-emerald-600">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px]">✓</span>
                    Ready to use out-of-the-box
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <p className="text-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">
        {t("landing.chipFoot")}
      </p>
    </div>
  );
}
