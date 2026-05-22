import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const SECTIONS: { id: string; labelKey: string }[] = [
  { id: "hero", labelKey: "landing.tocHero" },
  { id: "features", labelKey: "landing.tocFeatures" },
  { id: "day", labelKey: "landing.tocDay" },
  { id: "how", labelKey: "landing.tocHow" },
  { id: "inside", labelKey: "landing.tocInside" },
  { id: "security", labelKey: "landing.tocSecurity" },
  { id: "pricing", labelKey: "landing.tocPricing" },
  { id: "quote-band", labelKey: "landing.tocQuote" },
  { id: "testimonials", labelKey: "landing.tocTesti" },
  { id: "faq", labelKey: "landing.tocFaq" },
];

export function SideTOC(): JSX.Element {
  const { t } = useTranslation();
  const [active, setActive] = useState<string>("hero");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = (): void => setVisible(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => {
      window.removeEventListener("scroll", onScroll);
      obs.disconnect();
    };
  }, []);

  return (
    <motion.nav
      aria-label={t("landing.progress")}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : 16 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-none fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 xl:block"
    >
      <ul className="pointer-events-auto flex flex-col gap-1.5 rounded-full border border-slate-200 bg-white/80 px-1.5 py-3 shadow-lg backdrop-blur">
        {SECTIONS.map((s) => {
          const isActive = active === s.id;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className={`group relative flex items-center gap-2 rounded-full px-2 py-1.5 transition ${ isActive ? "bg-white text-white" : "text-slate-500 hover:text-slate-900" }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full transition ${ isActive ? "bg-teal-400" : "bg-slate-300 group-hover:bg-slate-500" }`}
                />
                <span
                  className={`overflow-hidden whitespace-nowrap text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${ isActive ? "max-w-[80px] pr-1 opacity-100" : "max-w-0 opacity-0 group-hover:max-w-[80px] group-hover:pr-1 group-hover:opacity-100" }`}
                >
                  {t(s.labelKey)}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </motion.nav>
  );
}
