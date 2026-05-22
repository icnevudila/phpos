import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const DISMISS_KEY = "dentease-announce-dismissed-v1";

export function AnnouncementBar(): JSX.Element | null {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY) !== "1") setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function dismiss(): void {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-50 overflow-hidden text-white"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #0f766e 0%, #0e7490 50%, #4338ca 100%)",
          }}
        >
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <motion.div
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ["-120%", "320%"] }}
              transition={{ duration: 6, ease: "linear", repeat: Infinity }}
            />
          </div>
          <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2 text-xs sm:gap-3 sm:px-5 sm:text-sm">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ring-1 ring-white/25 sm:gap-1.5 sm:px-2.5 sm:text-[10px]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-teal-300 opacity-70" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-teal-300" />
              </span>
              {t("landing.announceBadge")}
            </span>
            <p className="flex-1 truncate font-medium">
              <span className="font-bold">{t("landing.announceTitle")}</span>
              <span className="mx-2 opacity-60">·</span>
              <span className="opacity-90">{t("landing.announceSub")}</span>
            </p>
            <a
              href="#cta"
              className="group hidden items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-bold ring-1 ring-white/30 transition hover:bg-white/25 sm:inline-flex"
            >
              {t("landing.announceCta")}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                className="h-3.5 w-3.5 transition group-hover:translate-x-0.5"
              >
                <path d="M5 12h14m-7-7 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <button
              onClick={dismiss}
              aria-label={t("common.dismiss")}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/70 transition hover:bg-white/15 hover:text-white"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
