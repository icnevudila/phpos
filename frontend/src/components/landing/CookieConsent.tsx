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
          <div className="overflow-hidden rounded-2xl border border-brand-border bg-brand-surface/95 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-md">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
                <Cookie size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-brand-text">Cookie Policy</h3>
                <p className="mt-1 text-xs leading-relaxed text-brand-muted">
                  We use cookies to enhance your experience, analyze site traffic, and serve better content. By continuing, you agree to our use of cookies.
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={accept}
                    className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-teal-700"
                  >
                    Accept all
                  </button>
                  <button
                    onClick={() => setIsVisible(false)}
                    className="text-xs font-semibold text-brand-muted hover:text-brand-text"
                  >
                    Reject
                  </button>
                </div>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="text-brand-muted transition hover:text-brand-muted"
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
