import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "true");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-6 right-6 z-[100] mx-auto max-w-2xl sm:left-auto sm:right-8 sm:w-[400px]"
        >
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <Cookie size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Cookie Policy</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  We use cookies to enhance your experience, analyze site traffic, and serve better content. By continuing, you agree to our use of cookies.
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={accept}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                  >
                    Accept all
                  </button>
                  <button
                    onClick={() => setIsVisible(false)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    Reject
                  </button>
                </div>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
