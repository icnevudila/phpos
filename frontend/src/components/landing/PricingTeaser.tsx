import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { SectionEyebrow } from "./SectionEyebrow";
import { IconCrown, IconPriceTag } from "./icons/LandingIcons";

interface Plan {
  key: string;
  name: string;
  price: string;
  priceNote: string;
  desc: string;
  features: string[];
  cta: string;
  /** Dahili rota `/…` veya tam URL */
  ctaHref: string;
  popular?: boolean;
  accent: string;
  ring: string;
}

export function PricingTeaser({ ctaHref: ctaHrefOverride }: { ctaHref?: string } = {}): JSX.Element {
  const { t } = useTranslation();
  const ctaHref = ctaHrefOverride ?? "/login";

  const plans: Plan[] = [
    {
      key: "beta",
      name: t("landing.plan1Name"),
      price: t("landing.plan1Price"),
      priceNote: t("landing.plan1PriceNote"),
      desc: t("landing.plan1Desc"),
      features: [
        t("landing.plan1F1"),
        t("landing.plan1F2"),
        t("landing.plan1F3"),
        t("landing.plan1F4"),
        t("landing.plan1F5"),
      ],
      cta: t("landing.plan1Cta"),
      ctaHref,
      accent: "from-teal-400 to-sky-500",
      ring: "ring-teal-300",
    },
    {
      key: "standard",
      name: t("landing.plan2Name"),
      price: t("landing.plan2Price"),
      priceNote: t("landing.plan2PriceNote"),
      desc: t("landing.plan2Desc"),
      features: [
        t("landing.plan2F1"),
        t("landing.plan2F2"),
        t("landing.plan2F3"),
        t("landing.plan2F4"),
        t("landing.plan2F5"),
      ],
      cta: t("landing.plan2Cta"),
      ctaHref,
      popular: true,
      accent: "from-teal-500 to-fuchsia-500",
      ring: "ring-teal-300",
    },
    {
      key: "multi",
      name: t("landing.plan3Name"),
      price: t("landing.plan3Price"),
      priceNote: t("landing.plan3PriceNote"),
      desc: t("landing.plan3Desc"),
      features: [
        t("landing.plan3F1"),
        t("landing.plan3F2"),
        t("landing.plan3F3"),
        t("landing.plan3F4"),
        t("landing.plan3F5"),
      ],
      cta: t("landing.plan3Cta"),
      ctaHref,
      accent: "from-amber-400 to-rose-500",
      ring: "ring-amber-300",
    },
  ];

  return (
    <div>
      <div className="mx-auto max-w-2xl text-center">
        <SectionEyebrow label={t("landing.pricingEyebrow")} icon={IconPriceTag} accent="emerald" align="center" />
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-brand-text sm:text-4xl">
          {t("landing.pricingTitle")}
        </h2>
        <p className="mt-4 text-brand-muted">{t("landing.pricingSubtitle")}</p>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {plans.map((p, i) => (
          <motion.div
            key={p.key}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={`relative flex flex-col rounded-[2.5rem] p-8 transition-all duration-500 hover:-translate-y-2 ${ p.popular ? "bg-brand-surface shadow-[0_30px_60px_-12px_rgba(16,185,129,0.15)] ring-2 ring-teal-500 " : "border border-brand-border bg-brand-surface/50 shadow-sm backdrop-blur-sm hover:shadow-xl " }`}
          >
            {p.popular && (
              <span
                className={`absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-gradient-to-r ${p.accent} py-1 pl-1.5 pr-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_4px_12px_-2px_rgba(16,185,129,0.4),0_2px_4px_rgba(15,23,42,0.08)] ring-1 ring-brand-border/10/40`}
              >
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-brand-surface/20 ring-1 ring-brand-border/10/40">
                  <IconCrown className="h-2.5 w-2.5 text-white" />
                </span>
                {t("landing.pricingPopular")}
              </span>
            )}

            <div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${p.accent} text-xs font-bold text-white shadow-md`}>
                  {i + 1}
                </span>
                <p className="text-sm font-bold text-brand-text">{p.name}</p>
              </div>
              <p className="mt-1 text-xs text-brand-muted">{p.desc}</p>
            </div>

            <div className="mt-5 border-b border-brand-border pb-5">
              <p className="text-3xl font-extrabold tracking-tight text-brand-text sm:text-4xl">
                {p.price}
              </p>
              <p className="mt-1 text-xs font-semibold text-brand-muted">{p.priceNote}</p>
            </div>

            <ul className="mt-5 flex-1 space-y-2.5">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <span
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${p.accent} text-white`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-2.5 w-2.5">
                      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-brand-text">{f}</span>
                </li>
              ))}
            </ul>

            {p.ctaHref.startsWith("/") ? (
              <Link
                to={p.ctaHref}
                className={`mt-6 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-sm font-bold transition ${
                  p.popular
                    ? `bg-gradient-to-r ${p.accent} text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg`
                    : "bg-brand-surface text-white hover:bg-brand-bg   "
                }`}
              >
                {p.cta}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-3.5 w-3.5">
                  <path d="M5 12h14m-7-7 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            ) : (
              <a
                href={p.ctaHref}
                className={`mt-6 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-sm font-bold transition ${
                  p.popular
                    ? `bg-gradient-to-r ${p.accent} text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg`
                    : "bg-brand-surface text-white hover:bg-brand-bg   "
                }`}
              >
                {p.cta}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-3.5 w-3.5">
                  <path d="M5 12h14m-7-7 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            )}
          </motion.div>
        ))}
      </div>

      <p className="mx-auto mt-8 max-w-xl text-center text-xs text-brand-muted">
        {t("landing.pricingFinePrint")}
      </p>
    </div>
  );
}
