import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Info, X } from "lucide-react";

export function CookieConsent(): JSX.Element | null {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Small delay to make it feel more premium
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("cookie-consent", "all");
    setVisible(false);
  };

  const handleAcceptNecessary = () => {
    localStorage.setItem("cookie-consent", "necessary");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-[9999]"
        >
          <div className="card shadow-popover border border-brand-border bg-brand-surface/95 dark:bg-zinc-900/95 backdrop-blur-md p-5 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-full bg-brand-primary-soft text-brand-primary flex items-center justify-center flex-shrink-0">
                <Info size={18} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-brand-text">
                    {t("components.cookieConsent.title", { defaultValue: "We use cookies" })}
                  </h4>
                  <button 
                    onClick={handleAcceptNecessary}
                    className="text-brand-muted hover:text-brand-text transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                <p className="text-xs font-medium text-brand-text-soft mt-1 leading-relaxed">
                  {t("components.cookieConsent.description", { 
                    defaultValue: "We use cookies to optimize clinic scheduling, analytics, and security. By clicking 'Accept All', you agree to our use of cookies." 
                  })}
                  {" "}
                  <Link to="/privacy" className="text-brand-primary hover:underline font-semibold">
                    {t("components.cookieConsent.policyLink", { defaultValue: "Privacy Policy" })}
                  </Link>
                  .
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={handleAcceptNecessary}
                className="h-8 px-3.5 rounded-[var(--radius-sm)] border border-brand-border text-brand-text hover:bg-brand-surface-soft text-xs font-bold uppercase tracking-wider transition-colors"
              >
                {t("components.cookieConsent.necessaryOnly", { defaultValue: "Necessary Only" })}
              </button>
              <button
                onClick={handleAcceptAll}
                className="h-8 px-4 rounded-[var(--radius-sm)] bg-brand-primary text-white hover:bg-brand-primary/95 text-xs font-bold uppercase tracking-wider transition-colors"
              >
                {t("components.cookieConsent.acceptAll", { defaultValue: "Accept All" })}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
