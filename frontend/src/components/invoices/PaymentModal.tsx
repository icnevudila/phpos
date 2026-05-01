import { useEffect, useState } from "react";

import { addInvoicePayment } from "../../services/invoices";
import type { InvoiceDto, PaymentMethod } from "../../types/invoice";
import { PAYMENT_METHODS, formatPHP } from "../../types/invoice";

interface Props {
  open: boolean;
  invoice: InvoiceDto;
  onClose: () => void;
  onSaved: (inv: InvoiceDto) => void;
}

export function PaymentModal({ open, invoice, onClose, onSaved }: Props): JSX.Element | null {
  const balance = Number(invoice.balance);
  const [amount, setAmount] = useState(balance);
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [referenceNo, setReferenceNo] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setAmount(Number(invoice.balance));
      setMethod("CASH");
      setReferenceNo("");
      setNotes("");
      setError(null);
    }
  }, [open, invoice.balance]);

  if (!open) return null;

  const methodMeta = PAYMENT_METHODS.find((m) => m.value === method);

  async function onSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    if (amount <= 0) {
      setError("Amount must be greater than zero");
      return;
    }
    if (amount > balance + 0.0001) {
      setError(`Amount cannot exceed balance (${formatPHP(balance)})`);
      return;
    }
    if (methodMeta?.needsRef && !referenceNo.trim()) {
      setError("Reference number is required for this method");
      return;
    }
    setSubmitting(true);
    try {
      const updated = await addInvoicePayment(invoice.id, {
        amount,
        method,
        referenceNo: referenceNo.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      onSaved(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add payment");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Record payment</h2>
            <p className="text-xs text-slate-500">
              Balance: <strong className="text-slate-900">{formatPHP(balance)}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Amount (₱)
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                ₱
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                max={balance}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-8 pr-3 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <div className="mt-1 flex gap-2 text-xs">
              <button
                type="button"
                onClick={() => setAmount(balance)}
                className="rounded border border-slate-200 px-2 py-0.5 font-semibold text-slate-600 hover:bg-slate-50"
              >
                Full ({formatPHP(balance)})
              </button>
              <button
                type="button"
                onClick={() => setAmount(Math.round((balance / 2) * 100) / 100)}
                className="rounded border border-slate-200 px-2 py-0.5 font-semibold text-slate-600 hover:bg-slate-50"
              >
                Half
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((m) => (
                <button
                  type="button"
                  key={m.value}
                  onClick={() => setMethod(m.value)}
                  className={`rounded-lg border px-2 py-2 text-xs font-semibold ${
                    method === m.value
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Reference no {methodMeta?.needsRef ? <span className="text-rose-600">*</span> : null}
            </label>
            <input
              type="text"
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              placeholder={methodMeta?.needsRef ? "Transaction ID" : "Optional"}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {error ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-gradient-to-br from-emerald-500 to-sky-500 px-5 py-2 text-sm font-semibold text-white shadow hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Saving…" : "Record payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
