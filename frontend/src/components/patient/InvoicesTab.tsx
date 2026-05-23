import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

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
  PAID: "bg-teal-50 text-teal-800 border-teal-200",
  PARTIAL: "bg-amber-50 text-amber-800 border-amber-200",
  UNPAID: "bg-rose-50 text-rose-800 border-rose-200",
  CANCELLED: "bg-brand-surface text-brand-muted border-brand-border",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
};

const money = (v: string | number | null | undefined): string => {
  if (v === null || v === undefined || v === "") return "₱0.00";
  const num = typeof v === "string" ? Number(v) : v;
  return `₱${num.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (iso: string | null | undefined, empty: string, locale: string): string => {
  if (!iso) return empty;
  return new Date(iso).toLocaleDateString(locale, { 
    timeZone: "Asia/Manila",
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export function InvoicesTab({ items, dateLocale }: InvoicesTabProps): JSX.Element {
  const dash = "--";

  if (items.length === 0) {
    return (
      <div className="card p-8 flex flex-col items-center justify-center text-center bg-brand-surface-soft border border-brand-border">
        <p className="text-sm font-bold text-brand-muted uppercase tracking-widest">No Invoices Found</p>
      </div>
    );
  }

  return (
    <div className="card border border-brand-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-brand-surface-muted border-b border-brand-border">
            <tr>
              <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-brand-muted">OR Number</th>
              <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-brand-muted">Date</th>
              <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-brand-muted text-right">Subtotal</th>
              <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-brand-muted text-right">Discount</th>
              <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-brand-muted text-right">Total</th>
              <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-brand-muted">Status</th>
              <th className="py-3 px-4" aria-hidden />
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/50 bg-white">
            {items.map((inv) => (
              <tr key={inv.id} className="hover:bg-brand-surface-soft transition-colors group">
                <td className="py-3 px-4 font-mono text-xs font-bold text-brand-text">{inv.orNumber ?? dash}</td>
                <td className="py-3 px-4 text-xs font-medium text-brand-muted whitespace-nowrap">{formatDate(inv.createdAt, dash, dateLocale)}</td>
                <td className="py-3 px-4 text-right text-xs font-bold text-brand-text-soft tabular-nums">{money(inv.subtotal)}</td>
                <td className="py-3 px-4 text-right text-xs font-bold text-brand-danger tabular-nums">{Number(inv.discount) > 0 ? `-${money(inv.discount)}` : dash}</td>
                <td className="py-3 px-4 text-right text-sm font-black text-brand-text tabular-nums tracking-tight">{money(inv.total)}</td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-[var(--radius-sm)] border text-[10px] font-black uppercase tracking-widest ${ STATUS_STYLES[inv.status] ?? "bg-brand-surface text-brand-text border-brand-border" }`}
                  >
                    {inv.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <Link 
                    to={`/invoices/${inv.id}`} 
                    className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-brand-muted hover:bg-white hover:text-brand-primary hover:shadow-sm border border-transparent hover:border-brand-border transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Open Invoice"
                  >
                    <ArrowRight size={14} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
