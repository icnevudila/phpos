import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { SectionEyebrow } from "./SectionEyebrow";
import { IconSparkle } from "./icons/LandingIcons";

const fieldClass =
  "mt-1 w-full min-h-11 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500";

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
      accent: "from-emerald-400 to-sky-500",
    },
    {
      key: "pro",
      name: t("landing.quotePlanPro"),
      price: t("landing.quotePlanPricePro"),
      blurb: t("landing.quotePlanBlurbPro"),
      accent: "from-violet-500 to-fuchsia-500",
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
      className="scroll-mt-24 relative z-10 border-y border-emerald-200/60 bg-gradient-to-br from-white via-emerald-50/40 to-sky-50/30 py-12 sm:py-16 md:py-20 dark:border-emerald-900/40 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <SectionEyebrow label={t("landing.quoteBandEyebrow")} icon={IconSparkle} accent="emerald" align="center" />
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl dark:text-white">
            {t("landing.quoteBandTitle")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
            {t("landing.quoteBandSubtitle")}
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-lg shadow-slate-900/5 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80 sm:p-7">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t("landing.quoteBandPricingTitle")}</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t("landing.quoteBandPricingHint")}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {plans.map((p) => (
                <div
                  key={p.key}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-950/60"
                >
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${p.accent} text-xs font-bold text-white shadow`}
                  >
                    {p.name.slice(0, 1)}
                  </span>
                  <p className="mt-3 text-sm font-bold text-slate-900 dark:text-white">{p.name}</p>
                  <p className="text-lg font-extrabold text-slate-900 dark:text-white">{p.price}</p>
                  <p className="mt-1 flex-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{p.blurb}</p>
                </div>
              ))}
            </div>
            <Link
              to="/pricing"
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-slate-300 text-sm font-bold text-slate-800 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800 sm:w-auto sm:px-5"
            >
              {t("landing.quoteBandSeePricing")}
            </Link>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-700 dark:bg-slate-900 sm:p-7">
            <AnimatePresence mode="wait">
              {done ? (
                <motion.div
                  key="ok"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex min-h-[280px] flex-col items-center justify-center gap-3 px-2 text-center"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-2xl text-white shadow-lg">
                    ✓
                  </span>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{t("landing.quoteSuccess")}</p>
                  <Link to="/contact" className="text-sm font-semibold text-sky-600 underline-offset-2 hover:underline dark:text-sky-400">
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
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {t("landing.quoteFieldClinic")}
                      </label>
                      <input className={fieldClass} required value={clinic} onChange={(e) => setClinic(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {t("landing.quoteFieldName")}
                      </label>
                      <input className={fieldClass} required value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
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
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {t("landing.quoteFieldPhone")}
                      </label>
                      <input className={fieldClass} value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
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
                  <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {t("landing.quotePrivacy")}{" "}
                    <Link to="/privacy" className="font-semibold text-sky-600 underline-offset-2 hover:underline dark:text-sky-400">
                      {t("landing.footerPrivacy")}
                    </Link>
                  </p>
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full min-h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-600 text-sm font-bold text-white shadow-lg transition hover:opacity-95 disabled:opacity-60 sm:w-auto sm:px-8"
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
