import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export function MobileStickyCTA(): JSX.Element {
  const { t } = useTranslation();
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);
  const lastYRef = useRef(0);

  useMotionValueEvent(scrollY, "change", (y) => {
    let nextVisible = visible;
    if (y < 400) {
      nextVisible = false;
    } else if (y > lastYRef.current + 4) {
      nextVisible = true;
    } else if (y < lastYRef.current - 4) {
      nextVisible = false;
    }
    if (nextVisible !== visible) {
      setVisible(nextVisible);
    }
    lastYRef.current = y;
  });

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 240, damping: 24 }}
          className="fixed inset-x-3 z-[55] flex items-stretch gap-2 rounded-2xl border border-teal-200 bg-white/95 p-2 shadow-2xl backdrop-blur md:hidden"
          style={{ bottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <div className="flex flex-1 flex-col justify-center pl-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-teal-700">
              {t("landing.announceBadge")}
            </p>
            <p className="text-xs font-semibold text-slate-900">
              {t("landing.announceTitle")}
            </p>
          </div>
          <Link
            to="/contact"
            className="group relative inline-flex min-h-11 shrink-0 items-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-br from-teal-500 to-sky-500 px-4 text-xs font-bold text-white shadow-lg shadow-teal-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            <span
              aria-hidden
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 group-hover:translate-x-full"
            />
            <span className="relative">{t("landing.mobileCta")}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="relative h-3.5 w-3.5">
              <path d="M5 12h14m-7-7 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
