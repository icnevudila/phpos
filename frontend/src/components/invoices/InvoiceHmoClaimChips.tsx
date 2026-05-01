import type { HmoClaimStatus, InvoiceHmoClaimBrief } from "../../types/invoice";

const STATUS_STYLE: Record<HmoClaimStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  SUBMITTED: "bg-sky-100 text-sky-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  PARTIAL_APPROVED: "bg-amber-100 text-amber-900",
  REJECTED: "bg-rose-100 text-rose-800",
  PAID: "bg-indigo-100 text-indigo-900",
};

const STATUS_LABEL: Record<HmoClaimStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Pending",
  APPROVED: "Approved",
  PARTIAL_APPROVED: "Partial",
  REJECTED: "Rejected",
  PAID: "Paid",
};

export function InvoiceHmoClaimChips({
  claims,
  emptyLabel = "—",
}: {
  claims: InvoiceHmoClaimBrief[];
  emptyLabel?: string;
}): JSX.Element {
  if (!claims.length) {
    return <span className="text-slate-400">{emptyLabel}</span>;
  }
  return (
    <div className="flex max-w-[220px] flex-wrap gap-1">
      {claims.slice(0, 2).map((c) => (
        <span
          key={c.id}
          title={`${c.claimNumber} · ${c.providerName}`}
          className={`inline-flex max-w-full truncate rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_STYLE[c.status]}`}
        >
          {c.providerCode} · {STATUS_LABEL[c.status]}
        </span>
      ))}
      {claims.length > 2 ? (
        <span className="self-center text-[10px] font-semibold text-slate-500">+{claims.length - 2}</span>
      ) : null}
    </div>
  );
}
