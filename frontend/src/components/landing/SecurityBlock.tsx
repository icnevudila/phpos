import { motion } from "framer-motion";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { SectionEyebrow } from "./SectionEyebrow";
import { IconShield } from "./icons/LandingIcons";

function I({ d }: { d: string }): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d={d} />
    </svg>
  );
}

export function SecurityBlock(): JSX.Element {
  const { t } = useTranslation();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const items = [
    {
      icon: <I d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />,
      title: t("landing.sec1Title"),
      desc: t("landing.sec1Desc"),
      long: "Strict adherence to RA 10173. We implement end-to-end data minimization, ensuring only necessary clinical data is collected and processed with explicit patient consent.",
      accent: "from-teal-400 to-teal-500",
    },
    {
      icon: <I d="M16 11V7a4 4 0 1 0-8 0v4m-3 0h14v10H5zM12 15v3" />,
      title: t("landing.sec2Title"),
      desc: t("landing.sec2Desc"),
      long: "Granular permission sets for owners, dentists, and staff. No one sees more than they need to. Full multi-tenant isolation ensures your data never mixes with others.",
      accent: "from-sky-400 to-indigo-500",
    },
    {
      icon: <I d="M3 3h18v4H3zm0 7h18v4H3zm0 7h18v4H3zM7 5h.01M7 12h.01M7 19h.01" />,
      title: t("landing.sec3Title"),
      desc: t("landing.sec3Desc"),
      long: "Every clinical update, billing change, and login is logged with a permanent timestamp. We provide a transparent trail for compliance and clinical safety audits.",
      accent: "from-teal-400 to-fuchsia-500",
    },
    {
      icon: <I d="M12 2a10 10 0 1 0 10 10h-10V2zM12 2v10l8.66 5" />,
      title: t("landing.sec4Title"),
      desc: t("landing.sec4Desc"),
      long: "All data in transit is encrypted using industry-standard TLS 1.3. Your patient records and images are safe from interception, whether in the clinic or on the move.",
      accent: "from-amber-400 to-orange-500",
    },
    {
      icon: <I d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5 5-5 5 5m-5-5v12" />,
      title: t("landing.sec5Title"),
      desc: t("landing.sec5Desc"),
      long: "Automated daily snapshots with 99.9% durability. In case of hardware failure or accidental deletion, we can restore your entire clinic state in minutes.",
      accent: "from-rose-400 to-pink-500",
    },
    {
      icon: <I d="M12 8v4l3 3M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z" />,
      title: t("landing.sec6Title"),
      desc: t("landing.sec6Desc"),
      long: "Automatic session timeouts and hardware-bound authentication. If a device is lost or left unattended, the system protects itself from unauthorized access.",
      accent: "from-indigo-400 to-sky-500",
    },
  ];

  return (
    <div>
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <SectionEyebrow label={t("landing.secEyebrow")} icon={IconShield} accent="emerald" />
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            {t("landing.secTitle")}
          </h2>
          <p className="mt-4 text-lg font-medium text-slate-600">{t("landing.secSubtitle")}</p>
          <div className="mt-8 rounded-[2.5rem] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">
              {t("landing.secPromiseLabel")}
            </p>
            <p className="mt-4 text-base leading-relaxed text-slate-700">
              {t("landing.secPromise")}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((it, i) => {
            const isExpanded = expandedIndex === i;
            return (
              <motion.div
                key={it.title}
                layout
                onClick={() => setExpandedIndex(isExpanded ? null : i)}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className={`group relative cursor-pointer overflow-hidden rounded-3xl border transition-all duration-500 p-6 ${ isExpanded ? "border-teal-500 bg-teal-50/10 shadow-xl ring-1 ring-teal-500 " : "border-slate-200 bg-white shadow-sm hover:-translate-y-1 hover:shadow-lg " }`}
              >
                <div
                  className={`relative inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${it.accent} text-white shadow-lg transition-transform duration-500 group-hover:scale-110`}
                >
                  {it.icon}
                </div>
                <h3 className="mt-5 text-lg font-black text-slate-900 leading-tight">{it.title}</h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">{it.desc}</p>
                
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-6 border-t border-teal-500/20 pt-4"
                  >
                    <p className="text-sm font-medium leading-relaxed text-slate-700">
                      {it.long}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-teal-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
                      Active compliance
                    </div>
                  </motion.div>
                )}
                
                <div className="absolute bottom-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="text-[10px] font-bold text-slate-400">{isExpanded ? "Click to close" : "Click to learn more"}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
