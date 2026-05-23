import { motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";

const INTEGRATIONS = [
  "GCash",
  "Maya",
  "PayMongo",
  "PhilHealth",
  "Semaphore",
  "Maxicare",
  "Intellicare",
  "Medicard",
  "Resend Email",
  "Excel export",
];

export function IntegrationsStrip(): JSX.Element {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const loop = [...INTEGRATIONS, ...INTEGRATIONS];

  return (
    <div className="rounded-3xl border border-brand-border bg-brand-surface px-6 py-6 shadow-sm sm:px-8">
      <p className="mb-4 text-center text-xs font-bold uppercase tracking-widest text-brand-muted">
        {t("landing.integrationsTitle")}
      </p>
      <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
        {reduce ? (
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            {INTEGRATIONS.map((n) => (
              <span key={n} className="text-sm font-semibold text-brand-muted">
                {n}
              </span>
            ))}
          </div>
        ) : (
          <motion.div
            className="flex gap-10 whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 35, ease: "linear", repeat: Infinity }}
            style={{ width: "max-content" }}
          >
            {loop.map((n, i) => (
              <span
                key={i}
                className="text-base font-semibold text-brand-muted transition hover:text-brand-text"
              >
                {n}
              </span>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
