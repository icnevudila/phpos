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
    <div className="mx-auto w-full max-w-[190px] rounded-[34px] bg-brand-surface p-1.5 shadow-popover ring-1 ring-brand-border-strong">
      <div className="relative overflow-hidden rounded-[28px] bg-brand-surface">
        <div className="absolute left-1/2 top-1.5 z-10 h-4 w-14 -translate-x-1/2 rounded-full bg-brand-surface-soft" />
        <div className="aspect-[9/19] p-4 text-[9px]">
          <div className="mt-4">
            <p className="font-bold text-brand-muted">Maria Santos</p>
            <p className="text-[10px] font-bold text-brand-text">{t("landingPreview.devices.phoneMyAppointments")}</p>
          </div>
          <div className="mt-4 space-y-2">
            <div className="rounded-xl bg-brand-primary p-3 text-white">
              <p className="text-[8px] opacity-80">{t("landingPreview.devices.phoneNextEyebrow")}</p>
              <p className="text-sm font-bold">{t("landingPreview.devices.phoneNextLine")}</p>
              <p className="mt-1 text-[8px] opacity-90">Dr. dela Cruz</p>
            </div>
            <div className="rounded-xl border border-brand-border p-2.5">
              <p className="text-[8px] font-bold uppercase text-brand-muted">{t("landingPreview.devices.phonePastLabel")}</p>
              <p className="mt-0.5 text-[10px] font-semibold text-brand-text">{t("landingPreview.devices.phonePastLine")}</p>
              <p className="text-[8px] text-brand-muted">{t("landingPreview.devices.phonePastPaid")}</p>
            </div>
            <div className="flex gap-1.5">
              <button type="button" className="flex-1 rounded-lg bg-brand-primary py-1.5 text-[8px] font-bold text-white">
                {t("landingPreview.devices.phoneBtnBook")}
              </button>
              <button type="button" className="flex-1 rounded-lg bg-brand-surface-soft py-1.5 text-[8px] font-bold text-brand-text">
                {t("landingPreview.devices.phoneBtnInvoices")}
              </button>
            </div>
            <div className="rounded-lg bg-brand-primary-soft p-2">
              <p className="text-[8px] font-semibold text-brand-primary">{t("landingPreview.devices.phoneGcash")}</p>
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
    <div className="mx-auto w-full max-w-[320px] rounded-[22px] bg-brand-surface p-2 shadow-popover ring-1 ring-brand-border-strong">
      <div className="overflow-hidden rounded-[16px] bg-brand-surface">
        <div className="aspect-[4/3] p-3 text-[9px]">
          <div className="flex items-center justify-between border-b border-brand-border pb-2">
            <p className="font-bold text-brand-text">{t("landingPreview.devices.tabletHeader")}</p>
            <span className="rounded-full bg-brand-primary-soft px-1.5 py-0.5 text-[8px] font-bold text-brand-primary">
              {t("landingPreview.devices.tabletFdi")}
            </span>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="flex justify-center gap-0.5">
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-5 w-3 rounded-t border ${ i === 4 ? "border-brand-danger bg-brand-danger-soft" : i === 13 ? "border-brand-primary bg-brand-primary-soft" : "border-brand-border bg-brand-surface" }`}
                />
              ))}
            </div>
            <div className="flex justify-center gap-0.5">
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-5 w-3 rounded-b border ${ i === 5 ? "border-sky-500 bg-sky-200" : "border-brand-border bg-brand-surface" }`}
                />
              ))}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1">
            {[
              { l: t("landingPreview.devices.tabletLegendDecay"), c: "bg-brand-danger" },
              { l: t("landingPreview.devices.tabletLegendFill"), c: "bg-sky-500" },
              { l: t("landingPreview.devices.tabletLegendRct"), c: "bg-brand-primary" },
              { l: t("landingPreview.devices.tabletLegendHealthy"), c: "bg-brand-surface-muted" },
            ].map((k) => (
              <span key={k.l} className="inline-flex items-center gap-1 rounded-full bg-brand-surface-soft px-1.5 py-0.5 text-[7px] font-bold text-brand-text">
                <span className={`h-1 w-1 rounded-full ${k.c}`} /> {k.l}
              </span>
            ))}
          </div>
          <div className="mt-3 rounded-lg bg-brand-primary-soft p-2">
            <p className="text-[8px] font-bold uppercase text-brand-primary">{t("landingPreview.devices.tabletNoteEyebrow")}</p>
            <p className="text-[9px] font-semibold text-brand-text">{t("landingPreview.devices.tabletNoteLine")}</p>
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
      <div className="rounded-[14px] bg-brand-surface p-1.5 shadow-popover ring-1 ring-brand-border-strong">
        <div className="rounded-[8px] bg-brand-surface-soft p-0.5">
          <div className="overflow-hidden rounded-md bg-brand-surface">
            <div className="aspect-[16/10] p-3 text-[8px]">
              <div className="flex items-center justify-between border-b border-brand-border pb-1.5">
                <div className="flex items-center gap-1">
                  <div className="h-2.5 w-2.5 rounded bg-brand-primary" />
                  <p className="font-bold text-brand-text">DentEase Admin</p>
                </div>
                <div className="flex gap-1">
                  <span className="rounded-full bg-brand-surface-soft px-1.5 py-0.5 text-[6px] font-semibold uppercase tracking-wider text-brand-muted ring-1 ring-brand-border">{t("landing.mockBranch")}</span>
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-brand-primary-soft px-1.5 py-0.5 text-[6px] font-bold uppercase tracking-wider text-brand-primary ring-1 ring-brand-primary/20">
                    <span className="h-[3px] w-[3px] rounded-full bg-brand-primary" />
                    {t("landing.mockLive")}
                  </span>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-4 gap-1.5">
                {[
                  { l: t("landingPreview.devices.deskToday"), v: "₱ 43K", c: "text-brand-primary" },
                  { l: t("landingPreview.devices.deskAppts"), v: "8", c: "text-sky-600" },
                  { l: t("landingPreview.devices.deskHmo"), v: "3", c: "text-amber-600" },
                  { l: t("landingPreview.devices.deskStock"), v: "2", c: "text-brand-danger" },
                ].map((s) => (
                  <div key={s.l} className="rounded bg-brand-surface-soft p-1.5">
                    <p className={`text-sm font-extrabold ${s.c}`}>{s.v}</p>
                    <p className="text-[6px] font-semibold uppercase text-brand-muted">{s.l}</p>
                  </div>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-[1fr_0.8fr] gap-1.5">
                <div className="rounded bg-brand-surface-soft p-2">
                  <p className="text-[7px] font-bold uppercase text-brand-muted">{t("landingPreview.devices.deskRevenue")}</p>
                  <div className="mt-1.5 flex h-8 items-end gap-0.5">
                    {[55, 70, 62, 80, 75, 90, 68].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-brand-primary"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-1 rounded bg-brand-surface-soft p-2">
                  <p className="text-[7px] font-bold uppercase text-brand-muted">{t("landingPreview.devices.deskDentists")}</p>
                  {["Reyes", "Cruz", "Liwanag"].map((n, i) => (
                    <div key={n} className="flex items-center justify-between">
                      <span className="text-[7px] font-semibold text-brand-text">{n}</span>
                      <span className="text-[7px] font-mono text-brand-muted">{[92, 78, 64][i]}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-1 h-1.5 w-[85%] rounded-b-xl bg-brand-surface-muted shadow-lg" />
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
    accent: "from-teal-400 to-sky-500",
    view: <PhoneView />,
    Icon: IconDevicePhone,
  },
  {
    key: "tablet",
    labelKey: "landing.deviceTablet",
    descKey: "landing.deviceTabletDesc",
    accent: "from-teal-400 to-fuchsia-500",
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
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-brand-text sm:text-4xl">
          {t("landing.deviceTitle")}
        </h2>
        <p className="mt-4 text-brand-muted">{t("landing.deviceSubtitle")}</p>
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
              <p className="mt-2 text-sm leading-relaxed text-brand-muted">{t(d.descKey)}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-center gap-3 text-xs font-semibold text-brand-muted">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-border bg-brand-surface px-3 py-1 shadow-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5 text-brand-primary">
            <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t("landing.deviceSync")}
        </span>
      </div>
    </div>
  );
}
