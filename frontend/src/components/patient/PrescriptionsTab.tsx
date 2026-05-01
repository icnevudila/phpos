import { useEffect, useState } from "react";
import { toast } from "sonner";
import { apiFetch, openAuthedPdf } from "../../services/api";

interface Prescription {
  id: string;
  prescriptionDate: string;
  notes: string | null;
  dentist: { id: string; firstName: string; lastName: string };
  items: Array<{
    id: string;
    medicineName: string;
    dosage: string;
    frequency: string;
    quantity: number;
    specialInstructions: string | null;
  }>;
}

export function PrescriptionsTab({
  patientId,
  dateLocale,
  canWrite,
  appointments,
}: {
  patientId: string;
  dateLocale: string;
  canWrite: boolean;
  appointments: Array<{
    id: string;
    scheduledAt: string;
    type: string | null;
    status: string;
  }>;
}): JSX.Element {
  const [prescriptions, setPrescriptions] = useState<Prescription[] | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await apiFetch<Prescription[]>(`/prescriptions/patient/${patientId}`);
      setPrescriptions(res);
    } catch {
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [patientId]);

  if (loading || prescriptions === null) {
    return <p className="text-sm text-slate-500">Loading prescriptions...</p>;
  }

  return (
    <div className="space-y-6">
      {canWrite && <CreatePrescription patientId={patientId} appointments={appointments} onCreated={load} />}
      
      {prescriptions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
          <svg className="mx-auto mb-2 h-8 w-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v10a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm font-medium">No prescriptions yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {prescriptions.map((rx) => (
            <div key={rx.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-emerald-300 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <svg className="h-4 w-4 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    Prescription
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(rx.prescriptionDate).toLocaleDateString(dateLocale)} · Dr. {rx.dentist.firstName} {rx.dentist.lastName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openAuthedPdf(`/prescriptions/${rx.id}/pdf`).catch(() => toast.error("Could not load PDF"))}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  PDF
                </button>
              </div>
              <ul className="space-y-2">
                {rx.items.map((item) => (
                  <li key={item.id} className="text-sm">
                    <div className="font-medium text-slate-800">{item.medicineName} {item.dosage}</div>
                    <div className="text-xs text-slate-600">Sig: {item.frequency} (Qty: {item.quantity})</div>
                    {item.specialInstructions && <div className="text-xs text-slate-500 italic">Note: {item.specialInstructions}</div>}
                  </li>
                ))}
              </ul>
              {rx.notes && (
                <div className="mt-3 p-2 bg-amber-50 rounded text-xs text-amber-900 border border-amber-100">
                  <span className="font-bold">Notes:</span> {rx.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CreatePrescription({
  patientId,
  appointments,
  onCreated,
}: {
  patientId: string;
  appointments: Array<{ id: string; scheduledAt: string; type: string | null; status: string }>;
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [appointmentId, setAppointmentId] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([{ medicineName: "", dosage: "", frequency: "", quantity: 1, specialInstructions: "" }]);
  const [busy, setBusy] = useState(false);

  const addItem = () => setItems([...items, { medicineName: "", dosage: "", frequency: "", quantity: 1, specialInstructions: "" }]);
  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };
  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const validAppointments = appointments.filter((a) =>
    ["PENDING", "CONFIRMED", "CHECKED_IN", "IN_PROGRESS"].includes(a.status),
  );

  const handleSave = async () => {
    if (items.some(i => !i.medicineName || !i.dosage || !i.frequency || !i.quantity)) {
      toast.error("Please fill all required medicine fields.");
      return;
    }
    setBusy(true);
    try {
      await apiFetch(`/prescriptions`, {
        method: "POST",
        body: JSON.stringify({
          patientId,
          appointmentId: appointmentId || undefined,
          notes: notes || undefined,
          items: items.map(i => ({ ...i, specialInstructions: i.specialInstructions || undefined }))
        })
      });
      toast.success("Prescription created");
      setOpen(false);
      setItems([{ medicineName: "", dosage: "", frequency: "", quantity: 1, specialInstructions: "" }]);
      setNotes("");
      onCreated();
    } catch (err) {
      toast.error("Failed to create prescription");
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
        Write Prescription
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-bold text-slate-800">New Prescription</h4>
        <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">Cancel</button>
      </div>

      <div className="grid gap-3 mb-4 md:grid-cols-2">
        <select value={appointmentId} onChange={(e) => setAppointmentId(e.target.value)} className="rounded border-slate-300 text-sm py-2">
          <option value="">-- No linked appointment --</option>
          {validAppointments.map(a => (
            <option key={a.id} value={a.id}>{new Date(a.scheduledAt).toLocaleDateString()} - {a.type || "General"}</option>
          ))}
        </select>
        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="General Notes (Optional)" className="rounded border-slate-300 text-sm py-2" />
      </div>

      <div className="space-y-3">
        {items.map((it, idx) => (
          <div key={idx} className="flex flex-wrap gap-2 items-start bg-white p-3 rounded-lg border border-slate-200">
            <input placeholder="Medicine (e.g. Amoxicillin)" value={it.medicineName} onChange={e => updateItem(idx, 'medicineName', e.target.value)} className="flex-1 min-w-[120px] rounded border-slate-300 text-sm py-1.5" />
            <input placeholder="Dosage (e.g. 500mg)" value={it.dosage} onChange={e => updateItem(idx, 'dosage', e.target.value)} className="w-24 rounded border-slate-300 text-sm py-1.5" />
            <input placeholder="Sig / Freq (e.g. 1 cap q8h x 7 days)" value={it.frequency} onChange={e => updateItem(idx, 'frequency', e.target.value)} className="flex-1 min-w-[180px] rounded border-slate-300 text-sm py-1.5" />
            <input type="number" min={1} placeholder="Qty" value={it.quantity} onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value)||1)} className="w-16 rounded border-slate-300 text-sm py-1.5" />
            <input placeholder="Instruction (Opt)" value={it.specialInstructions} onChange={e => updateItem(idx, 'specialInstructions', e.target.value)} className="flex-1 min-w-[120px] rounded border-slate-300 text-sm py-1.5" />
            <button onClick={() => removeItem(idx)} disabled={items.length===1} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded mt-1 disabled:opacity-30"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-between items-center">
        <button onClick={addItem} className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
          Add Medicine
        </button>
        <button disabled={busy} onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-6 rounded shadow disabled:opacity-70">
          Save Prescription
        </button>
      </div>
    </div>
  );
}
