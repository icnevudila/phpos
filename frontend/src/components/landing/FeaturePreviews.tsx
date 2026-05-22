/**
 * Static, non-interactive visual previews for each feature.
 * These are intentionally read-only — just a screenshot-style mockup
 * of what the actual in-app page looks like.
 */

import { useTranslation } from "react-i18next";

import { IconAlert } from "./icons/LandingIcons";

function Field({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}): JSX.Element {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`mt-0.5 text-sm text-slate-800 ${mono ? "font-mono" : "font-medium"}`}>{value}</p>
    </div>
  );
}

/* ---------------- Appointments ---------------- */

const HOURS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00"];

const APPOINTMENT_LAYOUT = [
  { day: 0, start: 0, span: 1, color: "bg-teal-100 text-teal-800 border-teal-200" },
  { day: 0, start: 2, span: 2, color: "bg-teal-100 text-teal-800 border-teal-200" },
  { day: 1, start: 1, span: 1, color: "bg-sky-100 text-sky-800 border-sky-200" },
  { day: 1, start: 3, span: 1, color: "bg-amber-100 text-amber-800 border-amber-200" },
  { day: 2, start: 0, span: 2, color: "bg-rose-100 text-rose-800 border-rose-200" },
  { day: 3, start: 2, span: 1, color: "bg-teal-100 text-teal-800 border-teal-200" },
  { day: 3, start: 4, span: 1, color: "bg-sky-100 text-sky-800 border-sky-200" },
  { day: 4, start: 1, span: 2, color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
];

export function AppointmentsPreview(): JSX.Element {
  const { t } = useTranslation();
  const dayLabels = t("landingPreview.appointments.dayLabels", { returnObjects: true }) as string[];
  const events = t("landingPreview.appointments.events", { returnObjects: true }) as { name: string; type: string }[];
  const appointments = APPOINTMENT_LAYOUT.map((layout, i) => ({
    ...layout,
    name: events[i]?.name ?? "",
    type: events[i]?.type ?? "",
  }));

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {t("landingPreview.appointments.calendarLabel")}
          </p>
          <p className="text-sm font-bold text-slate-900">{t("landingPreview.appointments.headerSub")}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700 ring-1 ring-teal-200">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500" /> {t("landingPreview.appointments.badge")}
          </span>
          <div className="flex gap-1">
            <div className="h-7 w-7 rounded-lg bg-slate-100" />
            <div className="h-7 w-7 rounded-lg bg-slate-100" />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="grid min-w-[560px] grid-cols-[60px_repeat(5,1fr)] gap-px bg-slate-100">
        <div className="bg-white" />
        {dayLabels.map((d, i) => (
          <div key={i} className="bg-white px-2 py-2 text-center">
            <p className="text-[10px] font-semibold uppercase text-slate-400">{d}</p>
            <p className="text-sm font-bold text-slate-800">{13 + i}</p>
          </div>
        ))}

        {HOURS.map((h, rowIdx) => (
          <div key={h} className="contents">
            <div className="bg-white px-2 py-2 text-right text-[10px] font-semibold text-slate-400">
              {h}
            </div>
            {Array.from({ length: 5 }).map((_, colIdx) => {
              const apt = appointments.find((a) => a.day === colIdx && a.start === rowIdx);
              if (apt) {
                return (
                  <div
                    key={colIdx}
                    className="relative bg-white p-1"
                    style={{ gridRow: `span ${apt.span}` }}
                  >
                    <div
                      className={`h-full rounded-lg border p-2 text-left text-[11px] ${apt.color}`}
                    >
                      <p className="font-bold leading-tight">{apt.name}</p>
                      <p className="mt-0.5 opacity-80">{apt.type}</p>
                    </div>
                  </div>
                );
              }
              const covered = appointments.some(
                (a) => a.day === colIdx && a.start < rowIdx && a.start + a.span > rowIdx,
              );
              if (covered) return null;
              return <div key={colIdx} className="bg-white" />;
            })}
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Odontogram ---------------- */

type ToothStatus = "healthy" | "decay" | "filled" | "rct" | "crown";

const TOOTH_STATES: Record<number, ToothStatus> = {
  14: "filled",
  15: "decay",
  18: "crown",
  26: "rct",
  27: "filled",
  36: "decay",
  46: "filled",
};

const STATUS_VISUAL: Record<ToothStatus, { fill: string; dot: string }> = {
  healthy: { fill: "fill-white stroke-slate-300", dot: "bg-slate-200" },
  decay: { fill: "fill-rose-200 stroke-rose-500", dot: "bg-rose-400" },
  filled: { fill: "fill-sky-200 stroke-sky-500", dot: "bg-sky-400" },
  rct: { fill: "fill-teal-200 stroke-teal-500", dot: "bg-teal-400" },
  crown: { fill: "fill-amber-200 stroke-amber-500", dot: "bg-amber-400" },
};

const FDI_UPPER = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const FDI_LOWER = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

function Tooth({ n, label }: { n: number; label: string }): JSX.Element {
  const status = TOOTH_STATES[n] ?? "healthy";
  const style = STATUS_VISUAL[status];
  return (
    <div className="flex flex-col items-center gap-0.5">
      <svg viewBox="0 0 24 28" className={`h-7 w-5 ${style.fill}`} strokeWidth={1.2}>
        <path d="M12 2c-4 0-7 2.5-7 6 0 2 .5 3.5 1 5 .5 1.5 1 3 1 5.5 0 3 1 6 2.5 7.5 1 1 2 1 2.5 0 .4-.8 1.5-.8 2 0 .5 1 1.5 1 2.5 0C17 24.5 18 21.5 18 18.5c0-2.5.5-4 1-5.5s1-3 1-5c0-3.5-3-6-8-6Z" />
      </svg>
      <span className="text-[8px] font-semibold text-slate-400">{n}</span>
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function OdontogramPreview(): JSX.Element {
  const { t } = useTranslation();
  const statusKeys = Object.keys(STATUS_VISUAL) as ToothStatus[];
  const statusLabel = (k: ToothStatus) => t(`landingPreview.odontogram.status.${k}`);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {t("landingPreview.odontogram.chartTitle")}
          </p>
          <p className="text-sm font-bold text-slate-900">{t("landingPreview.odontogram.subtitle")}</p>
        </div>
        <div className="hidden flex-wrap items-center gap-3 sm:flex">
          {statusKeys.map((k) => (
            <span key={k} className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-600">
              <span className={`h-2 w-2 rounded-full ${STATUS_VISUAL[k].dot}`} />
              {statusLabel(k)}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex justify-center gap-1">
          {FDI_UPPER.map((n) => (
            <Tooth key={n} n={n} label={statusLabel(TOOTH_STATES[n] ?? "healthy")} />
          ))}
        </div>
        <div className="border-t border-dashed border-slate-200" />
        <div className="flex justify-center gap-1">
          {FDI_LOWER.map((n) => (
            <Tooth key={n} n={n} label={statusLabel(TOOTH_STATES[n] ?? "healthy")} />
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-2 rounded-xl bg-slate-50 p-3 text-xs sm:grid-cols-3">
        <Field label={t("landingPreview.odontogram.fieldLastUpdate")} value={t("landingPreview.odontogram.fieldLastUpdateValue")} />
        <Field label={t("landingPreview.odontogram.fieldDoctor")} value={t("landingPreview.odontogram.fieldDoctorValue")} />
        <Field label={t("landingPreview.odontogram.fieldCompleted")} value={t("landingPreview.odontogram.fieldCompletedValue")} />
      </div>
    </div>
  );
}

/* ---------------- Patient Record ---------------- */

export function PatientRecordPreview(): JSX.Element {
  const { t } = useTranslation();
  const tabs = t("landingPreview.patient.tabs", { returnObjects: true }) as string[];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-4 border-b border-slate-100 bg-gradient-to-br from-indigo-50 to-sky-50 px-5 py-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 text-lg font-bold text-white shadow-md">
          MS
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-slate-900">Maria Santos</p>
          <p className="text-xs text-slate-600">{t("landingPreview.patient.metaLine")}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700 ring-1 ring-slate-200">
              {t("landingPreview.patient.philhealthBadge")}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 ring-1 ring-rose-200">
              <IconAlert className="h-2.5 w-2.5" /> {t("landingPreview.patient.allergyBadge")}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-1 border-b border-slate-100 px-4 pt-3">
        {tabs.map((tab, i) => (
          <div
            key={tab}
            className={`rounded-t-lg px-3 py-2 text-xs font-semibold ${ i === 0 ? "border-b-2 border-indigo-500 text-indigo-700" : "text-slate-500" }`}
          >
            {tab}
          </div>
        ))}
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{t("landingPreview.patient.visitLabel")}</p>
          <p className="mt-1 text-sm font-bold text-slate-900">{t("landingPreview.patient.visitLine")}</p>
          <p className="mt-1 text-xs text-slate-600">{t("landingPreview.patient.visitDr")}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{t("landingPreview.patient.nextLabel")}</p>
          <p className="mt-1 text-sm font-bold text-slate-900">{t("landingPreview.patient.nextLine")}</p>
          <p className="mt-1 text-xs text-slate-600">{t("landingPreview.patient.nextTime")}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4 sm:col-span-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{t("landingPreview.patient.notesLabel")}</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-700">{t("landingPreview.patient.notesBody")}</p>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Billing ---------------- */

const BILLING_QTY = [1, 1, 1, 1] as const;
const BILLING_PRICES = [8000, 2500, 1500, 500] as const;

export function BillingPreview(): JSX.Element {
  const { t } = useTranslation();
  const itemRows = t("landingPreview.billing.items", { returnObjects: true }) as { name: string }[];
  const items = itemRows.map((row, i) => ({
    name: row.name,
    qty: BILLING_QTY[i] ?? 1,
    price: BILLING_PRICES[i] ?? 0,
  }));
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const hmo = 6000;
  const net = subtotal - hmo;
  const payMethods = t("landingPreview.billing.payMethods", { returnObjects: true }) as string[];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t("landingPreview.billing.title")}</p>
          <p className="text-sm font-bold text-slate-900">{t("landingPreview.billing.invLine")}</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-amber-200">
          {t("landingPreview.billing.hmoPill")}
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {items.map((it) => (
          <div key={it.name} className="flex items-center justify-between px-5 py-3 text-sm">
            <div>
              <p className="font-semibold text-slate-800">{it.name}</p>
              <p className="text-xs text-slate-500">{t("landingPreview.billing.qty", { n: it.qty })}</p>
            </div>
            <p className="font-mono text-slate-900">₱ {it.price.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="space-y-1 border-t border-slate-100 bg-slate-50 px-5 py-4 text-sm">
        <div className="flex items-center justify-between text-slate-600">
          <span>{t("landingPreview.billing.subtotal")}</span>
          <span className="font-mono">₱ {subtotal.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between text-teal-700">
          <span>{t("landingPreview.billing.hmoLine")}</span>
          <span className="font-mono">− ₱ {hmo.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
          <span>{t("landingPreview.billing.net")}</span>
          <span className="font-mono">₱ {net.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-slate-100 px-5 py-3">
        {[
          { label: payMethods[0] ?? "GCash", color: "bg-sky-50 text-sky-700 ring-sky-200" },
          { label: payMethods[1] ?? "Maya", color: "bg-teal-50 text-teal-700 ring-teal-200" },
          { label: payMethods[2] ?? "PayMongo", color: "bg-teal-50 text-teal-700 ring-teal-200" },
          { label: payMethods[3] ?? "Cash", color: "bg-slate-50 text-slate-700 ring-slate-200" },
        ].map((m) => (
          <span
            key={m.label}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${m.color}`}
          >
            {m.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Inventory ---------------- */

const INVENTORY_LEVELS = [
  { sku: "ANS-LID-02", level: 72, min: 20, status: "ok" as const },
  { sku: "DLG-CMP-A2", level: 18, min: 15, status: "low" as const },
  { sku: "SRF-GLV-M", level: 8, min: 20, status: "critical" as const },
  { sku: "SRF-MSK-FFP2", level: 45, min: 25, status: "ok" as const },
  { sku: "ENS-FRZ-R", level: 12, min: 10, status: "ok" as const },
];

export function InventoryPreview(): JSX.Element {
  const { t } = useTranslation();
  const rows = t("landingPreview.inventory.rows", { returnObjects: true }) as { name: string; unit: string }[];
  const statusStyle = {
    ok: {
      pill: "bg-teal-50 text-teal-700 ring-teal-200",
      bar: "bg-teal-500",
      label: t("landingPreview.inventory.status.ok"),
    },
    low: {
      pill: "bg-amber-50 text-amber-700 ring-amber-200",
      bar: "bg-amber-500",
      label: t("landingPreview.inventory.status.low"),
    },
    critical: {
      pill: "bg-rose-50 text-rose-700 ring-rose-200",
      bar: "bg-rose-500",
      label: t("landingPreview.inventory.status.critical"),
    },
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t("landingPreview.inventory.title")}</p>
          <p className="text-sm font-bold text-slate-900">{t("landingPreview.inventory.subtitle")}</p>
        </div>
        <span className="hidden items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 ring-1 ring-rose-200 sm:inline-flex">
          <IconAlert className="h-2.5 w-2.5" /> {t("landingPreview.inventory.reorderBadge")}
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {INVENTORY_LEVELS.map((s, idx) => {
          const row = rows[idx];
          const name = row?.name ?? "";
          const unit = row?.unit ?? "";
          const pct = Math.min(100, Math.round((s.level / Math.max(s.min * 3, 1)) * 100));
          const sty = statusStyle[s.status];
          return (
            <div key={s.sku} className="grid grid-cols-[1.5fr_1fr_auto] items-center gap-4 px-5 py-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">{name}</p>
                <p className="truncate text-[11px] font-mono text-slate-400">{s.sku}</p>
              </div>
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">
                    {s.level} {unit}
                  </span>
                  <span>
                    {t("landingPreview.inventory.minPrefix")} {s.min}
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${sty.bar}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${sty.pill}`}
              >
                {sty.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Revenue & Reports ---------------- */

export function RevenuePreview(): JSX.Element {
  const { t } = useTranslation();
  
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t("landingPreview.devices.deskRevenue")}</p>
          <p className="text-sm font-bold text-slate-900">↑ ₱ 42,500 <span className="text-[10px] font-medium text-teal-600 ml-1">avg +12%</span></p>
        </div>
        <div className="flex gap-1">
          <div className="h-6 w-12 rounded bg-slate-100" />
          <div className="h-6 w-12 rounded bg-slate-100" />
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-end gap-1.5 h-32">
          {[40, 65, 35, 85, 55, 95, 75].map((h, i) => (
            <div key={i} className="flex-1 bg-sky-100 rounded-t-lg relative group">
              <div className="absolute bottom-0 w-full bg-sky-500 rounded-t-lg transition-all" style={{ height: `${h}%` }} />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-3 px-1 text-[10px] font-bold text-slate-400">
          <span>MON</span>
          <span>TUE</span>
          <span>WED</span>
          <span>THU</span>
          <span>FRI</span>
          <span>SAT</span>
          <span>SUN</span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
             <p className="text-[10px] font-bold uppercase text-slate-500">Top Procedure</p>
             <p className="mt-1 text-sm font-bold text-slate-900">Root Canal</p>
             <p className="text-xs text-teal-600 font-semibold">₱ 12.4k this week</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
             <p className="text-[10px] font-bold uppercase text-slate-500">New Patients</p>
             <p className="mt-1 text-sm font-bold text-slate-900">+14</p>
             <p className="text-xs text-sky-600 font-semibold">↑ 30% from last</p>
          </div>
        </div>
      </div>
    </div>
  );
}
