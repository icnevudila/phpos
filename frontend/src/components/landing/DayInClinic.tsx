import { motion, useReducedMotion } from "framer-motion";
import type { TFunction } from "i18next";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { SectionEyebrow } from "./SectionEyebrow";
import { IconAlert, IconClock } from "./icons/LandingIcons";

interface Scene {
  time: string;
  title: string;
  desc: string;
  accent: string;
  mock: JSX.Element;
}

function MockFrame({ children, label }: { children: React.ReactNode; label: string }): JSX.Element {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-teal-300" />
        </div>
        <span className="font-mono text-[10px] text-slate-400">{label}</span>
        <span className="text-[10px] font-semibold text-slate-300">DentEase</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Mock_Opening({ t }: { t: TFunction }): JSX.Element {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400">{t("landing.dayMockDate")}</p>
          <p className="text-lg font-bold text-slate-900">{t("landing.dayMockGreet")}</p>
        </div>
        <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-[10px] font-bold text-teal-700">
          {t("landing.dayMockAppts")}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { l: t("landing.dayMockStatAppt"), v: "8", c: "text-teal-600" },
          { l: t("landing.dayMockStatNew"), v: "2", c: "text-sky-600" },
          { l: t("landing.dayMockStatHmo"), v: "3", c: "text-amber-600" },
        ].map((s) => (
          <div key={s.l} className="rounded-xl bg-slate-50 p-3">
            <p className={`text-xl font-extrabold ${s.c}`}>{s.v}</p>
            <p className="text-[10px] font-semibold uppercase text-slate-500">{s.l}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-gradient-to-br from-teal-50 to-sky-50 p-3">
        <p className="text-[10px] font-bold uppercase text-teal-700">
          {t("landing.dayMockFirstLabel")}
        </p>
        <p className="mt-0.5 text-sm font-bold text-slate-900">{t("landing.dayMockFirstDetail")}</p>
      </div>
    </div>
  );
}

function Mock_Patient({ t }: { t: TFunction }): JSX.Element {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 text-sm font-bold text-white">
          MS
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-900">Maria Santos</p>
          <p className="text-[10px] text-slate-500">{t("landing.dayMockPatientMeta")}</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-bold text-rose-700 ring-1 ring-rose-200">
          <IconAlert className="h-2.5 w-2.5" />
          {t("landing.dayMockAllergy")}
        </span>
      </div>
      <div className="rounded-xl bg-slate-50 p-3">
        <p className="text-[10px] font-bold uppercase text-slate-500">{t("landing.dayMockLastVisit")}</p>
        <p className="mt-0.5 text-sm font-semibold text-slate-900">{t("landing.dayMockLastVisitDetail")}</p>
        <p className="text-[10px] text-slate-500">{t("landing.dayMockClinician")}</p>
      </div>
      <div className="rounded-xl bg-slate-50 p-3">
        <p className="text-[10px] font-bold uppercase text-slate-500">{t("landing.dayMockMedNotes")}</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-slate-700">
          {t("landing.dayMockMedNotesText")}
        </p>
      </div>
    </div>
  );
}

