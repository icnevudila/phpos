import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

import { SectionEyebrow } from "./SectionEyebrow";
import { IconAlert, IconFolder, IconPhoneCall, IconSpreadsheet, IconSwap } from "./icons/LandingIcons";

function BeforeSide(): JSX.Element {
  const { t } = useTranslation();
  const excelHeaders = t("landingPreview.beforeAfter.excelHeaders", { returnObjects: true }) as string[];
  const excelRow1 = t("landingPreview.beforeAfter.excelRow1", { returnObjects: true }) as string[];
  const excelRow2 = t("landingPreview.beforeAfter.excelRow2", { returnObjects: true }) as string[];

  return (
    <div className="relative flex flex-col gap-3 overflow-hidden rounded-3xl border border-brand-border bg-brand-surface-soft p-6 shadow-inner">
      {/* fake "paper" card */}
      <div className="relative rotate-[-2deg] rounded-lg bg-brand-surface p-4 shadow-md ring-1 ring-brand-border">
        <p className="font-mono text-[10px] font-bold uppercase text-brand-muted">
          {t("landingPreview.beforeAfter.paperTitle")}
        </p>
        <div className="mt-2 space-y-1">
          <div className="h-2 w-4/5 rounded bg-brand-border" />
          <div className="h-2 w-3/5 rounded bg-brand-border" />
          <div className="h-2 w-2/3 rounded bg-brand-border" />
          <div className="h-2 w-1/2 rounded bg-rose-200" />
        </div>
        <p className="mt-3 font-mono text-[9px] italic text-rose-500">
          {t("landingPreview.beforeAfter.coffeeStain")}
        </p>
      </div>

      {/* excel-like card */}
      <div className="relative rotate-[1.2deg] overflow-hidden rounded-lg bg-brand-surface shadow-md ring-1 ring-brand-border">
        <div className="flex items-center gap-1 bg-teal-600 px-2 py-1 text-[9px] font-bold text-white">
          <IconSpreadsheet className="h-3 w-3" /> {t("landingPreview.beforeAfter.excelTitle")}
        </div>
        <div className="grid grid-cols-4 divide-x divide-slate-200 text-[9px]">
          {excelHeaders.map((h) => (
            <div key={h} className="bg-brand-surface-muted px-1.5 py-1 font-bold text-brand-text">
              {h}
            </div>
          ))}
          {excelRow1.map((c, i) => (
            <div key={i} className="px-1.5 py-1 text-brand-muted">
              {c}
            </div>
          ))}
          {excelRow2.map((c, i) => (
            <div key={i} className="bg-amber-50 px-1.5 py-1 text-amber-700">
              {c}
            </div>
          ))}
        </div>
      </div>

      {/* sticky note */}
      <div className="relative -mt-2 max-w-[80%] rotate-[3deg] self-end bg-amber-200 px-3 py-2 shadow-md">
        <p className="flex items-center gap-1 font-mono text-[10px] font-bold text-amber-900">
          <IconAlert className="h-3 w-3" /> {t("landingPreview.beforeAfter.stickyNote")}
        </p>
      </div>

      {/* chaos icons */}
      <div className="absolute right-4 bottom-3 flex gap-2 text-brand-muted opacity-60">
        <IconFolder className="h-6 w-6" />
        <IconPhoneCall className="h-6 w-6" />
      </div>

      <div className="relative mt-2 inline-flex items-center gap-1.5 self-start rounded-full border border-rose-200 bg-brand-surface py-1 pl-1 pr-3 text-[10px] font-bold uppercase tracking-[0.18em] text-rose-700 shadow-sm">
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-white ring-1 ring-rose-200">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-2.5 w-2.5">
            <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
          </svg>
        </span>
        {t("landing.beforeTag")}
      </div>
    </div>
  );
}

