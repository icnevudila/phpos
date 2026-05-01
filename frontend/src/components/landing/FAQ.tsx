import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Link } from "react-router-dom";

import { SectionEyebrow } from "./SectionEyebrow";
import { IconHelp } from "./icons/LandingIcons";

export function FAQ({ contactHref = "#cta" }: { contactHref?: string }): JSX.Element {
  const { t } = useTranslation();
  const [open, setOpen] = useState<number | null>(0);

  const items = Array.from({ length: 6 }).map((_, i) => ({
    q: t(`landing.faq${i + 1}Q`),
    a: t(`landing.faq${i + 1}A`),
  }));

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
      <div>
        <SectionEyebrow label={t("landing.faqEyebrow")} icon={IconHelp} accent="violet" />
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          {t("landing.faqTitle")}
        </h2>
        <p className="mt-4 text-slate-600 dark:text-slate-400">{t("landing.faqSubtitle")}</p>
        {contactHref.startsWith("/") ? (
          <Link
            to={contactHref}
            className="mt-6 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-emerald-600 transition hover:gap-2 dark:text-emerald-400"
          >
            {t("landing.faqContact")}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
              <path d="M5 12h14m-7-7 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        ) : (
          <a
            href={contactHref}
            className="mt-6 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-emerald-600 transition hover:gap-2 dark:text-emerald-400"
          >
            {t("landing.faqContact")}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
              <path d="M5 12h14m-7-7 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        )}
      </div>

      <div className="divide-y divide-slate-200 rounded-3xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900/60">
        {items.map((it, i) => {
          const isOpen = open === i;
          return (
            <div key={i}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
                aria-expanded={isOpen}
              >
                <span className="text-sm font-bold text-slate-900 sm:text-base dark:text-white">{it.q}</span>
                <motion.span
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    isOpen ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
                    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                  </svg>
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm leading-relaxed text-slate-600 sm:px-6 dark:text-slate-400">{it.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
