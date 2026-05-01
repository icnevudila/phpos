import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { PORTAL_DEMO_SLUG } from "../../constants/portal";
import { LanguageSwitcher } from "../LanguageSwitcher";

function DentEaseLogo(): JSX.Element {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 text-white shadow-md">
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M12 2a5 5 0 0 0-5 5c0 2 1 3 1 5s-1 4-1 6a3 3 0 0 0 6 0c0-1 .5-1 1-1s1 0 1 1a3 3 0 0 0 6 0c0-2-1-4-1-6s1-3 1-5a5 5 0 0 0-5-5c-1 0-2 .5-2 1s-1 1-2 1-1-.5-2-1-1-1-2-1Z" />
      </svg>
    </div>
  );
}

const SECTIONS = ["features", "day", "how", "pricing", "quote-band", "testimonials", "faq", "cta"] as const;

export function StickyNav(): JSX.Element {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  const links = [
    { href: "#features", label: t("landing.navFeatures"), id: "features" },
    { href: "#how", label: t("landing.navHowItWorks"), id: "how" },
    { href: "#pricing", label: t("landing.navPricing"), id: "pricing" },
    { href: "#testimonials", label: t("landing.testiEyebrow"), id: "testimonials" },
    { href: "#faq", label: t("landing.faqEyebrow"), id: "faq" },
  ];

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-white/85 shadow-[0_4px_20px_rgba(15,23,42,0.08)] backdrop-blur-md dark:bg-slate-950/85 dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-2.5 py-2 sm:px-6 sm:py-4">
        <Link to="/" className="flex items-center gap-2">
          <DentEaseLogo />
          <div className="flex flex-col">
            <span className="text-lg font-extrabold leading-none tracking-tight text-slate-900 dark:text-white">
              Dent<span className="bg-gradient-to-br from-emerald-500 to-sky-500 bg-clip-text text-transparent">Ease</span>
            </span>
            <span className="hidden text-[10px] font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400 sm:inline">
              {t("landing.brandSubLabel")}
            </span>
          </div>
        </Link>
        <div className="hidden min-w-0 flex-1 items-center justify-end gap-0.5 md:flex">
          {links.map((l) => (
            <a
              key={l.id}
              href={l.href}
              className="relative min-h-10 shrink-0 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 transition hover:text-slate-900 xl:px-3 xl:text-sm dark:text-slate-300 dark:hover:text-white"
            >
              {l.label}
              {active === l.id && (
                <motion.span
                  layoutId="navActive"
                  className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-sky-500"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </a>
          ))}
          <Link
            to="/contact"
            className="ml-1 min-h-10 shrink-0 rounded-lg px-2.5 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 xl:px-3 xl:text-sm dark:text-emerald-400 dark:hover:bg-emerald-950/40"
          >
            {t("landing.navContact")}
          </Link>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <LanguageSwitcher />
          <Link
            to={`/${PORTAL_DEMO_SLUG}/portal/login`}
            className="hidden max-w-[9rem] truncate rounded-lg px-2 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 hover:text-emerald-900 sm:inline-flex sm:max-w-none sm:px-3 sm:text-sm dark:text-emerald-400 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-200"
          >
            {t("landing.navPatientPortal")}
          </Link>
          <Link
            to="/login"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-slate-900 px-2.5 py-2 text-[11px] font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 sm:px-4 sm:text-sm dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            {t("landing.navSignIn")}
          </Link>
        </div>
      </nav>
    </header>
  );
}
