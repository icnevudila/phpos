import { motion } from "framer-motion";
import { Suspense, lazy, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { PORTAL_DEMO_SLUG } from "../constants/portal";
import { CookieConsent } from "../components/landing/CookieConsent";
import { AnnouncementBar } from "../components/landing/AnnouncementBar";
import { CapabilitiesList } from "../components/landing/CapabilitiesList";
// Confetti removed
import { DeviceShowcase } from "../components/landing/DeviceShowcase";
import { EverythingInside } from "../components/landing/EverythingInside";
import { FAQ } from "../components/landing/FAQ";
import { FeatureCard, type FeatureDef } from "../components/landing/FeatureCard";
import { FeatureModal } from "../components/landing/FeatureModal";
import { IntegrationsStrip } from "../components/landing/IntegrationsStrip";
import { MobileStickyCTA } from "../components/landing/MobileStickyCTA";
import { NoiseOverlay } from "../components/landing/NoiseOverlay";
import { ParallaxHero } from "../components/landing/ParallaxHero";
import { PricingTeaser } from "../components/landing/PricingTeaser";
import { QuoteAndPricingSection } from "../components/landing/QuoteAndPricingSection";
import { ScrollProgressBar } from "../components/landing/ScrollProgressBar";
import { ScrollReveal, StaggerContainer, StaggerItem } from "../components/landing/ScrollReveal";
import { SectionDivider } from "../components/landing/SectionDivider";
import { SectionEyebrow } from "../components/landing/SectionEyebrow";
import { SideTOC } from "../components/landing/SideTOC";
import { SecurityBlock } from "../components/landing/SecurityBlock";
import { StickyNav } from "../components/landing/StickyNav";
import { TestimonialMarquee } from "../components/landing/TestimonialMarquee";
import { DentQLLogo } from "../components/ui/DentQLLogo";
import {
  IconFlow,
  IconGrid,
  IconQuote,
  IconSparkle,
} from "../components/landing/icons/LandingIcons";
import {
  AppointmentsPreview,
  BillingPreview,
  InventoryPreview,
  OdontogramPreview,
  PatientRecordPreview,
  RevenuePreview,
} from "../components/landing/FeaturePreviews";

const DayInClinic = lazy(async () =>
  import("../components/landing/DayInClinic").then((m) => ({ default: m.DayInClinic })),
);
const HowItWorksTimeline = lazy(async () =>
  import("../components/landing/HowItWorksTimeline").then((m) => ({ default: m.HowItWorksTimeline })),
);
const BeforeAfterSplit = lazy(async () =>
  import("../components/landing/BeforeAfterSplit").then((m) => ({ default: m.BeforeAfterSplit })),
);
const PersonasSection = lazy(async () =>
  import("../components/landing/PersonasSection").then((m) => ({ default: m.PersonasSection })),
);

function SectionFallback(): JSX.Element {
  return <div className="h-32 animate-pulse rounded-2xl bg-slate-100/80 dark:bg-slate-800/50" />;
}

function Check(): JSX.Element {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      className="h-4 w-4"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </motion.svg>
  );
}

function FireflyLogo({ size = "md" }: { size?: "sm" | "md" }): JSX.Element {
  return (
    <DentQLLogo size={size === "sm" ? "sm" : "md"} className={size === "sm" ? "scale-50" : "scale-75"} />
  );
}

