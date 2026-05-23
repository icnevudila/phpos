import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { HeroProductVisual } from "./HeroProductVisual";
import {
  IconTrustCloud,
  IconTrustDevice,
  IconTrustGlobe,
  IconTrustShield,
} from "./icons/LandingIcons";

function splitWords(text: string): string[] {
  return text.split(/\s+/);
}

export function ParallaxHero(): JSX.Element {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const [allowHeavyMotion, setAllowHeavyMotion] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const heavyMotion = !reduce && allowHeavyMotion;

  useEffect(() => {
    const mq = window.matchMedia(
      "(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    const apply = (): void => setAllowHeavyMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!heavyMotion) return;
    const onMove = (e: MouseEvent): void => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      mx.set(Math.max(-1, Math.min(1, x)));
      my.set(Math.max(-1, Math.min(1, y)));
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [heavyMotion, mx, my]);

  const title = t("landing.heroTitle", { defaultValue: "Hero Title" });
  const beforeBrand = title.split("<brand>")[0] ?? "";
  const brandText = title.match(/<brand>(.*?)<\/brand>/)?.[1] ?? "";
  const afterBrand = title.split("</brand>")[1] ?? "";

  const renderWords = (text: string, brand = false, offset = 0): JSX.Element[] =>
    splitWords(text).map((w, i) => (
      <motion.span
        key={`${brand}-${i}-${w}`}
        initial={reduce ? { opacity: 0 } : { y: "100%", opacity: 0 }}
        animate={reduce ? { opacity: 1 } : { y: 0, opacity: 1 }}
        transition={{
          delay: reduce ? 0 : 0.05 * (i + offset),
          duration: reduce ? 0.2 : 0.6,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={`inline-block pr-1 sm:pr-2 ${brand ? "text-brand-primary" : ""}`}
      >
        {w}
      </motion.span>
    ));

  return (
    <section ref={ref} className="relative overflow-hidden pb-12 pt-8 sm:pb-20 sm:pt-12 lg:pt-20 bg-brand-surface">

      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:gap-12 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        <div className="relative z-10 flex flex-col items-center text-center lg:items-start lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex max-w-full flex-wrap items-center gap-2"
          >
            <a
              href="#cta"
              className="group inline-flex max-w-full items-center gap-2 rounded-full border border-brand-border bg-brand-surface py-1 pl-1 pr-2 text-[11px] font-medium text-brand-text shadow-sm transition hover:border-brand-primary/50 hover:shadow-md sm:pr-3 sm:text-xs"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary-soft py-0.5 pl-1.5 pr-2 text-[10px] font-bold uppercase tracking-widest text-brand-primary ring-1 ring-brand-primary/20">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inset-0 animate-ping rounded-full bg-brand-primary/70" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-brand-primary" />
                </span>
                {t("landing.heroMetaStatus", { defaultValue: "Hero Meta Status" })}
              </span>
              <span className="truncate">{t("landing.heroMetaText", { defaultValue: "Hero Meta Text" })}</span>
            </a>
          </motion.div>

          <h1 className="mt-5 text-[2.05rem] font-black leading-[1.08] tracking-tight text-brand-text sm:text-5xl lg:text-6xl">
            <span className="overflow-hidden">{renderWords(beforeBrand.trim())}</span>
            <span className="overflow-hidden">{renderWords(brandText.trim(), true, splitWords(beforeBrand).length)}</span>
            <span className="overflow-hidden">
              {renderWords(afterBrand.trim(), false, splitWords(beforeBrand).length + splitWords(brandText).length)}
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-5 max-w-xl text-base leading-relaxed text-brand-muted sm:text-lg"
          >
            {t("landing.heroSubtitle", { defaultValue: "Hero Subtitle" })}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.5 }}
            className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3"
          >
            <Link
              to="/login"
              className="group inline-flex min-h-11 w-full items-center justify-center gap-2.5 rounded-xl bg-brand-primary px-6 py-3 text-sm font-semibold text-white shadow-popover shadow-brand-primary/25 transition hover:-translate-y-0.5 hover:bg-brand-primary-hover sm:w-auto"
            >
              <span>{t("landing.heroCtaPrimary", { defaultValue: "Hero Cta Primary" })}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 transition group-hover:translate-x-0.5">
                <path d="M5 12h14m-7-7 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <a
              href="#features"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-brand-border bg-brand-surface-soft px-6 py-3 text-sm font-semibold text-brand-text shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-surface-muted sm:w-auto"
            >
              <Trans i18nKey="landing.heroCtaSecondary" defaults="See features" />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="mt-10 flex max-w-lg flex-wrap gap-2.5 border-t border-brand-border-strong pt-6"
          >
            {[
              { Icon: IconTrustCloud, label: t("landing.trustCloud", { defaultValue: "Trust Cloud" }), gradient: "from-sky-500 to-blue-500" },
              { Icon: IconTrustShield, label: t("landing.trustPrivacy", { defaultValue: "Trust Privacy" }), gradient: "from-teal-500 to-teal-500" },
              { Icon: IconTrustDevice, label: t("landing.trustResponsive", { defaultValue: "Trust Responsive" }), gradient: "from-teal-500 to-fuchsia-500" },
              { Icon: IconTrustGlobe, label: t("landing.trustLangs", { defaultValue: "Trust Langs" }), gradient: "from-indigo-500 to-sky-500" },
            ].map((b) => (
              <span
                key={b.label}
                className="group inline-flex items-center gap-1.5 rounded-full border border-brand-border bg-brand-surface py-1 pl-1 pr-3 text-[11px] font-semibold text-brand-text shadow-sm transition hover:-translate-y-0.5"
              >
                <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br ${b.gradient} text-white shadow-sm ring-1 ring-brand-border/10/10`}>
                  <b.Icon className="h-3 w-3" />
                </span>
                {b.label}
              </span>
            ))}
          </motion.div>
        </div>

        <HeroProductVisual />
      </div>
    </section>
  );
}
