import { motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";

/** Landing hero — `public/hero_mockup.png` (tablet + phone product shot). */
export function HeroProductVisual(): JSX.Element {
  const { t } = useTranslation();
  const reduce = useReducedMotion();

  return (
    <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
      <motion.div
        initial={reduce ? { opacity: 1 } : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        <div
          className="pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-teal-200/40 via-sky-100/30 to-transparent blur-2xl"
          aria-hidden
        />
        <img
          src="/hero_mockup.png"
          alt={t("landing.heroMockupAlt")}
          width={1200}
          height={900}
          className="relative w-full rounded-2xl object-contain drop-shadow-2xl ring-1 ring-brand-border/60"
          loading="eager"
          fetchPriority="high"
        />
      </motion.div>
      <p className="mt-4 text-center text-[11px] font-medium text-brand-muted">
        {t("landing.heroMockupCaption")}
      </p>
    </div>
  );
}