function differentiatorIcon(key: string): JSX.Element {
  const pathByKey: Record<string, string> = {
    chairflow: "M7 4h10v3H7zM5 9h14v10H5zM8 12h3M13 12h3M8 15h8",
    xrayflow: "M8 4h8M7 7h10v10H7zM10 10l4 4m0-4-4 4",
    phpay: "M4 8h16M6 5h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm2 10h4",
    hmocc: "M4 6h16M4 12h16M4 18h16M7 6v12",
    livechair: "M8 5h8M7 8h10v5H7zM6 13h12v4H6zM8 17v2m8-2v2",
    philhealth: "M12 3 4 7v5c0 5 3.5 7.5 8 9 4.5-1.5 8-4 8-9V7l-8-4Zm0 6v6m-3-3h6",
  };
  const d = pathByKey[key] ?? pathByKey.chairflow;
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
        <path d={d} className="stroke-current stroke-[1.8]" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function DifferentiatorMiniMock({ type }: { type: string }) {
  const glassCls = "bg-white/95 backdrop-blur-md ring-1 ring-white shadow-xl dark:bg-slate-900/90 dark:ring-slate-800/50";
  
  switch (type) {
    case "chairflow":
      return (
        <div className={`w-full max-w-[210px] rounded-t-2xl p-4 ${glassCls}`}>
           <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Chair 1 Queue</span>
              <span className="text-[9px] font-bold text-emerald-600">3 Pending</span>
           </div>
           <div className="space-y-2">
              <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-2 dark:bg-emerald-950/40">
                 <div className="flex flex-col items-center">
                    <span className="text-[7px] font-black text-emerald-600">08:30</span>
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 </div>
                 <div className="flex-1">
                    <p className="text-[9px] font-bold text-slate-900 dark:text-white leading-tight">Maria Santos</p>
                    <p className="text-[7px] text-slate-500 font-medium">Routine Cleaning</p>
                 </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-2 dark:bg-slate-800/40 opacity-70">
                 <span className="text-[7px] font-black text-slate-400">09:15</span>
                 <div className="flex-1">
                    <p className="text-[9px] font-bold text-slate-700 dark:text-slate-300">Juan Dela Cruz</p>
                    <p className="text-[7px] text-slate-400 font-medium">Dental X-Ray</p>
                 </div>
              </div>
           </div>
        </div>
      );
    case "phpay":
      return (
        <div className="flex items-end gap-3 px-4">
           <div className={`w-28 rounded-t-2xl p-3 pb-6 transition-all duration-500 group-hover:-translate-y-2 ${glassCls}`}>
              <div className="flex justify-between items-center mb-2">
                 <div className="h-6 w-12 rounded bg-[#007DFE] flex items-center justify-center text-[7px] font-black text-white italic">GCash</div>
                 <span className="text-[7px] font-black text-emerald-600">LIVE</span>
              </div>
              <div className="space-y-1.5 border-t border-slate-50 pt-2 dark:border-slate-800">
                 <p className="text-[6px] font-bold text-slate-400 uppercase tracking-tighter">Amount to Collect</p>
                 <p className="text-[11px] font-black text-slate-900 dark:text-white tracking-tighter">₱2,450.00</p>
              </div>
              <button className="mt-3 w-full h-5 rounded-md bg-emerald-600 text-[7px] font-black text-white shadow-sm">PAY NOW</button>
           </div>
           <div className={`w-24 rounded-t-2xl p-3 pb-4 opacity-40 ${glassCls}`}>
              <div className="h-5 w-10 rounded bg-[#D9FD0D] flex items-center justify-center text-[6px] font-black text-slate-900 italic">Maya</div>
              <div className="mt-2 h-1 w-full rounded-full bg-slate-100 dark:bg-slate-800" />
           </div>
        </div>
      );
    case "hmocc":
      return (
        <div className={`w-full max-w-[220px] rounded-t-2xl p-4 ${glassCls}`}>
           <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3 dark:border-slate-800">
              <span className="text-[9px] font-black uppercase tracking-wider text-sky-600">HMO Command Center</span>
              <div className="flex gap-1">
                 <div className="h-1 w-1 rounded-full bg-sky-500" />
                 <div className="h-1 w-1 rounded-full bg-sky-300" />
              </div>
           </div>
           <div className="space-y-2">
              <div className="flex justify-between items-center bg-sky-50/50 p-2 rounded-xl dark:bg-sky-950/20">
                 <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-white shadow-sm dark:bg-slate-800 flex items-center justify-center text-[6px] font-black text-sky-700 leading-none">M</div>
                    <span className="text-[8px] font-bold text-slate-800 dark:text-slate-200">Maxicare Claim</span>
                 </div>
                 <span className="text-[7px] font-black bg-sky-500/10 text-sky-600 px-1.5 py-0.5 rounded-full uppercase">Approved</span>
              </div>
              <div className="flex justify-between items-center bg-indigo-50/50 p-2 rounded-xl dark:bg-indigo-950/20">
                 <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-white shadow-sm dark:bg-slate-800 flex items-center justify-center text-[6px] font-black text-indigo-700 leading-none">I</div>
                    <span className="text-[8px] font-bold text-slate-800 dark:text-slate-200">Intellicare</span>
                 </div>
                 <span className="text-[7px] font-black bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded-full uppercase">Pending</span>
              </div>
           </div>
        </div>
      );
    case "xrayflow":
      return (
        <div className="flex items-end gap-3">
           <div className="h-28 w-24 rounded-2xl bg-slate-900 p-2 shadow-2xl ring-4 ring-white/10 overflow-hidden relative transition-transform duration-500 group-hover:scale-110">
              <div className="absolute inset-x-0 top-0 h-4 flex items-center justify-center gap-1 bg-white/10 text-[6px] font-bold text-white uppercase tracking-widest">Digital X-Ray</div>
              <div className="mt-4 h-full w-full rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 flex flex-col items-center justify-center">
                 <div className="h-12 w-12 rounded-full border-2 border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center relative">
                    <div className="absolute inset-0 rounded-full border border-emerald-500/40 animate-ping" />
                    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-emerald-500 opacity-60">
                       <path d="M12 2a5 5 0 0 0-5 5c0 2 1 3 1 5s-1 4-1 6a3 3 0 0 0 6 0c0-1 .5-1 1-1s1 0 1 1a3 3 0 0 0 6 0c0-2-1-4-1-6s1-3 1-5a5 5 0 0 0-5-5Z" fill="currentColor" />
                    </svg>
                 </div>
              </div>
           </div>
           <div className={`h-24 w-32 rounded-t-2xl p-3 ${glassCls}`}>
              <div className="flex items-center gap-1.5 mb-2">
                 <div className="h-3 w-3 rounded-full bg-emerald-500/20" />
                 <span className="text-[8px] font-black text-slate-800 dark:text-white uppercase tracking-tighter">Tooth 24 Analysis</span>
              </div>
              <div className="space-y-1.5">
                 <div className="h-1 w-full rounded-full bg-slate-100 dark:bg-slate-800" />
                 <div className="h-1 w-3/4 rounded-full bg-slate-100 dark:bg-slate-800" />
                 <div className="mt-2 flex gap-2">
                    <div className="h-3 flex-1 rounded bg-rose-500/10 border border-rose-500/20 text-[6px] font-black text-rose-600 flex items-center justify-center">CAVITY</div>
                    <div className="h-3 flex-1 rounded bg-sky-500/10 border border-sky-500/20 text-[6px] font-black text-sky-600 flex items-center justify-center">RCT</div>
                 </div>
              </div>
           </div>
        </div>
      );
    case "livechair":
      return (
        <div className={`w-full max-w-[230px] rounded-t-2xl p-4 ${glassCls}`}>
           <div className="mb-3 text-[9px] font-black uppercase tracking-wider text-slate-400">Live Operations</div>
           <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border-2 border-emerald-500/30 bg-emerald-50/20 p-2.5 dark:bg-emerald-950/30 relative overflow-hidden group-hover:border-emerald-500 transition-colors">
                 <div className="flex justify-between items-start">
                    <span className="text-[7px] font-black text-emerald-600 uppercase">Chair 01</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                 </div>
                 <p className="mt-1 text-[10px] font-black text-slate-900 dark:text-white">In Surgery</p>
                 <p className="text-[7px] text-emerald-700/80 font-bold mt-0.5">14m elapsed</p>
              </div>
              <div className="rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-2.5 dark:border-slate-800 dark:bg-slate-900/50">
                 <span className="text-[7px] font-black text-slate-400 uppercase">Chair 02</span>
                 <p className="mt-1 text-[10px] font-black text-slate-400">Cleaning</p>
                 <p className="text-[7px] text-slate-300 font-bold mt-0.5">Ready soon</p>
              </div>
           </div>
        </div>
      );
    default:
      return (
        <div className={`w-full max-w-[200px] rounded-t-2xl p-5 ${glassCls}`}>
           <div className="space-y-3">
              <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800" />
              <div className="h-2.5 w-3/4 rounded-full bg-slate-100 dark:bg-slate-800" />
              <div className="h-2.5 w-1/2 rounded-full bg-slate-100 dark:bg-slate-800" />
           </div>
        </div>
      );
  }
}

export function HomePage(): JSX.Element {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  // sent removed
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const features: FeatureDef[] = [
    {
      id: "appointments",
      title: t("landing.f1Title"),
      desc: t("landing.f1Desc"),
      longDesc: t("landing.f1Long"),
      d: "M8 7V3m8 4V3M4 11h16M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z",
      color: "text-sky-600 bg-sky-100",
      accent: "bg-sky-400",
      preview: <AppointmentsPreview />,
      tryInAppPath: "/appointments",
    },
    {
      id: "odontogram",
      title: t("landing.f2Title"),
      desc: t("landing.f2Desc"),
      longDesc: t("landing.f2Long"),
      d: "M12 2a5 5 0 0 0-5 5c0 2 1 3 1 5s-1 4-1 6a3 3 0 0 0 6 0c0-1 .5-1 1-1s1 0 1 1a3 3 0 0 0 6 0c0-2-1-4-1-6s1-3 1-5a5 5 0 0 0-5-5c-1 0-2 .5-2 1s-1 1-2 1-1-.5-2-1-1-1-2-1Z",
      color: "text-emerald-600 bg-emerald-100",
      accent: "bg-emerald-400",
      preview: <OdontogramPreview />,
      tryInAppPath: "/patients",
    },
    {
      id: "records",
      title: t("landing.f3Title"),
      desc: t("landing.f3Desc"),
      longDesc: t("landing.f3Long"),
      d: "M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Zm4 10a8 8 0 0 0-16 0",
      color: "text-indigo-600 bg-indigo-100",
      accent: "bg-indigo-400",
      preview: <PatientRecordPreview />,
      tryInAppPath: "/patients",
    },
    {
      id: "billing",
      title: t("landing.f4Title"),
      desc: t("landing.f4Desc"),
      longDesc: t("landing.f4Long"),
      d: "M3 10h18M5 6h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm2 10h4",
      color: "text-amber-600 bg-amber-100",
      accent: "bg-amber-400",
      preview: <BillingPreview />,
      tryInAppPath: "/invoices",
    },
    {
      id: "inventory",
      title: t("landing.f5Title"),
      desc: t("landing.f5Desc"),
      longDesc: t("landing.f5Long"),
      d: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16ZM3.27 6.96 12 12.01l8.73-5.05M12 22.08V12",
      color: "text-rose-600 bg-rose-100",
      accent: "bg-rose-400",
      preview: <InventoryPreview />,
      tryInAppPath: "/inventory",
    },
    {
      id: "reports",
      title: t("landing.f6Title"),
      desc: t("landing.f6Desc"),
      longDesc: t("landing.f6Long"),
      d: "M3 3v18h18M7 16l4-4 4 4 6-6",
      color: "text-sky-600 bg-sky-100",
      accent: "bg-sky-400",
      preview: <RevenuePreview />,
      tryInAppPath: "/dashboard",
    },
  ];

  const localFeatures = [t("landing.local1"), t("landing.local2"), t("landing.local3"), t("landing.local4")];
  const differentiators = [
    { key: "chairflow", title: t("landing.diff1Title"), desc: t("landing.diff1Desc"), path: "/appointments" },
    { key: "xrayflow", title: t("landing.diff2Title"), desc: t("landing.diff2Desc"), path: "/patients" },
    { key: "phpay", title: t("landing.diff3Title"), desc: t("landing.diff3Desc"), path: "/invoices" },
    { key: "hmocc", title: t("landing.diff4Title"), desc: t("landing.diff4Desc"), path: "/hmo-claims" },
    { key: "livechair", title: t("landing.diff5Title"), desc: t("landing.diff5Desc"), path: "/dashboard" },
    { key: "philhealth", title: t("landing.diff6Title"), desc: t("landing.diff6Desc"), path: "/patients" },
  ];
  const diffProofStats = [
    { value: t("landing.diffStat1Value"), label: t("landing.diffStat1Label") },
    { value: t("landing.diffStat2Value"), label: t("landing.diffStat2Label") },
    { value: t("landing.diffStat3Value"), label: t("landing.diffStat3Label") },
  ];
  const diffProofBadges = [t("landing.diffProof1"), t("landing.diffProof2"), t("landing.diffProof3"), t("landing.diffProof4")];

  function submitEmail(e: React.FormEvent): void {
    e.preventDefault();
  }

  const activeFeatureDef = features.find((f) => f.id === activeFeature) ?? null;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white text-slate-800 dark:bg-slate-950 dark:text-slate-300">
      <ScrollProgressBar />
      <NoiseOverlay />
      <AnnouncementBar />
      <StickyNav />
      <SideTOC />
      <MobileStickyCTA />

      <main
        id="main"
        tabIndex={-1}
        className="outline-none pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0"
      >
      <div id="hero">
        <ParallaxHero />
      </div>

      {/* LOCAL FEATURES STRIP */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <ScrollReveal>
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <SectionEyebrow label={t("landing.localEyebrow")} icon={IconSparkle} accent="emerald" />
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                  {t("landing.localTitle")}
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-bold text-emerald-700 shadow-sm dark:border-emerald-900/50 dark:bg-slate-950 dark:text-emerald-400">
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {t("landing.localBadge")}
              </span>
            </div>
            <StaggerContainer className="mt-6 grid gap-3 sm:grid-cols-2" stagger={0.08}>
              {localFeatures.map((item) => (
                <StaggerItem key={item}>
                  <div className="flex items-start gap-3 rounded-xl bg-white/80 p-3 shadow-sm ring-1 ring-slate-100 dark:bg-slate-950/70 dark:ring-slate-800">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <Check />
                    </span>
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{item}</span>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </ScrollReveal>
      </section>

      {/* DIFFERENTIATORS */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <ScrollReveal>
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <SectionEyebrow label={t("landing.diffEyebrow")} icon={IconSparkle} accent="sky" />
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                  {t("landing.diffTitle")}
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">{t("landing.diffSubtitle")}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-white px-3 py-1 text-xs font-bold text-sky-700 shadow-sm dark:border-sky-900/50 dark:bg-slate-950 dark:text-sky-400">
                <span className="flex h-1.5 w-1.5 rounded-full bg-sky-500" />
                {t("landing.diffBadge")}
              </span>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {diffProofStats.map((item) => (
                <div key={item.label} className="rounded-xl border border-sky-200/70 bg-sky-50/70 p-3 shadow-sm dark:border-sky-900/60 dark:bg-sky-950/25">
                  <p className="text-lg font-bold text-sky-900 dark:text-sky-300">{item.value}</p>
                  <p className="mt-0.5 text-xs font-medium text-sky-800/90 dark:text-sky-400">{item.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {diffProofBadges.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex min-h-9 items-center rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300"
                >
                  {badge}
                </span>
              ))}
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {differentiators.map((item) => (
                <article key={item.title} className="group relative flex flex-col overflow-hidden rounded-[2.5rem] border border-slate-200/80 bg-white/90 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/70">
                  <div className="p-8">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 dark:bg-emerald-950/30 dark:ring-emerald-900/50">
                      {differentiatorIcon(item.key)}
                    </div>
                    <p className="text-xl font-black text-slate-900 dark:text-white">{item.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{item.desc}</p>
                  </div>
                  
                  {/* Mini Mockup Area */}
                  <div className="relative mt-auto h-32 overflow-hidden bg-slate-50/50 px-6 dark:bg-slate-950/20">
                     <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-800" />
                     <div className="flex h-full items-end justify-center pt-4 transition-transform duration-500 group-hover:translate-y-[-4px]">
                        <DifferentiatorMiniMock type={item.key} />
                     </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* FEATURES */}
      <section id="features" className="scroll-mt-24 relative z-10 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <ScrollReveal>
            <div className="mx-auto max-w-2xl text-center">
              <SectionEyebrow label={t("landing.featuresEyebrow")} icon={IconGrid} accent="emerald" align="center" />
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                {t("landing.featuresTitle")}
              </h2>
              <p className="mt-4 text-slate-600 dark:text-slate-400">{t("landing.featuresSubtitle")}</p>
            </div>
          </ScrollReveal>

          <StaggerContainer className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.07}>
            {features.map((f) => (
              <StaggerItem key={f.id}>
                <FeatureCard
                  id={f.id}
                  title={f.title}
                  desc={f.desc}
                  d={f.d}
                  color={f.color}
                  accent={f.accent}
                  onClick={() => setActiveFeature(f.id)}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <FeatureModal feature={activeFeatureDef} onClose={() => setActiveFeature(null)} />

      {/* CAPABILITIES — reference-inspired detailed list */}
      <section className="relative z-10 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <ScrollReveal>
            <CapabilitiesList />
          </ScrollReveal>
        </div>
      </section>

      {/* DAY IN CLINIC — scroll storytelling */}
      <section id="day" className="scroll-mt-24 relative z-10 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Suspense fallback={<SectionFallback />}>
            <DayInClinic />
          </Suspense>
        </div>
      </section>

      <SectionDivider variant="wave" fromColor="rgba(16,185,129,0.08)" toColor="rgba(139,92,246,0.08)" />

      {/* DEVICE SHOWCASE */}
      <section id="devices" className="relative z-10 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <ScrollReveal>
            <DeviceShowcase />
          </ScrollReveal>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="relative z-10 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <ScrollReveal>
            <div className="mx-auto max-w-2xl text-center">
              <SectionEyebrow label={t("landing.howEyebrow")} icon={IconFlow} accent="sky" align="center" />
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                {t("landing.howTitle")}
              </h2>
            </div>
          </ScrollReveal>
          <Suspense fallback={<SectionFallback />}>
            <HowItWorksTimeline />
          </Suspense>
        </div>
      </section>

      {/* BEFORE / AFTER */}
      <section id="ba" className="relative z-10 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <ScrollReveal>
            <Suspense fallback={<SectionFallback />}>
              <BeforeAfterSplit />
            </Suspense>
          </ScrollReveal>
        </div>
      </section>

      {/* PERSONAS */}
      <section id="personas" className="scroll-mt-24 relative z-10 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <ScrollReveal>
            <Suspense fallback={<SectionFallback />}>
              <PersonasSection />
            </Suspense>
          </ScrollReveal>
        </div>
      </section>

      {/* EVERYTHING INSIDE — feature chips */}
      <section id="inside" className="relative z-10 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <ScrollReveal>
            <EverythingInside />
          </ScrollReveal>
        </div>
      </section>

      {/* INTEGRATIONS STRIP */}
      <section className="relative z-10 pb-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <ScrollReveal>
            <IntegrationsStrip />
          </ScrollReveal>
        </div>
      </section>

      {/* SECURITY */}
      <section id="security" className="relative z-10 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollReveal>
            <SecurityBlock />
          </ScrollReveal>
        </div>
      </section>

      <div className="h-px w-full bg-slate-100 dark:bg-slate-800" />

      {/* PRICING TEASER */}
      <section id="pricing" className="scroll-mt-24 relative z-10 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <ScrollReveal>
            <PricingTeaser ctaHref="/contact" />
          </ScrollReveal>
        </div>
      </section>

      <QuoteAndPricingSection />

      {/* TESTIMONIALS — horizontal marquee */}
      <section id="testimonials" className="relative z-10 overflow-hidden py-12 sm:py-16 md:py-20">

        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <ScrollReveal>
            <div className="mx-auto max-w-2xl text-center">
              <SectionEyebrow label={t("landing.testiEyebrow")} icon={IconQuote} accent="rose" align="center" />
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white lg:text-5xl">
                {t("landing.testiTitle")}
              </h2>
            </div>
          </ScrollReveal>
          <div className="mt-12 sm:mt-16">
            <TestimonialMarquee />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative z-10 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <ScrollReveal>
            <FAQ contactHref="/contact" />
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="scroll-mt-24 relative z-10 pb-12 sm:pb-16 md:pb-20">
        <ScrollReveal>
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <motion.div
              className="relative overflow-hidden rounded-3xl p-6 text-white shadow-2xl sm:p-10 lg:p-12 bg-slate-900 dark:bg-emerald-950"
            >

              <div className="relative flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md ring-1 ring-white/30">
                  <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                  Limited Beta slots
                </div>
                <h2 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                  Ready to modernize your clinic?
                </h2>
                <p className="mt-6 max-w-2xl text-lg font-medium text-white/80">
                  Join the free demo list. We'll help you set up your clinic, import your patients, and train your staff in a single afternoon.
                </p>

                <form onSubmit={submitEmail} className="mt-10 flex w-full max-w-xl flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your work email..."
                    className="h-14 flex-1 rounded-2xl border-none bg-white/10 px-6 text-white placeholder:text-white/40 focus:ring-2 focus:ring-white/40 backdrop-blur-md"
                  />
                  <button
                    type="submit"
                    className="h-14 rounded-2xl bg-white px-8 text-sm font-black uppercase tracking-widest text-emerald-600 transition hover:bg-emerald-50 hover:shadow-xl active:scale-95"
                  >
                    Firefly Professional OS v4.2                </button>
                </form>

                <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-4 opacity-80">
                  {["Free setup", "No card required", "24/7 Support"].map((point) => (
                    <div key={point} className="flex items-center gap-2 text-xs font-bold">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[8px]">✓</span>
                      {point}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </ScrollReveal>
      </section>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-slate-200 bg-white/70 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))] backdrop-blur dark:border-slate-800 dark:bg-slate-950/70 sm:py-12">
        <ScrollReveal>
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              <div className="col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2">
                  <FireflyLogo size="sm" />
                </div>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-400">{t("landing.footerTagline")}</p>
              </div>
              {[
                {
                  title: t("landing.footerProduct"),
                  intro: t("landing.footerProductIntro"),
                  links: [
                    { label: t("landing.footerFeatures"), to: "/#features" },
                    { label: t("landing.footerPricing"), to: "/pricing" },
                    { label: t("landing.footerHowItWorks"), to: "/#how" },
                    { label: t("landing.footerFaq"), to: "/faq" },
                    { label: t("landing.footerStaffSignIn"), to: "/login" },
                    { label: t("landing.navPatientPortal"), to: `/${PORTAL_DEMO_SLUG}/portal/login` },
                    { label: t("landing.navKioskMode"), to: `/${PORTAL_DEMO_SLUG}/kiosk` },
                  ],
                },
                {
                  title: t("landing.footerCompany"),
                  intro: t("landing.footerCompanyIntro"),
                  links: [
                    { label: t("landing.footerAbout"), to: "/about" },
                    { label: t("landing.footerContactQuotes"), to: "/contact" },
                    { label: t("landing.footerTestimonials"), to: "/#testimonials" },
                    { label: t("landing.footerSecurityOverview"), to: "/#security" },
                  ],
                },
                {
                  title: t("landing.footerLegal"),
                  intro: t("landing.footerLegalIntro"),
                  links: [
                    { label: t("landing.footerPrivacy"), to: "/privacy" },
                    { label: t("landing.footerTerms"), to: "/terms" },
                    { label: t("landing.footerCookies"), to: "/cookies" },
                  ],
                },
              ].map((col) => (
                <div key={col.title}>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{col.title}</p>
                  {col.intro ? (
                    <p className="mt-2 max-w-xs text-xs leading-relaxed text-slate-500 dark:text-slate-400">{col.intro}</p>
                  ) : null}
                  <ul className="mt-3 space-y-1">
                    {col.links.map((item) => {
                      const isHash = item.to.includes("#");
                      const cls =
                        "flex min-h-11 items-center rounded-lg text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-white";
                      return (
                        <li key={`${item.to}-${item.label}`}>
                          {isHash ? (
                            <a href={item.to} className={cls}>
                              {item.label}
                            </a>
                          ) : (
                            <Link to={item.to} className={cls}>
                              {item.label}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-10 border-t border-slate-200 pt-6 text-center dark:border-slate-800">
              <p className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span>{t("landing.kbdHint").split("·")[0].trim()}</span>
                <span className="text-slate-400 dark:text-slate-600">·</span>
                <span>{t("landing.kbdHint").split("·")[1]?.trim()}</span>
              </p>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-500">
                {t("landing.footerCopyright", { year: new Date().getFullYear() })}
              </p>
            </div>
          </div>
        </ScrollReveal>
      </footer>
      <CookieConsent />
    </div>
  );
}
