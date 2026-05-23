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
  { key: "csv", Icon: IconCSV, accent: "bg-teal-50 text-teal-700 ring-teal-200   " },
  { key: "drag", Icon: IconDragHandle, accent: "bg-sky-50 text-sky-700 ring-sky-200   " },
  { key: "audit", Icon: IconAudit, accent: "bg-teal-50 text-teal-700 ring-teal-200   " },
  { key: "roles", Icon: IconRoles, accent: "bg-amber-50 text-amber-700 ring-amber-200   " },
  { key: "dark", Icon: IconDark, accent: "bg-brand-surface-muted text-brand-text ring-brand-border   " },
  { key: "lang", Icon: IconLang, accent: "bg-indigo-50 text-indigo-700 ring-indigo-200   " },
  { key: "gcash", Icon: IconPeso, accent: "bg-sky-50 text-sky-700 ring-sky-200   " },
  { key: "maya", Icon: IconPeso, accent: "bg-teal-50 text-teal-700 ring-teal-200   " },
  { key: "paymongo", Icon: IconCard, accent: "bg-teal-50 text-teal-700 ring-teal-200   " },
  { key: "philhealth", Icon: IconHospital, accent: "bg-rose-50 text-rose-700 ring-rose-200   " },
  { key: "stock", Icon: IconBox, accent: "bg-amber-50 text-amber-700 ring-amber-200   " },
  { key: "sms", Icon: IconMail, accent: "bg-sky-50 text-sky-700 ring-sky-200   " },
  { key: "pdf", Icon: IconPDF, accent: "bg-rose-50 text-rose-700 ring-rose-200   " },
  { key: "selfbook", Icon: IconSelfBook, accent: "bg-teal-50 text-teal-700 ring-teal-200   " },
  { key: "conflict", Icon: IconClockAlert, accent: "bg-indigo-50 text-indigo-700 ring-indigo-200   " },
  { key: "waitlist", Icon: IconHourglass, accent: "bg-teal-50 text-teal-700 ring-teal-200   " },
  { key: "xray", Icon: IconXray, accent: "bg-brand-surface-muted text-brand-text ring-brand-border   " },
  { key: "allergy", Icon: IconAllergy, accent: "bg-rose-50 text-rose-700 ring-rose-200   " },
  { key: "plan", Icon: IconTreatmentPlan, accent: "bg-sky-50 text-sky-700 ring-sky-200   " },
  { key: "multi", Icon: IconMultiBranch, accent: "bg-teal-50 text-teal-700 ring-teal-200   " },
  { key: "preview", Icon: IconEye, accent: "bg-amber-50 text-amber-700 ring-amber-200   " },
  { key: "tz", Icon: IconClockGlobe, accent: "bg-indigo-50 text-indigo-700 ring-indigo-200   " },
  { key: "php", Icon: IconPesoMono, accent: "bg-teal-50 text-teal-700 ring-teal-200   " },
  { key: "cal", Icon: IconCalendar, accent: "bg-sky-50 text-sky-700 ring-sky-200   " },
  { key: "register", Icon: IconRegister, accent: "bg-teal-50 text-teal-700 ring-teal-200   " },
  { key: "kbd", Icon: IconKeyboard, accent: "bg-brand-surface-muted text-brand-text ring-brand-border   " },
  { key: "history", Icon: IconHistory, accent: "bg-rose-50 text-rose-700 ring-rose-200   " },
  { key: "autologout", Icon: IconPower, accent: "bg-amber-50 text-amber-700 ring-amber-200   " },
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
        <SectionEyebrow label={t("landing.chipEyebrow", { defaultValue: "Chip Eyebrow" })} icon={IconSparkle} accent="indigo" align="center" />
        <h2 className="mt-3 text-4xl font-black tracking-tight text-brand-text sm:text-5xl">
          {t("landing.chipTitle", { defaultValue: "Chip Title" })}
        </h2>
        <p className="mt-4 text-lg font-medium text-brand-muted">{t("landing.chipSubtitle", { defaultValue: "Chip Subtitle" })}</p>
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
              className="rounded-[2.5rem] border border-brand-border bg-brand-surface p-6 shadow-sm"
            >
              <h3 className="mb-4 text-[10px] font-black uppercase tracking-[0.25em] text-brand-muted">
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
                          : "bg-brand-surface/80 text-brand-muted ring-brand-border hover:bg-brand-surface   "
                      }`}
                    >
                      <chip.Icon className="h-3.5 w-3.5" />
                      {t(`landing.chip_${key}`)}
                      {COMING_SOON_CHIPS.has(key) ? (
                        <span className="ml-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-black uppercase text-amber-800">
                          {t("landing.comingSoon", { defaultValue: "Coming Soon" })}
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
                className="sticky top-24 rounded-[2.5rem] border border-brand-border bg-brand-surface p-8 shadow-2xl"
              >
                <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${activeChip.accent} ring-4 ring-current/10`}>
                  <activeChip.Icon className="h-7 w-7" />
                </div>
                <h4 className="text-2xl font-black text-brand-text">
                  {t(`landing.chip_${activeKey}`)}
                </h4>
                <p className="mt-4 text-base leading-relaxed text-brand-muted">
                  {/* Descriptions could be in i18n, adding fallback/placeholder logic for now */}
                  {t(`landing.chip_${activeKey}_desc`) || "Professional-grade tool designed specifically for high-volume dental practices, ensuring data integrity and clinical precision across all branches."}
                </p>
                {COMING_SOON_CHIPS.has(activeKey ?? "") ? (
                  <p className="mt-6 text-xs font-bold uppercase tracking-widest text-amber-600">
                    {t("landing.comingSoon", { defaultValue: "Coming Soon" })}
                  </p>
                ) : (
                  <div className="mt-8 flex items-center gap-2 text-xs font-bold text-teal-600">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-[10px]">✓</span>
                    Ready to use out-of-the-box
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <p className="text-center text-[10px] font-black uppercase tracking-[0.4em] text-brand-muted">
        {t("landing.chipFoot", { defaultValue: "Chip Foot" })}
      </p>
    </div>
  );
}