function Mock_Odontogram({ t }: { t: TFunction }): JSX.Element {
  const highlight = new Set([14, 15, 26]);
  return (
    <div>
      <p className="text-[10px] font-bold uppercase text-slate-500">{t("landing.dayMockToothChart")}</p>
      <div className="mt-3 space-y-2">
        <div className="flex justify-center gap-0.5">
          {[18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28].map((n) => (
            <div
              key={n}
              className={`flex h-6 w-3.5 items-end justify-center rounded-t-md border text-[7px] ${ highlight.has(n) ? n === 15 ? "border-rose-500 bg-rose-200" : n === 26 ? "border-teal-500 bg-teal-200" : "border-sky-500 bg-sky-200" : "border-slate-300 bg-white " }`}
            >
              <span className="text-slate-400">{n}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-0.5">
          {[48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38].map((n) => (
            <div
              key={n}
              className="flex h-6 w-3.5 items-end justify-center rounded-b-md border border-slate-300 bg-white text-[7px]"
            >
              <span className="text-slate-400">{n}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-[9px] font-semibold">
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-rose-700">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> 15 · {t("landing.dayMockCaries")}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-sky-700">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-500" /> 14 · {t("landing.dayMockFilling")}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2 py-0.5 text-teal-700">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-500" /> 26 · {t("landing.dayMockRootCanal")}
        </span>
      </div>
    </div>
  );
}

function Mock_HMO({ t }: { t: TFunction }): JSX.Element {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase text-slate-500">{t("landing.dayMockHmoClaim")}</p>
          <p className="text-sm font-bold text-slate-900">CLM-2026-0414-003</p>
        </div>
        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-amber-200">
          Maxicare
        </span>
      </div>
      <div className="rounded-xl border border-slate-200 p-3 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-500">{t("landing.dayMockProcedure")}</span>
          <span className="font-mono text-slate-800">₱ 10.500</span>
        </div>
        <div className="mt-1 flex justify-between text-teal-700">
          <span>{t("landing.dayMockCoverage")}</span>
          <span className="font-mono">− ₱ 6.000</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 text-sm font-bold text-slate-900">
          <span>{t("landing.dayMockPatientPay")}</span>
          <span className="font-mono">₱ 4.500</span>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-xl bg-teal-50 p-2.5 ring-1 ring-teal-200">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4 text-teal-600">
          <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-[11px] font-semibold text-teal-800">{t("landing.dayMockClaimSent")}</span>
      </div>
    </div>
  );
}

function Mock_Stock({ t }: { t: TFunction }): JSX.Element {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase text-slate-500">{t("landing.dayMockInvAlert")}</p>
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500 px-2 py-0.5 text-[9px] font-bold text-white">
          <IconAlert className="h-2.5 w-2.5" />
          {t("landing.dayMockCritStock")}
        </span>
      </div>
      {[
        { n: t("landing.dayMockItem1"), lvl: 8, min: 20, s: "critical" as const },
        { n: t("landing.dayMockItem2"), lvl: 18, min: 15, s: "low" as const },
        { n: t("landing.dayMockItem3"), lvl: 72, min: 20, s: "ok" as const },
      ].map((r) => {
        const colors = {
          ok: "bg-teal-500",
          low: "bg-amber-500",
          critical: "bg-rose-500",
        };
        return (
          <div key={r.n} className="rounded-lg bg-slate-50 p-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="truncate font-semibold text-slate-800">{r.n}</span>
              <span className="font-mono text-[10px] text-slate-500">
                {r.lvl} / {t("landing.dayMockMin")} {r.min}
              </span>
            </div>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full ${colors[r.s]}`}
                style={{ width: `${Math.min(100, (r.lvl / (r.min * 3)) * 100)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Mock_EOD({ t }: { t: TFunction }): JSX.Element {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[10px] font-bold uppercase text-slate-500">{t("landing.dayMockEod")}</p>
        <p className="text-2xl font-extrabold text-slate-900">
          ₱ <span>43.250</span>
        </p>
        <p className="text-[10px] font-semibold text-teal-600">{t("landing.dayMockWeekly")}</p>
      </div>
      <div className="grid grid-cols-2 gap-2 text-center">
        {[
          { l: t("landing.dayMockCompleted"), v: "8/8" },
          { l: t("landing.dayMockNoShow"), v: "0" },
          { l: t("landing.dayMockStatNew"), v: "2" },
          { l: t("landing.dayMockHmoClaims"), v: "3" },
        ].map((s) => (
          <div key={s.l} className="rounded-lg bg-slate-50 p-2">
            <p className="text-sm font-bold text-slate-900">{s.v}</p>
            <p className="text-[9px] font-semibold uppercase text-slate-500">{s.l}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-gradient-to-br from-teal-500 to-sky-500 p-3 text-white">
        <p className="text-[10px] font-bold uppercase opacity-80">{t("landing.dayMockTomorrow")}</p>
        <p className="text-sm font-bold">{t("landing.dayMockTomorrowDetail")}</p>
      </div>
    </div>
  );
}

export function DayInClinic(): JSX.Element {
  const { t } = useTranslation();
  const reduce = useReducedMotion();

  const scenes: Scene[] = [
    {
      time: "09:00",
      title: t("landing.day1Title"),
      desc: t("landing.day1Desc"),
      accent: "from-teal-500 to-sky-500",
      mock: <Mock_Opening t={t} />,
    },
    {
      time: "09:15",
      title: t("landing.day2Title"),
      desc: t("landing.day2Desc"),
      accent: "from-sky-500 to-indigo-500",
      mock: <Mock_Patient t={t} />,
    },
    {
      time: "10:30",
      title: t("landing.day3Title"),
      desc: t("landing.day3Desc"),
      accent: "from-teal-500 to-fuchsia-500",
      mock: <Mock_Odontogram t={t} />,
    },
    {
      time: "12:00",
      title: t("landing.day4Title"),
      desc: t("landing.day4Desc"),
      accent: "from-amber-500 to-rose-500",
      mock: <Mock_HMO t={t} />,
    },
    {
      time: "14:00",
      title: t("landing.day5Title"),
      desc: t("landing.day5Desc"),
      accent: "from-rose-500 to-orange-500",
      mock: <Mock_Stock t={t} />,
    },
    {
      time: "17:00",
      title: t("landing.day6Title"),
      desc: t("landing.day6Desc"),
      accent: "from-teal-500 to-teal-500",
      mock: <Mock_EOD t={t} />,
    },
  ];

  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = Number(e.target.getAttribute("data-scene") ?? "0");
            setActive(idx);
          }
        });
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 },
    );
    refs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div>
      <div className="mx-auto max-w-2xl text-center">
        <SectionEyebrow label={t("landing.dayEyebrow")} icon={IconClock} accent="emerald" align="center" />
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {t("landing.dayTitle")}
        </h2>
        <p className="mt-4 text-slate-600">{t("landing.daySubtitle")}</p>
      </div>

      <div className="mx-auto mt-12 max-w-6xl space-y-4 lg:space-y-16">
        {scenes.map((s, i) => (
          <div
            key={i}
            ref={(el) => (refs.current[i] = el)}
            data-scene={i}
            className={`relative grid gap-6 rounded-2xl border p-5 transition lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:items-start lg:gap-10 lg:p-6 ${ i === active ? "border-transparent bg-white shadow-lg " : "border-slate-200 bg-white/60 " }`}
          >
            {i === active && !reduce && (
              <motion.span
                layoutId="dayGlow"
                className={`absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br ${s.accent} opacity-10`}
              />
            )}
            <div className="min-w-0">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold shadow-md ${
                    i === active
                      ? `bg-gradient-to-br text-white ${s.accent}`
                      : "bg-slate-100 text-slate-500  "
                  }`}
                >
                  {s.time}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-slate-900 sm:text-lg">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{s.desc}</p>
                </div>
              </div>
              <div className="mt-4 lg:hidden">{s.mock}</div>
            </div>

            {/* Desktop: mock always beside this step’s copy (no viewport-sticky column) */}
            <div
              className={`hidden min-w-0 lg:block ${i === active ? "opacity-100" : "opacity-[0.72] transition-opacity duration-500"}`}
            >
              <div className="relative">
                {i === active ? (
                  <div
                    className={`pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-br ${s.accent} opacity-20 blur-2xl transition-all duration-700`}
                  />
                ) : null}
                <div className="relative">
                  <MockFrame label={s.time}>{s.mock}</MockFrame>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
