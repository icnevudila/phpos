import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import type { FeatureDef } from "./FeatureCard";

interface FeatureModalProps {
  feature: FeatureDef | null;
  onClose: () => void;
}

export function FeatureModal({ feature, onClose }: FeatureModalProps): JSX.Element {
  const { t } = useTranslation();
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!feature) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    queueMicrotask(() => {
      scrollRootRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
      panelRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [feature, onClose]);

  return (
    <AnimatePresence>
      {feature && (
        <motion.div
          ref={scrollRootRef}
          className="fixed inset-0 z-50 overflow-y-auto overscroll-contain"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`feature-modal-title-${feature.id}`}
        >
          <motion.div
            className="fixed inset-0 bg-white/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div className="relative flex min-h-full flex-col justify-end px-0 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:flex-row sm:items-start sm:justify-center sm:px-6 sm:pb-10 sm:pt-[max(1.5rem,env(safe-area-inset-top))]">
            <motion.div
              ref={panelRef}
              layoutId={`feature-card-${feature.id}`}
              className="relative z-10 w-full max-w-4xl max-h-[min(92vh,calc(100dvh-2rem))] overflow-y-auto overflow-x-hidden rounded-t-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 sm:max-h-[min(92vh,calc(100dvh-5rem))] sm:rounded-3xl sm:p-8"
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
            >
            <div className="flex items-start gap-4">
              <motion.div
                layoutId={`feature-icon-${feature.id}`}
                className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${feature.color}`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-7 w-7"
                >
                  <path d={feature.d} />
                </svg>
              </motion.div>
              <div className="flex-1">
                <motion.h2
                  id={`feature-modal-title-${feature.id}`}
                  layoutId={`feature-title-${feature.id}`}
                  className="text-2xl font-extrabold text-slate-900 sm:text-3xl"
                >
                  {feature.title}
                </motion.h2>
                <motion.p
                  layoutId={`feature-desc-${feature.id}`}
                  className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base"
                >
                  {feature.longDesc ?? feature.desc}
                </motion.p>
              </div>
              <button
                ref={closeRef}
                onClick={onClose}
                aria-label={t("common.close")}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                  <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.4 }}
              className="mt-6"
            >
              {feature.preview}
            </motion.div>

            {feature.tryInAppPath ? (
              <div className="mt-6 border-t border-slate-200 pt-6">
                <Link
                  to={feature.tryInAppPath}
                  onClick={onClose}
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-teal-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 sm:w-auto"
                >
                  {t("landing.featureOpenInApp")}
                </Link>
                <p className="mt-2 text-center text-[11px] text-slate-500 sm:text-left">
                  {t("landing.featureOpenInAppHint")}
                </p>
              </div>
            ) : null}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