function AfterSide(): JSX.Element {
  const { t } = useTranslation();
  return (
    <div className="relative overflow-hidden rounded-3xl border border-teal-200 bg-gradient-to-br from-white to-teal-50/40 p-6 shadow-xl">
      <div className="relative inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-brand-surface py-1 pl-1 pr-3 text-[10px] font-bold uppercase tracking-[0.18em] text-teal-700 shadow-[0_2px_6px_-2px_rgba(16,185,129,0.3)]">
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-sky-500 text-white ring-1 ring-teal-200">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-2.5 w-2.5">
            <path d="m5 12 4 4 10-10" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        {t("landing.afterTag")}
      </div>

      {/* unified dashboard mock */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-brand-border bg-brand-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-brand-border px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-gradient-to-br from-teal-500 to-sky-500" />
            <p className="text-xs font-bold text-brand-text">DentEase</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-teal-700 ring-1 ring-teal-200">
            <span className="relative flex h-1 w-1">
              <span className="absolute inset-0 animate-ping rounded-full bg-teal-400/70" />
              <span className="relative h-1 w-1 rounded-full bg-teal-500" />
            </span>
            {t("landing.mockLiveSync")}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 p-3">
          {[
            { l: t("landingPreview.beforeAfter.tileCalendar"), v: "8" },
            { l: t("landingPreview.beforeAfter.tileHmo"), v: "3" },
            { l: t("landingPreview.beforeAfter.tileStock"), v: "✓" },
          ].map((s) => (
            <div key={s.l} className="rounded-lg bg-brand-surface-soft p-2">
              <p className="text-lg font-extrabold text-brand-text">{s.v}</p>
              <p className="text-[9px] font-semibold uppercase text-brand-muted">{s.l}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-brand-border p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-brand-text">{t("landingPreview.beforeAfter.row1Left")}</span>
            <span className="rounded-full bg-teal-500 px-2 py-0.5 text-[9px] font-bold text-white">
              {t("landingPreview.beforeAfter.row1Pill")}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="font-semibold text-brand-text">{t("landingPreview.beforeAfter.row2Left")}</span>
            <span className="rounded-full bg-sky-500 px-2 py-0.5 text-[9px] font-bold text-white">
              {t("landingPreview.beforeAfter.row2Pill")}
            </span>
          </div>
        </div>
      </div>

      {/* floating benefit pills */}
      <div className="mt-4 flex flex-wrap gap-2">
        {[
          t("landingPreview.beforeAfter.pill1"),
          t("landingPreview.beforeAfter.pill2"),
          t("landingPreview.beforeAfter.pill3"),
          t("landingPreview.beforeAfter.pill4"),
        ].map((x) => (
          <span
            key={x}
            className="inline-flex items-center gap-1 rounded-full bg-brand-surface px-2.5 py-1 text-[10px] font-bold text-brand-text shadow-sm ring-1 ring-teal-100"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-2.5 w-2.5 text-teal-600">
              <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {x}
          </span>
        ))}
      </div>
    </div>
  );
}

export function BeforeAfterSplit(): JSX.Element {
  const { t } = useTranslation();

  const rows = [
    { before: t("landing.ba1Before"), after: t("landing.ba1After") },
    { before: t("landing.ba2Before"), after: t("landing.ba2After") },
    { before: t("landing.ba3Before"), after: t("landing.ba3After") },
    { before: t("landing.ba4Before"), after: t("landing.ba4After") },
    { before: t("landing.ba5Before"), after: t("landing.ba5After") },
  ];

  return (
    <div>
      <div className="mx-auto max-w-2xl text-center">
        <SectionEyebrow label={t("landing.baEyebrow")} icon={IconSwap} accent="amber" align="center" />
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-brand-text sm:text-4xl">
          {t("landing.baTitle")}
        </h2>
        <p className="mt-4 text-brand-muted">{t("landing.baSubtitle")}</p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <BeforeSide />
        <AfterSide />
      </div>

      <div className="mt-10 overflow-hidden rounded-3xl border border-brand-border bg-brand-surface shadow-sm">
        <div className="grid grid-cols-[1fr_auto_1fr] divide-x divide-slate-100 text-sm">
          <div className="bg-rose-50/40 px-5 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-rose-700">
            {t("landing.beforeTag")}
          </div>
          <div className="bg-brand-surface-muted px-3 py-3 text-center">→</div>
          <div className="bg-teal-50/40 px-5 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-teal-700">
            {t("landing.afterTag")}
          </div>
          {rows.map((r, i) => (
            <div key={i} className="contents">
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: i * 0.06 }}
                className="px-5 py-3 text-brand-muted line-through"
              >
                {r.before}
              </motion.div>
              <div className="flex items-center justify-center bg-brand-surface-soft px-3 text-brand-muted">
                →
              </div>
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: i * 0.06 }}
                className="px-5 py-3 font-semibold text-brand-text"
              >
                {r.after}
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
