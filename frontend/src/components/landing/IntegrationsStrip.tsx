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
    <div className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm sm:px-8 dark:border-slate-800 dark:bg-slate-900">
      <p className="mb-4 text-center text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
        {t("landing.integrationsTitle")}
      </p>
      <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
        {reduce ? (
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            {INTEGRATIONS.map((n) => (
              <span key={n} className="text-sm font-semibold text-slate-600 dark:text-slate-300">
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
                className="text-base font-semibold text-slate-500 transition hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
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
