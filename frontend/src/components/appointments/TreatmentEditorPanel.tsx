import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  createAppointmentTreatment,
  deleteTreatment,
  fetchAppointmentInvoiceMeta,
  fetchAppointmentTreatments,
  finalizeAppointmentTreatments,
  type TreatmentRow,
  updateTreatment,
} from "../../services/treatments";

const TE = "pages.appointments.treatmentEditor";

const PROCEDURE_OPTIONS = [
  { value: "Extraction", key: `${TE}.procedures.extraction` },
  { value: "Filling", key: `${TE}.procedures.filling` },
  { value: "Cleaning", key: `${TE}.procedures.cleaning` },
  { value: "Root Canal", key: `${TE}.procedures.rootCanal` },
  { value: "Crown", key: `${TE}.procedures.crown` },
  { value: "Whitening", key: `${TE}.procedures.whitening` },
  { value: "Consultation", key: `${TE}.procedures.consultation` },
  { value: "X-Ray", key: `${TE}.procedures.xray` },
  { value: "Other", key: `${TE}.procedures.other` },
] as const;

const PROCEDURE_I18N = Object.fromEntries(PROCEDURE_OPTIONS.map((p) => [p.value, p.key]));

function procedureLabel(value: string, t: (k: string) => string): string {
  const key = PROCEDURE_I18N[value];
  return key ? t(key) : value;
}

const PHP = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

interface Props {
  appointmentId: string;
  disabled?: boolean;
}

interface FormState {
  procedure: string;
  quantity: number;
  unitPrice: number;
  toothIdsText: string;
  notes: string;
}

const EMPTY_FORM: FormState = {
  procedure: "Consultation",
  quantity: 1,
  unitPrice: 500,
  toothIdsText: "",
  notes: "",
};

