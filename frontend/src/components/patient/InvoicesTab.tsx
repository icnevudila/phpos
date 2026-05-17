import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface InvoiceRow {
  id: string;
  orNumber: string | null;
  subtotal: string;
  discount: string;
  total: string;
  status: string;
  dueDate: string | null;
  paidAt: string | null;
  createdAt: string;
}

interface InvoicesTabProps {
  items: InvoiceRow[];
  dateLocale: string;
}

const STATUS_STYLES: Record<string, string> = {
  PAID: "bg-emerald-100 text-emerald-700",
  PARTIAL: "bg-amber-100 text-amber-700",
  UNPAID: "bg-rose-100 text-rose-700",
  CANCELLED: "bg-slate-200 text-slate-600",
  PENDING: "bg-slate-100 text-slate-700",
};

const money = (v: string | number | null | undefined): string => {
  if (v === null || v === undefined || v === "") return "₱ 0.00";
  const num = typeof v === "string" ? Number(v) : v;
  return `₱ ${num.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (iso: string | null | undefined, empty: string, locale: string): string => {
  if (!iso) return empty;
  return new Date(iso).toLocaleDateString(locale, { timeZone: "Asia/Manila" });
};

export function InvoicesTab({ items, dateLocale }: InvoicesTabProps): JSX.Element {
  const { t } = useTranslation();
  const dash = t("pages.common.empty");

  if (items.length === 0) {
    return <p className="text-sm text-slate-500">{t("pages.patientDetail.invoices.empty")}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[760px] w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <th className="px-2 py-2">{t("pages.patientDetail.invoices.colOr")}</th>
            <th className="px-2 py-2">{t("pages.patientDetail.invoices.colDate")}</th>
            <th className="px-2 py-2">{t("pages.patientDetail.invoices.colSubtotal")}</th>
            <th className="px-2 py-2">{t("pages.patientDetail.invoices.colDiscount")}</th>
            <th className="px-2 py-2">{t("pages.patientDetail.invoices.colTotal")}</th>
            <th className="px-2 py-2">{t("pages.patientDetail.invoices.colStatus")}</th>
            <th className="px-2 py-2" aria-hidden />
          </tr>
        </thead>
        <tbody>
          {items.map((inv) => (
            <tr key={inv.id} className="border-b border-slate-100">
              <td className="px-2 py-2 font-mono text-xs text-slate-700">{inv.orNumber ?? dash}</td>
              <td className="px-2 py-2 text-slate-800">{formatDate(inv.createdAt, dash, dateLocale)}</td>
              <td className="px-2 py-2 text-slate-600">{money(inv.subtotal)}</td>
              <td className="px-2 py-2 text-slate-600">{money(inv.discount)}</td>
              <td className="px-2 py-2 font-medium text-slate-900">{money(inv.total)}</td>
              <td className="px-2 py-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    STATUS_STYLES[inv.status] ?? "bg-slate-100 text-slate-700"
                  }`}
                >
                  {t(`pages.patientDetail.invoices.statusLabels.${inv.status}`, { defaultValue: inv.status })}
                </span>
              </td>
              <td className="px-2 py-2 text-right">
                <Link to={`/invoices/${inv.id}`} className="text-xs text-sky-600 hover:underline">
                  {t("pages.patientDetail.invoices.open")}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
