import { motion } from "framer-motion";
import type { ComponentType, SVGProps } from "react";
import { useTranslation } from "react-i18next";

import { SectionEyebrow } from "./SectionEyebrow";
import {
  IconDeviceDesktop,
  IconDevicePhone,
  IconDeviceTablet,
  IconDevices,
} from "./icons/LandingIcons";

type IconComp = ComponentType<SVGProps<SVGSVGElement>>;

function PhoneView(): JSX.Element {
  const { t } = useTranslation();
  return (
    <div className="mx-auto w-full max-w-[190px] rounded-[34px] bg-slate-900 p-1.5 shadow-2xl ring-1 ring-slate-800">
      <div className="relative overflow-hidden rounded-[28px] bg-white">
        <div className="absolute left-1/2 top-1.5 z-10 h-4 w-14 -translate-x-1/2 rounded-full bg-slate-900" />
        <div className="aspect-[9/19] p-4 text-[9px]">
          <div className="mt-4">
            <p className="font-bold text-slate-400">Maria Santos</p>
            <p className="text-[10px] font-bold text-slate-900">{t("landingPreview.devices.phoneMyAppointments")}</p>
          </div>
          <div className="mt-4 space-y-2">
            <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 p-3 text-white">
              <p className="text-[8px] opacity-80">{t("landingPreview.devices.phoneNextEyebrow")}</p>
              <p className="text-sm font-bold">{t("landingPreview.devices.phoneNextLine")}</p>
              <p className="mt-1 text-[8px] opacity-90">Dr. dela Cruz</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-2.5">
              <p className="text-[8px] font-bold uppercase text-slate-400">{t("landingPreview.devices.phonePastLabel")}</p>
              <p className="mt-0.5 text-[10px] font-semibold text-slate-800">{t("landingPreview.devices.phonePastLine")}</p>
              <p className="text-[8px] text-slate-500">{t("landingPreview.devices.phonePastPaid")}</p>
            </div>
            <div className="flex gap-1.5">
              <button type="button" className="flex-1 rounded-lg bg-emerald-600 py-1.5 text-[8px] font-bold text-white">
                {t("landingPreview.devices.phoneBtnBook")}
              </button>
              <button type="button" className="flex-1 rounded-lg bg-slate-100 py-1.5 text-[8px] font-bold text-slate-700">
                {t("landingPreview.devices.phoneBtnInvoices")}
              </button>
            </div>
            <div className="rounded-lg bg-sky-50 p-2">
              <p className="text-[8px] font-semibold text-sky-700">{t("landingPreview.devices.phoneGcash")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabletView(): JSX.Element {
  const { t } = useTranslation();
  return (
    <div className="mx-auto w-full max-w-[320px] rounded-[22px] bg-slate-900 p-2 shadow-2xl ring-1 ring-slate-800">
      <div className="overflow-hidden rounded-[16px] bg-white">
        <div className="aspect-[4/3] p-3 text-[9px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <p className="font-bold text-slate-900">{t("landingPreview.devices.tabletHeader")}</p>
            <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[8px] font-bold text-emerald-700">
              {t("landingPreview.devices.tabletFdi")}
            </span>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="flex justify-center gap-0.5">
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-5 w-3 rounded-t border ${
                    i === 4
                      ? "border-rose-500 bg-rose-200"
                      : i === 13
                        ? "border-violet-500 bg-violet-200"
                        : "border-slate-300 bg-white"
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-center gap-0.5">
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-5 w-3 rounded-b border ${
                    i === 5 ? "border-sky-500 bg-sky-200" : "border-slate-300 bg-white"
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1">
            {[
              { l: t("landingPreview.devices.tabletLegendDecay"), c: "bg-rose-500" },
              { l: t("landingPreview.devices.tabletLegendFill"), c: "bg-sky-500" },
              { l: t("landingPreview.devices.tabletLegendRct"), c: "bg-violet-500" },
              { l: t("landingPreview.devices.tabletLegendHealthy"), c: "bg-slate-200" },
            ].map((k) => (
              <span key={k.l} className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-1.5 py-0.5 text-[7px] font-bold text-slate-600">
                <span className={`h-1 w-1 rounded-full ${k.c}`} /> {k.l}
              </span>
            ))}
          </div>
          <div className="mt-3 rounded-lg bg-gradient-to-br from-emerald-50 to-sky-50 p-2">
            <p className="text-[8px] font-bold uppercase text-emerald-700">{t("landingPreview.devices.tabletNoteEyebrow")}</p>
            <p className="text-[9px] font-semibold text-slate-800">{t("landingPreview.devices.tabletNoteLine")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DesktopView(): JSX.Element {
  const { t } = useTranslation();
  return (
    <div className="relative mx-auto max-w-sm">
      <div className="rounded-[14px] bg-slate-900 p-1.5 shadow-2xl ring-1 ring-slate-800">
        <div className="rounded-[8px] bg-slate-950 p-0.5">
          <div className="overflow-hidden rounded-md bg-white">
            <div className="aspect-[16/10] p-3 text-[8px]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <div className="flex items-center gap-1">
                  <div className="h-2.5 w-2.5 rounded bg-gradient-to-br from-emerald-500 to-sky-500" />
                  <p className="font-bold text-slate-900">DentEase Admin</p>
                </div>
                <div className="flex gap-1">
                  <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[6px] font-semibold uppercase tracking-wider text-slate-600 ring-1 ring-slate-200">{t("landing.mockBranch")}</span>
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[6px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200">
                    <span className="h-[3px] w-[3px] rounded-full bg-emerald-500" />
                    {t("landing.mockLive")}
                  </span>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-4 gap-1.5">
                {[
                  { l: t("landingPreview.devices.deskToday"), v: "₱ 43K", c: "text-emerald-600" },
                  { l: t("landingPreview.devices.deskAppts"), v: "8", c: "text-sky-600" },
                  { l: t("landingPreview.devices.deskHmo"), v: "3", c: "text-amber-600" },
                  { l: t("landingPreview.devices.deskStock"), v: "2", c: "text-rose-600" },
                ].map((s) => (
                  <div key={s.l} className="rounded bg-slate-50 p-1.5">
                    <p className={`text-sm font-extrabold ${s.c}`}>{s.v}</p>
                    <p className="text-[6px] font-semibold uppercase text-slate-500">{s.l}</p>
                  </div>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-[1fr_0.8fr] gap-1.5">
                <div className="rounded bg-slate-50 p-2">
                  <p className="text-[7px] font-bold uppercase text-slate-500">{t("landingPreview.devices.deskRevenue")}</p>
                  <div className="mt-1.5 flex h-8 items-end gap-0.5">
                    {[55, 70, 62, 80, 75, 90, 68].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-gradient-to-t from-emerald-400 to-sky-400"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-1 rounded bg-slate-50 p-2">
                  <p className="text-[7px] font-bold uppercase text-slate-500">{t("landingPreview.devices.deskDentists")}</p>
                  {["Reyes", "Cruz", "Liwanag"].map((n, i) => (
                    <div key={n} className="flex items-center justify-between">
                      <span className="text-[7px] font-semibold text-slate-700">{n}</span>
                      <span className="text-[7px] font-mono text-slate-500">{[92, 78, 64][i]}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-1 h-1.5 w-[85%] rounded-b-xl bg-slate-800 shadow-lg" />
    </div>
  );
}

const DEVICES: {
  key: string;
  labelKey: string;
  descKey: string;
  accent: string;
  view: JSX.Element;
  Icon: IconComp;
}[] = [
  {
    key: "phone",
    labelKey: "landing.deviceMobile",
    descKey: "landing.deviceMobileDesc",
    accent: "from-emerald-400 to-sky-500",
    view: <PhoneView />,
    Icon: IconDevicePhone,
  },
  {
    key: "tablet",
    labelKey: "landing.deviceTablet",
    descKey: "landing.deviceTabletDesc",
    accent: "from-violet-400 to-fuchsia-500",
    view: <TabletView />,
    Icon: IconDeviceTablet,
  },
  {
    key: "desktop",
    labelKey: "landing.deviceDesktop",
    descKey: "landing.deviceDesktopDesc",
    accent: "from-amber-400 to-rose-500",
    view: <DesktopView />,
    Icon: IconDeviceDesktop,
  },
];

export function DeviceShowcase(): JSX.Element {
  const { t } = useTranslation();

  return (
    <div>
      <div className="mx-auto max-w-2xl text-center">
        <SectionEyebrow label={t("landing.deviceEyebrow")} icon={IconDevices} accent="sky" align="center" />
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          {t("landing.deviceTitle")}
        </h2>
        <p className="mt-4 text-slate-600 dark:text-slate-400">{t("landing.deviceSubtitle")}</p>
      </div>

      <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-6">
        {DEVICES.map((d, i) => (
          <motion.div
            key={d.key}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="group relative"
          >
            <div
              className={`absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br ${d.accent} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20`}
            />
            <div className="relative">{d.view}</div>
            <div className="mt-6 flex flex-col items-center text-center">
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest`}>
                <span className={`inline-flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br ${d.accent} text-white shadow-sm`}>
                  <d.Icon className="h-3.5 w-3.5" />
                </span>
                <span className={`bg-gradient-to-br ${d.accent} bg-clip-text text-transparent`}>
                  {t(d.labelKey)}
                </span>
              </span>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{t(d.descKey)}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5 text-emerald-600">
            <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t("landing.deviceSync")}
        </span>
      </div>
    </div>
  );
}
