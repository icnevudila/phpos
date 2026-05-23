import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { SectionEyebrow } from "./SectionEyebrow";
import { IconSparkle } from "./icons/LandingIcons";

const fieldClass =
  "mt-1 w-full min-h-11 rounded-xl border border-brand-border-strong bg-brand-surface px-3 py-2 text-sm text-brand-text placeholder:text-brand-muted focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30    ";

export function QuoteAndPricingSection(): JSX.Element {
  const { t } = useTranslation();
  const [clinic, setClinic] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  function submit(e: React.FormEvent): void {
    e.preventDefault();
    if (!clinic.trim() || !name.trim() || !email.trim()) return;
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      setDone(true);
      setClinic("");
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    }, 650);
  }

  const plans = [
    {
      key: "starter",
      name: t("landing.quotePlanStarter"),
      price: t("landing.quotePlanPriceStarter"),
      blurb: t("landing.quotePlanBlurbStarter"),
      accent: "from-teal-400 to-sky-500",
    },
    {
      key: "pro",
      name: t("landing.quotePlanPro"),
      price: t("landing.quotePlanPricePro"),
      blurb: t("landing.quotePlanBlurbPro"),
      accent: "from-teal-500 to-fuchsia-500",
    },
    {
      key: "ent",
      name: t("landing.quotePlanEnterprise"),
      price: t("landing.quotePlanPriceEnt"),
      blurb: t("landing.quotePlanBlurbEnt"),
      accent: "from-amber-400 to-rose-500",
    },
  ] as const;

  return (
    <section
      id="quote-band"
      className="scroll-mt-24 relative z-10 border-y border-teal-200/60 bg-gradient-to-br from-white via-teal-50/40 to-sky-50/30 py-12 sm:py-16 md:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <SectionEyebrow label={t("landing.quoteBandEyebrow")} icon={IconSparkle} accent="emerald" align="center" />
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-brand-text sm:text-3xl md:text-4xl">
            {t("landing.quoteBandTitle")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-brand-muted sm:text-base">
            {t("landing.quoteBandSubtitle")}
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="rounded-3xl border border-brand-border/80 bg-brand-surface/90 p-5 shadow-lg shadow-slate-900/5 backdrop-blur-sm sm:p-7">
            <h3 className="text-lg font-bold text-brand-text">{t("landing.quoteBandPricingTitle")}</h3>
            <p className="mt-1 text-xs text-brand-muted">{t("landing.quoteBandPricingHint")}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {plans.map((p) => (
                <div
                  key={p.key}
                  className="flex flex-col rounded-2xl border border-brand-border bg-brand-surface-soft/80 p-4"
                >
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${p.accent} text-xs font-bold text-white shadow`}
                  >
                    {p.name.slice(0, 1)}
                  </span>
                  <p className="mt-3 text-sm font-bold text-brand-text">{p.name}</p>
                  <p className="text-lg font-extrabold text-brand-text">{p.price}</p>
                  <p className="mt-1 flex-1 text-xs leading-relaxed text-brand-muted">{p.blurb}</p>
                </div>
              ))}
            </div>
            <Link
              to="/pricing"
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-brand-border-strong text-sm font-bold text-brand-text transition hover:bg-brand-surface-soft sm:w-auto sm:px-5"
            >
              {t("landing.quoteBandSeePricing")}
            </Link>
          </div>

          <div className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-lg sm:p-7">
            <AnimatePresence mode="wait">
              {done ? (
                <motion.div
                  key="ok"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex min-h-[280px] flex-col items-center justify-center gap-3 px-2 text-center"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-500 text-2xl text-white shadow-lg">
                    ✓
                  </span>
                  <p className="text-lg font-bold text-brand-text">{t("landing.quoteSuccess")}</p>
                  <Link to="/contact" className="text-sm font-semibold text-sky-600 underline-offset-2 hover:underline">
                    {t("pages.contact.title")}
                  </Link>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={submit}
                  className="space-y-4"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                        {t("landing.quoteFieldClinic")}
                      </label>
                      <input className={fieldClass} required value={clinic} onChange={(e) => setClinic(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                        {t("landing.quoteFieldName")}
                      </label>
                      <input className={fieldClass} required value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                        {t("landing.quoteFieldEmail")}
                      </label>
                      <input
                        type="email"
                        className={fieldClass}
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                        {t("landing.quoteFieldPhone")}
                      </label>
                      <input className={fieldClass} value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                        {t("landing.quoteFieldMessage")}
                      </label>
                      <textarea
                        className={`${fieldClass} min-h-24 resize-y`}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={t("landing.quotePlaceholderMessage")}
                      />
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-brand-muted">
                    {t("landing.quotePrivacy")}{" "}
                    <Link to="/privacy" className="font-semibold text-sky-600 underline-offset-2 hover:underline">
                      {t("landing.footerPrivacy")}
                    </Link>
                  </p>
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full min-h-12 rounded-xl bg-gradient-to-r from-teal-500 to-sky-600 text-sm font-bold text-white shadow-lg transition hover:opacity-95 disabled:opacity-60 sm:w-auto sm:px-8"
                  >
                    {busy ? t("landing.quoteSubmitting") : t("landing.quoteSubmit")}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
