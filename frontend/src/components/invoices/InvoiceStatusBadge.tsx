import type { InvoiceStatus } from "../../types/invoice";
import { INVOICE_STATUS_STYLES } from "../../types/invoice";

interface Props {
  status: InvoiceStatus;
  size?: "sm" | "md";
}

export function InvoiceStatusBadge({ status, size = "md" }: Props): JSX.Element {
  const style = INVOICE_STATUS_STYLES[status];
  const sizeCls = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-wider ring-1 ${style.pillBg} ${style.pillText} ${style.ring} ${sizeCls}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}
