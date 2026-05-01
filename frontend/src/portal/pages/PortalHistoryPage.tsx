import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { useUiLocale } from "../../hooks/useUiLocale";
import { translatePortalError } from "../translatePortalError";
import {
  fetchPortalHistory,
  fetchPortalFiles,
  startPortalInvoicePaymongo,
  getPortalInvoicePdfUrl,
  getPortalFileDownloadUrl,
  type PortalHistory,
  type PortalPatientFile,
} from "../services/portalApi";

const STATUS_STYLES: Record<string, string> = {
  UNPAID: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200",
  PARTIAL: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  PAID: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
};

export function PortalHistoryPage(): JSX.Element {
  const { t } = useTranslation();
  const locale = useUiLocale();
  const php = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
      }),
    [locale],
  );
  const [data, setData] = useState<PortalHistory | null>(null);
  const [files, setFiles] = useState<PortalPatientFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"treatments" | "invoices" | "files">("treatments");

  useEffect(() => {
    Promise.all([fetchPortalHistory(), fetchPortalFiles()])
      .then(([hist, f]) => {
        setData(hist);
        setFiles(f);
      })
      .catch((e: unknown) => setError(translatePortalError(e, t)));
  }, [t]);

  async function onPayWithGcash(invoiceId: string): Promise<void> {
    try {
      const checkout = await startPortalInvoicePaymongo(invoiceId);
      const payUrl = checkout.checkoutUrl ?? checkout.url;
      if (payUrl) {
        window.open(payUrl, "_blank");
      } else {
        toast.warning(t("pages.portal.history.alertDevGcash"));
      }
    } catch (e) {
      toast.error(translatePortalError(e, t));
    }
  }

  if (error) {
    return (
      <div className="min-w-0 px-6 py-8 text-sm text-rose-700 dark:text-rose-300">{error}</div>
    );
  }
  if (!data) {
    return (
      <div className="min-w-0 px-6 py-8 text-sm text-slate-500 dark:text-slate-400">
        {t("pages.portal.history.loading")}
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-5 px-4 pt-5 dark:text-slate-100">
      <div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white">{t("pages.portal.history.title")}</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">{t("pages.portal.history.subtitle")}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-emerald-50 p-3 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:ring-emerald-800">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            {t("pages.portal.history.paidAllTime")}
          </p>
          <p className="mt-1 text-lg font-black text-emerald-900 dark:text-emerald-100">
            {php.format(Number(data.totals.paidAllTime))}
          </p>
        </div>
        <div
          className={`rounded-2xl p-3 ring-1 ${
            Number(data.totals.outstanding) > 0
              ? "bg-rose-50 ring-rose-100 dark:bg-rose-950/30 dark:ring-rose-900"
              : "bg-slate-50 ring-slate-200 dark:bg-slate-800/80 dark:ring-slate-700"
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            {t("pages.portal.history.outstanding")}
          </p>
          <p
            className={`mt-1 text-lg font-black ${
              Number(data.totals.outstanding) > 0 ? "text-rose-700 dark:text-rose-300" : "text-slate-600 dark:text-slate-300"
            }`}
          >
            {php.format(Number(data.totals.outstanding))}
          </p>
        </div>
      </div>

      <div className="flex gap-1 rounded-full bg-slate-100 p-1 dark:bg-slate-800/90 overflow-x-auto hide-scrollbar">
        {(["treatments", "invoices", "files"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`min-h-10 flex-1 whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-inset ${
              tab === k
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {k === "treatments" ? t("pages.portal.history.tabTreatments") : k === "invoices" ? t("pages.portal.history.tabInvoices") : "My Files"}
          </button>
        ))}
      </div>

      {tab === "treatments" ? (
        data.treatments.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400">
            {t("pages.portal.history.noTreatments")}
          </div>
        ) : (
          <ul className="space-y-3">
            {data.treatments.map((row) => (
              <li
                key={row.id}
                className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-lg dark:bg-sky-900/50">
                  🦷
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-900 dark:text-slate-100">
                    {row.procedure.replace(/_/g, " ")}
                    {row.quantity > 1 ? ` ×${row.quantity}` : ""}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {row.localDate} · {t("pages.common.drPrefix")} {row.dentistName}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-black text-slate-900 dark:text-slate-100">
                  {php.format(Number(row.total))}
                </p>
              </li>
            ))}
          </ul>
        )
      ) : tab === "invoices" ? (
        <ul className="space-y-3">
          {data.invoices.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400">
              {t("pages.portal.history.noInvoices")}
            </div>
          ) : (
            data.invoices.map((inv) => (
              <li
                key={inv.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="min-w-0 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    {inv.orNumber ?? t("pages.portal.history.draft")}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                      STATUS_STYLES[inv.status] ?? "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {inv.status}
                  </span>
                </div>
                <p className="mt-1 text-xl font-black text-slate-900 dark:text-slate-100">
                  {php.format(Number(inv.total))}
                </p>
                {Number(inv.remaining) > 0 ? (
                  <p className="mt-0.5 text-xs text-rose-700 dark:text-rose-300">
                    {t("pages.portal.history.remaining", { amount: php.format(Number(inv.remaining)) })}
                  </p>
                ) : (
                  <p className="mt-0.5 text-xs text-emerald-700 dark:text-emerald-300">
                    {t("pages.portal.history.paidFull")}
                  </p>
                )}
                <div className="mt-3 flex gap-2">
                  {inv.isPayable ? (
                    <button
                      type="button"
                      onClick={() => onPayWithGcash(inv.id)}
                      className="flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-[#007DFE] py-2.5 text-sm font-black text-white shadow-sm hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
                    >
                      {t("pages.portal.history.payGcash")}
                    </button>
                  ) : null}
                  <a
                    href={getPortalInvoicePdfUrl(inv.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-slate-100 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    Download PDF
                  </a>
                </div>
              </li>
            ))
          )}
        </ul>
      ) : (
        <ul className="space-y-3">
          {files.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400">
              No files or X-rays available.
            </div>
          ) : (
            files.map((file) => (
              <li
                key={file.id}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-lg dark:bg-purple-900/50">
                  📄
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-slate-900 dark:text-slate-100">
                    {file.fileName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(file.createdAt).toLocaleDateString(locale)} · {(file.sizeBytes / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <a
                  href={getPortalFileDownloadUrl(file.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Download
                </a>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
