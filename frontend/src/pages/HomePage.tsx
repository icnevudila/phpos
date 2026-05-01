import { AnimatePresence, motion } from "framer-motion";
import { Suspense, lazy, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { PORTAL_DEMO_SLUG } from "../constants/portal";
import { AnnouncementBar } from "../components/landing/AnnouncementBar";
import { CapabilitiesList } from "../components/landing/CapabilitiesList";
import { Confetti } from "../components/landing/Confetti";
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

function DentEaseLogo({ size = "md" }: { size?: "sm" | "md" }): JSX.Element {
  const dims = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  return (
    <div className={`flex ${dims} items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 text-white shadow-md`}>
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M12 2a5 5 0 0 0-5 5c0 2 1 3 1 5s-1 4-1 6a3 3 0 0 0 6 0c0-1 .5-1 1-1s1 0 1 1a3 3 0 0 0 6 0c0-2-1-4-1-6s1-3 1-5a5 5 0 0 0-5-5c-1 0-2 .5-2 1s-1 1-2 1-1-.5-2-1-1-1-2-1Z" />
      </svg>
    </div>
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

export function HomePage(): JSX.Element {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
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
    if (email.trim()) setSent(true);
  }

  const activeFeatureDef = features.find((f) => f.id === activeFeature) ?? null;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-emerald-50 via-white to-emerald-50 text-slate-800 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 dark:text-slate-300">
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
          <div className="rounded-3xl border border-emerald-200/70 bg-gradient-to-br from-white to-emerald-50/60 p-5 shadow-sm backdrop-blur sm:p-8 dark:border-emerald-900/50 dark:from-slate-900 dark:to-slate-900">
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
          <div className="rounded-3xl border border-sky-200/70 bg-gradient-to-br from-white to-sky-50/70 p-5 shadow-sm sm:p-8 dark:border-sky-900/50 dark:from-slate-900 dark:to-slate-900">
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
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {differentiators.map((item) => (
                <article key={item.title} className="rounded-xl border border-slate-200/80 bg-white/90 p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/70">
                  <div className="mb-1">{differentiatorIcon(item.key)}</div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{item.desc}</p>
                  <Link
                    to={item.path}
                    className="mt-3 inline-flex min-h-10 items-center rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-800 transition hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300 dark:hover:bg-sky-950/60 dark:focus-visible:ring-offset-slate-950"
                  >
                    {t("landing.diffCta")}
                  </Link>
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

      <SectionDivider variant="curve" fromColor="rgba(16,185,129,0.06)" toColor="rgba(56,189,248,0.08)" />

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
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-10 h-72 w-72 rounded-full bg-rose-200/30 blur-3xl" />
          <div className="absolute right-1/4 bottom-10 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />
        </div>
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
              className="relative overflow-hidden rounded-3xl p-6 text-white shadow-2xl sm:p-10 lg:p-12"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #10b981 0%, #0ea5e9 45%, #6366f1 100%)",
                backgroundSize: "200% 200%",
              }}
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/10 to-white/0" />
              <div className="relative grid items-center gap-8 md:grid-cols-[1.2fr_1fr]">
                <div>
                  <h2 className="text-3xl font-bold sm:text-4xl">{t("landing.newsletterTitle")}</h2>
                  <p className="mt-3 text-emerald-50">{t("landing.newsletterSubtitle")}</p>
                </div>
                <form onSubmit={submitEmail} className="space-y-3">
                  <AnimatePresence mode="wait">
                    {sent ? (
                      <motion.div
                        key="sent"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative rounded-xl bg-white/15 p-4 text-center text-sm font-semibold ring-1 ring-white/30"
                      >
                        <Confetti />
                        <p className="font-semibold">✓ {t("landing.newsletterSuccess")}</p>
                        <p className="mt-1 text-xs font-normal opacity-80">
                          {t("landing.newsletterStep2")}
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col gap-2 sm:flex-row"
                      >
                        <div className="relative flex-1">
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t("landing.newsletterPlaceholder")}
                            className="w-full rounded-xl bg-white px-4 py-3 pr-10 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-white/40"
                          />
                          <AnimatePresence>
                            {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                              <motion.span
                                key="ok"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                transition={{ type: "spring", stiffness: 420, damping: 22 }}
                                aria-label={t("landing.newsletterInlineOk")}
                                className="absolute right-3 top-1/2 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-3 w-3">
                                  <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </div>
                        <motion.button
                          type="submit"
                          whileTap={{ scale: 0.97 }}
                          whileHover={{ y: -2 }}
                          className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-slate-800"
                        >
                          {t("landing.newsletterButton")}
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
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
                  <DentEaseLogo size="sm" />
                  <span className="font-bold text-slate-900 dark:text-white">{t("common.appName")}</span>
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
    </div>
  );
}