function parseToothIds(raw: string): string[] {
  return raw
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export function TreatmentEditorPanel({ appointmentId, disabled = false }: Props): JSX.Element {
  const { t } = useTranslation();
  const [items, setItems] = useState<TreatmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [invoiceMeta, setInvoiceMeta] = useState<{ id: string; status: string; orNumber: string | null } | null>(
    null,
  );

  async function load(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const [rows, invoice] = await Promise.all([
        fetchAppointmentTreatments(appointmentId),
        fetchAppointmentInvoiceMeta(appointmentId),
      ]);
      setItems(rows);
      setInvoiceMeta(invoice);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("pages.appointments.treatmentEditor.loadFailed", { defaultValue: "Load Failed" }));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId]);

  const subtotal = useMemo(
    () => items.reduce((sum, t) => sum + Number(t.unitPrice) * t.quantity, 0),
    [items],
  );

  function fillForEdit(item: TreatmentRow): void {
    setEditingId(item.id);
    setForm({
      procedure: item.procedure,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      toothIdsText: item.toothIds.join(", "),
      notes: item.notes ?? "",
    });
  }

  function resetForm(): void {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function submit(): Promise<void> {
    if (!form.procedure) {
      setError(t("pages.appointments.treatmentEditor.errors.procedureRequired", { defaultValue: "Please select a procedure." }));
      return;
    }
    if (form.quantity < 1) {
      setError(t("pages.appointments.treatmentEditor.errors.quantityInvalid", { defaultValue: "Quantity must be at least 1." }));
      return;
    }
    if (form.unitPrice < 0) {
      setError(t("pages.appointments.treatmentEditor.errors.priceInvalid", { defaultValue: "Price cannot be negative." }));
      return;
    }
    
    setBusy(true);
    setError(null);
    try {
      const payload = {
        procedure: form.procedure,
        quantity: form.quantity,
        unitPrice: form.unitPrice,
        toothIds: parseToothIds(form.toothIdsText),
        notes: form.notes || undefined,
      };
      if (editingId) {
        await updateTreatment(editingId, payload);
      } else {
        await createAppointmentTreatment(appointmentId, payload);
      }
      resetForm();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("pages.appointments.treatmentEditor.saveFailed", { defaultValue: "Save Failed" }));
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string): Promise<void> {
    if (!confirm(t("pages.appointments.treatmentRowDeleteConfirm", { defaultValue: "Treatment Row Delete Confirm" }))) return;
    setBusy(true);
    setError(null);
    try {
      await deleteTreatment(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("pages.appointments.treatmentEditor.deleteFailed", { defaultValue: "Delete Failed" }));
    } finally {
      setBusy(false);
    }
  }

  async function finalize(): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      await finalizeAppointmentTreatments(appointmentId);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("pages.appointments.treatmentEditor.finalizeFailed", { defaultValue: "Finalize Failed" }));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          {t("pages.appointments.treatmentEditor.title", { defaultValue: "Title" })}
        </h4>
        <div className="text-xs text-slate-600">
          {t("pages.appointments.treatmentEditor.subtotal", { defaultValue: "Subtotal" })}{" "}
          <strong className="text-slate-900">{PHP.format(subtotal)}</strong>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-xs text-rose-700">{error}</div>
      ) : null}

      {invoiceMeta ? (
        <div className="rounded-lg border border-teal-200 bg-teal-50 px-2 py-1 text-xs text-teal-800">
          {t("pages.appointments.treatmentEditor.invoiceReady", {
            ref: invoiceMeta.orNumber ?? invoiceMeta.id,
            status: invoiceMeta.status,
          })}{" "}
          <a href={`/invoices/${invoiceMeta.id}`} className="font-semibold underline">
            {t("pages.appointments.treatmentEditor.openInvoice", { defaultValue: "Open Invoice" })}
          </a>
        </div>
      ) : (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-800">
          {t("pages.appointments.treatmentEditor.notFinalized", { defaultValue: "Not Finalized" })}
        </div>
      )}

      {loading ? (
        <p className="text-xs text-slate-500">{t("pages.appointments.treatmentEditor.loadingRows", { defaultValue: "Loading Rows" })}</p>
      ) : items.length === 0 ? (
        <p className="text-xs text-slate-500">{t("pages.appointments.treatmentEditor.emptyRows", { defaultValue: "Empty Rows" })}</p>
      ) : (
        <div className="max-h-44 overflow-y-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-2 py-1 text-left">{t("pages.appointments.treatmentEditor.colProcedure", { defaultValue: "Col Procedure" })}</th>
                <th className="px-2 py-1 text-right">{t("pages.appointments.treatmentEditor.colQty", { defaultValue: "Col Qty" })}</th>
                <th className="px-2 py-1 text-right">{t("pages.appointments.treatmentEditor.colUnit", { defaultValue: "Col Unit" })}</th>
                <th className="px-2 py-1 text-right">{t("pages.appointments.treatmentEditor.colTotal", { defaultValue: "Col Total" })}</th>
                <th className="px-2 py-1 text-right">{t("pages.appointments.treatmentEditor.colActions", { defaultValue: "Col Actions" })}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="px-2 py-1">
                    {row.procedure}
                    <div className="text-[10px] text-slate-500">
                      {row.toothIds.join(", ") || t("pages.appointments.treatmentEditor.toothGeneral", { defaultValue: "Tooth General" })}
                    </div>
                  </td>
                  <td className="px-2 py-1 text-right">{row.quantity}</td>
                  <td className="px-2 py-1 text-right">{PHP.format(Number(row.unitPrice))}</td>
                  <td className="px-2 py-1 text-right font-semibold">
                    {PHP.format(Number(row.unitPrice) * row.quantity)}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {!disabled ? (
                      <div className="inline-flex gap-1">
                        <button
                          type="button"
                          onClick={() => fillForEdit(row)}
                          className="rounded border border-slate-300 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          {t("pages.appointments.treatmentEditor.edit", { defaultValue: "Edit" })}
                        </button>
                        <button
                          type="button"
                          onClick={() => void remove(row.id)}
                          className="rounded border border-rose-300 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700 hover:bg-rose-50"
                        >
                          {t("pages.appointments.treatmentEditor.delete", { defaultValue: "Delete" })}
                        </button>
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!disabled ? (
        <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-2">
          <div className="grid grid-cols-2 gap-2">
            <select
              value={form.procedure}
              onChange={(e) => setForm((s) => ({ ...s, procedure: e.target.value }))}
              className="rounded border border-slate-300 px-2 py-1 text-xs"
            >
              {PROCEDURE_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {t(p.key)}
                </option>
              ))}
            </select>
            <input
              value={form.toothIdsText}
              onChange={(e) => setForm((s) => ({ ...s, toothIdsText: e.target.value }))}
              placeholder={t("pages.appointments.treatmentEditor.placeholderToothIds", { defaultValue: "Placeholder Tooth Ids" })}
              className="rounded border border-slate-300 px-2 py-1 text-xs"
            />
            <input
              type="number"
              min={1}
              value={form.quantity}
              onChange={(e) => setForm((s) => ({ ...s, quantity: Number(e.target.value) || 1 }))}
              className="rounded border border-slate-300 px-2 py-1 text-xs"
            />
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.unitPrice}
              onChange={(e) => setForm((s) => ({ ...s, unitPrice: Number(e.target.value) || 0 }))}
              className="rounded border border-slate-300 px-2 py-1 text-xs"
            />
          </div>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))}
            rows={2}
            placeholder={t("pages.appointments.treatmentEditor.placeholderNotes", { defaultValue: "Placeholder Notes" })}
            className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
          />
          <div className="flex items-center justify-between">
            <button
              type="button"
              disabled={busy}
              onClick={() => void submit()}
              className="rounded bg-teal-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
            >
              {editingId
                ? t("pages.appointments.treatmentEditor.updateRow", { defaultValue: "Update Row" })
                : t("pages.appointments.treatmentEditor.addRow", { defaultValue: "Add Row" })}
            </button>
            <div className="flex gap-1">
              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded border border-slate-300 px-2 py-1 text-[10px] font-semibold text-slate-700"
                >
                  {t(`${TE}.cancelEdit`, { defaultValue: "Cancel edit" })}
                </button>
              ) : null}
              <button
                type="button"
                disabled={busy || items.length === 0}
                onClick={() => void finalize()}
                className="rounded border border-indigo-300 bg-white px-2 py-1 text-[10px] font-semibold text-indigo-700 hover:bg-indigo-50 disabled:opacity-60"
              >
                {t("pages.appointments.treatmentEditor.finalizeToInvoice", { defaultValue: "Finalize To Invoice" })}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
