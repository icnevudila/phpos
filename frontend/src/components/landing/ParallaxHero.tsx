import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { LaptopDashboardMock, LaptopInventoryMock, PhonesStack } from "./DeviceMockups";
import {
  IconTrustCloud,
  IconTrustDevice,
  IconTrustGlobe,
  IconTrustShield,
} from "./icons/LandingIcons";

function LeafBlob({ className = "", flip = false }: { className?: string; flip?: boolean }): JSX.Element {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`pointer-events-none absolute select-none text-emerald-300/40 ${className}`}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      aria-hidden
    >
      <path d="M30 180 C 20 120, 60 50, 170 20 C 160 90, 120 160, 30 180 Z" fill="currentColor" />
      <path d="M50 160 C 80 100, 120 60, 160 40" stroke="#ffffff" strokeOpacity={0.6} strokeWidth={2} fill="none" />
      <path d="M70 165 C 95 120, 130 90, 155 70" stroke="#ffffff" strokeOpacity={0.4} strokeWidth={1.5} fill="none" />
    </svg>
  );
}

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
  const smx = useSpring(mx, { stiffness: 50, damping: 20 });
  const smy = useSpring(my, { stiffness: 50, damping: 20 });

  const blobX1 = useTransform(smx, (v) => v * -12);
  const blobY1 = useTransform(smy, (v) => v * -12);
  const blobX2 = useTransform(smx, (v) => v * 18);
  const blobY2 = useTransform(smy, (v) => v * 10);
  const laptopTilt = useTransform(smx, (v) => v * 3);
  const laptopTiltY = useTransform(smy, (v) => v * -2);
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

  const title = t("landing.heroTitle");
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
        className={`inline-block pr-1 sm:pr-2 ${brand ? "text-emerald-600" : ""}`}
      >
        {w}
      </motion.span>
    ));

  const [scene, setScene] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setScene((s) => (s + 1) % 3);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section ref={ref} className="relative overflow-hidden pb-12 pt-8 sm:pb-20 sm:pt-12 lg:pt-20">




      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:gap-12 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        <div className="relative z-10 flex flex-col items-center text-center lg:items-start lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex max-w-full flex-wrap items-center gap-2"
          >
            <a
              href="#cta"
              className="group inline-flex max-w-full items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 py-1 pl-1 pr-2 text-[11px] font-medium text-slate-700 shadow-sm backdrop-blur-md transition hover:shadow-md sm:pr-3 sm:text-xs dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 py-0.5 pl-1.5 pr-2 text-[10px] font-bold uppercase tracking-widest text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-900/60">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/70" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                {t("landing.heroMetaStatus")}
              </span>
              <span className="truncate">{t("landing.heroMetaText")}</span>
            </a>
          </motion.div>

          <h1 className="mt-5 text-[2.05rem] font-black leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
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
            className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-400"
          >
            {t("landing.heroSubtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.5 }}
            className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3"
          >
            <Link
              to="/login"
              className="group relative inline-flex min-h-11 w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:shadow-xl sm:w-auto dark:bg-emerald-600 dark:shadow-emerald-500/20"
            >
              <span className="relative">{t("landing.heroCtaPrimary")}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="relative h-4 w-4 transition group-hover:translate-x-0.5">
                <path d="M5 12h14m-7-7 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <a
              href="#cta"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 sm:w-auto"
            >
              <Trans i18nKey="landing.heroCtaSecondaryAlt" defaults="Book a demo" />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="mt-10 flex max-w-lg flex-wrap gap-2.5 border-t border-slate-200/70 pt-6 dark:border-slate-800/70"
          >
            {[
              { Icon: IconTrustCloud, label: t("landing.trustCloud"), gradient: "from-sky-500 to-blue-500" },
              { Icon: IconTrustShield, label: t("landing.trustPrivacy"), gradient: "from-emerald-500 to-teal-500" },
              { Icon: IconTrustDevice, label: t("landing.trustResponsive"), gradient: "from-violet-500 to-fuchsia-500" },
              { Icon: IconTrustGlobe, label: t("landing.trustLangs"), gradient: "from-indigo-500 to-sky-500" },
            ].map((b) => (
              <span
                key={b.label}
                className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/80 py-1 pl-1 pr-3 text-[11px] font-semibold text-slate-700 shadow-sm backdrop-blur-md transition hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200"
              >
                <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br ${b.gradient} text-white shadow-sm ring-1 ring-white/40`}>
                  <b.Icon className="h-3 w-3" />
                </span>
                {b.label}
              </span>
            ))}
          </motion.div>
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={scene}
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 1.05 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              style={{ rotateY: reduce ? 0 : laptopTilt, rotateX: reduce ? 0 : laptopTiltY }}
              className="relative"
            >
              {scene === 0 && (
                <div className="relative">
                  <LaptopDashboardMock />
                  <div className="absolute -bottom-10 -right-4 hidden lg:block scale-75 origin-bottom-right">
                    <PhonesStack />
                  </div>
                </div>
              )}
              {scene === 1 && (
                <div className="relative">
                  <LaptopInventoryMock />
                  <div className="absolute -bottom-10 -right-4 hidden lg:block scale-75 origin-bottom-right">
                    <PhonesStack variant={1} />
                  </div>
                </div>
              )}
              {scene === 2 && (
                <div className="relative">
                  <div className="scale-90 opacity-40 blur-[2px] transition-all">
                    <LaptopDashboardMock />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pt-8">
                    <div className="scale-110 shadow-2xl transition-all hover:scale-115">
                      <PhonesStack variant={0} />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          
          <div className="absolute -bottom-16 left-1/2 flex -translate-x-1/2 gap-3">
             {[0, 1, 2].map(i => (
               <button 
                key={i} 
                onClick={() => setScene(i)}
                className={`h-1.5 transition-all duration-300 rounded-full ${scene === i ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-300 dark:bg-slate-800'}`}
               />
             ))}
          </div>
        </div>
      </div>
    </section>
  );
}
