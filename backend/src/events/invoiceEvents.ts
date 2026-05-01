/**
 * Basit in-memory invoice event emitter — Modül 7 SMS bildirimleri için.
 * Aynı `appointmentEvents.ts` desenini takip eder.
 */

export type InvoiceEvent =
  | {
      type: "invoice.payment_received";
      invoiceId: string;
      paymentId: string;
      amount: string; // decimal string
    }
  | { type: "invoice.paid"; invoiceId: string };

type Listener = (e: InvoiceEvent) => void | Promise<void>;

const listeners: Listener[] = [];

export function subscribeInvoiceEvents(listener: Listener): () => void {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

export function emitInvoiceEvent(event: InvoiceEvent): void {
  for (const listener of listeners) {
    try {
      void listener(event);
    } catch {
      /* ignore */
    }
  }
  /** GAP-008: tutar / hassas detay konsola yazılmaz */
  if (process.env.NODE_ENV !== "test") {
    if (event.type === "invoice.payment_received") {
      console.info("[event]", event.type, { invoiceId: event.invoiceId, paymentId: event.paymentId });
    } else {
      console.info("[event]", event.type, { invoiceId: event.invoiceId });
    }
  }
}
