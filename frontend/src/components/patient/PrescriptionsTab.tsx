import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Plus, 
  PlusCircle,
  Download, 
  Trash2, 
  Pill, 
  User, 
  Clipboard,
  Calendar,
  Activity,
  RefreshCw,
  Save,
  X,
  Stethoscope
} from "lucide-react";

import api, { openAuthedPdf } from "../../services/api";

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
      const res = await api.get<Prescription[]>(`/prescriptions/patient/${patientId}`);
      setPrescriptions(res.data);
    } catch {
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [patientId]);

  if (loading && !prescriptions) {
    return (
      <div className="card p-8 flex flex-col items-center justify-center text-center bg-brand-surface border border-brand-border">
        <Activity className="h-6 w-6 animate-spin text-brand-muted mb-2" />
        <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Loading Prescriptions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div className="space-y-1">
            <h3 className="text-sm font-bold text-brand-text uppercase tracking-widest">Prescriptions</h3>
            <p className="text-xs text-brand-muted">Digital Rx records and medication history.</p>
         </div>
         {canWrite && (
           <CreatePrescription 
             patientId={patientId} 
             appointments={appointments} 
             onCreated={load} 
           />
         )}
      </div>

      {prescriptions?.length === 0 ? (
        <div className="card p-8 flex flex-col items-center justify-center text-center bg-brand-surface-soft border border-brand-border">
          <p className="text-sm font-bold text-brand-muted uppercase tracking-widest">No Prescriptions Found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {prescriptions?.map((rx) => (
            <div
              key={rx.id}
              className="card bg-white border border-brand-border overflow-hidden flex flex-col"
            >
              <div className="px-5 py-4 border-b border-brand-border bg-brand-surface-soft flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-white border border-brand-border text-brand-primary">
                      <Stethoscope size={20} />
                   </div>
                   <div>
                      <h3 className="text-sm font-bold text-brand-text uppercase tracking-widest">
                        Clinical Prescription
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-[10px] font-bold uppercase tracking-widest text-brand-muted">
                         <span className="flex items-center gap-1.5">
                            <Calendar size={12} />
                            {new Date(rx.prescriptionDate).toLocaleDateString()}
                         </span>
                         <span className="h-1 w-1 rounded-full bg-brand-border" />
                         <span className="flex items-center gap-1.5">
                            <User size={12} />
                            Dr. {rx.dentist.firstName} {rx.dentist.lastName}
                         </span>
                      </div>
                   </div>
                </div>
                <button
                  onClick={() => openAuthedPdf(`/prescriptions/${rx.id}/pdf`).catch(() => toast.error("Failed to open PDF"))}
                  className="btn-secondary h-8 px-2"
                  title="Download PDF"
                >
                  <Download size={14} />
                </button>
              </div>

              <div className="p-5 space-y-3 flex-1 bg-white">
                {rx.items.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 rounded-[var(--radius-sm)] bg-brand-surface-soft border border-brand-border/50">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-white border border-brand-border text-brand-muted shadow-sm">
                       <Pill size={14} />
                    </div>
                    <div className="space-y-1 w-full">
                      <div className="flex items-center justify-between w-full">
                        <p className="text-sm font-bold text-brand-text leading-tight">
                          {item.medicineName} <span className="text-brand-primary ml-1">{item.dosage}</span>
                        </p>
                        <span className="text-[10px] font-black bg-white border border-brand-border px-1.5 py-0.5 rounded-[var(--radius-sm)] text-brand-text">
                           QTY: {item.quantity}
                        </span>
                      </div>
                      <div className="text-[10px] font-bold text-brand-text uppercase tracking-widest">
                         SIG: <span className="text-brand-primary">{item.frequency}</span>
                      </div>
                      {item.specialInstructions && (
                        <p className="text-xs font-medium text-brand-text-soft italic mt-1 bg-white p-2 border border-brand-border/50 rounded-[var(--radius-sm)]">
                           "{item.specialInstructions}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {rx.notes && (
                <div className="px-5 py-3 bg-amber-50 border-t border-amber-200">
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] font-black uppercase tracking-widest text-amber-600">
                     <Clipboard size={12} />
                     Physician Notes
                  </div>
                  <p className="text-xs font-bold text-amber-900 leading-relaxed">
                    {rx.notes}
                  </p>
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
      await api.post(`/prescriptions`, {
        patientId,
        appointmentId: appointmentId || undefined,
        notes: notes || undefined,
        items: items.map(i => ({ ...i, specialInstructions: i.specialInstructions || undefined }))
      });
      toast.success("Prescription generated successfully.");
      setOpen(false);
      setItems([{ medicineName: "", dosage: "", frequency: "", quantity: 1, specialInstructions: "" }]);
      setNotes("");
      onCreated();
    } catch (err) {
      toast.error("Failed to generate prescription.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {!open && (
        <button 
          onClick={() => setOpen(true)} 
          className="btn-primary flex items-center gap-2 h-8 px-3 text-xs"
        >
          <Plus size={14} /> Write Prescription
        </button>
      )}

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="w-full max-w-4xl card bg-white overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
             >
                <div className="px-6 py-4 border-b border-brand-border bg-brand-surface-soft flex justify-between items-center shrink-0">
                   <div className="flex items-center gap-2">
                      <Stethoscope className="text-brand-text" size={18} />
                      <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest">
                         New Prescription
                      </h4>
                   </div>
                   <button 
                     onClick={() => setOpen(false)} 
                     className="h-8 w-8 flex items-center justify-center rounded-[var(--radius-sm)] text-brand-muted hover:text-brand-text hover:bg-brand-surface transition-colors"
                   >
                     <X size={16} />
                   </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted ml-1">Linked Visit (Optional)</label>
                       <select 
                         value={appointmentId} 
                         onChange={(e) => setAppointmentId(e.target.value)} 
                         className="h-9 w-full rounded-[var(--radius-sm)] bg-white px-3 text-xs font-medium border border-brand-border outline-none focus:ring-1 focus:ring-brand-primary transition-all cursor-pointer"
                       >
                         <option value="">No Appointment Linked</option>
                         {validAppointments.map(a => (
                           <option key={a.id} value={a.id}>{new Date(a.scheduledAt).toLocaleDateString()} - {a.type || "General"}</option>
                         ))}
                       </select>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted ml-1">Clinical Notes (Optional)</label>
                       <input 
                         value={notes} 
                         onChange={(e) => setNotes(e.target.value)} 
                         placeholder="Add instructions or notes..." 
                         className="h-9 w-full rounded-[var(--radius-sm)] bg-white px-3 text-xs font-medium border border-brand-border outline-none focus:ring-1 focus:ring-brand-primary transition-all" 
                       />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-brand-text border-b border-brand-border pb-2">Medications</h5>
                    {items.map((it, idx) => (
                      <div 
                        key={idx}
                        className="grid gap-3 p-4 bg-brand-surface-soft rounded-[var(--radius-md)] border border-brand-border/50 md:grid-cols-12 items-end"
                      >
                        <div className="md:col-span-3 space-y-1">
                           <label className="text-[10px] font-bold text-brand-muted uppercase">Medicine</label>
                           <input placeholder="e.g. Amoxicillin" value={it.medicineName} onChange={e => updateItem(idx, 'medicineName', e.target.value)} className="w-full h-9 bg-white border border-brand-border rounded-[var(--radius-sm)] px-3 text-xs outline-none focus:ring-1 focus:ring-brand-primary" />
                        </div>
                        <div className="md:col-span-2 space-y-1">
                           <label className="text-[10px] font-bold text-brand-muted uppercase">Dosage</label>
                           <input placeholder="e.g. 500mg" value={it.dosage} onChange={e => updateItem(idx, 'dosage', e.target.value)} className="w-full h-9 bg-white border border-brand-border rounded-[var(--radius-sm)] px-3 text-xs outline-none focus:ring-1 focus:ring-brand-primary" />
                        </div>
                        <div className="md:col-span-2 space-y-1">
                           <label className="text-[10px] font-bold text-brand-muted uppercase">Sig</label>
                           <input placeholder="e.g. TID x 7 days" value={it.frequency} onChange={e => updateItem(idx, 'frequency', e.target.value)} className="w-full h-9 bg-white border border-brand-border rounded-[var(--radius-sm)] px-3 text-xs outline-none focus:ring-1 focus:ring-brand-primary" />
                        </div>
                        <div className="md:col-span-1 space-y-1">
                           <label className="text-[10px] font-bold text-brand-muted uppercase">Qty</label>
                           <input type="number" min={1} value={it.quantity} onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value)||1)} className="w-full h-9 bg-white border border-brand-border rounded-[var(--radius-sm)] px-3 text-xs outline-none focus:ring-1 focus:ring-brand-primary text-center tabular-nums" />
                        </div>
                        <div className="md:col-span-3 space-y-1">
                           <label className="text-[10px] font-bold text-brand-muted uppercase">Instructions</label>
                           <input placeholder="e.g. Take with food" value={it.specialInstructions} onChange={e => updateItem(idx, 'specialInstructions', e.target.value)} className="w-full h-9 bg-white border border-brand-border rounded-[var(--radius-sm)] px-3 text-xs outline-none focus:ring-1 focus:ring-brand-primary" />
                        </div>
                        <div className="md:col-span-1 flex justify-center pb-0.5">
                           <button 
                             onClick={() => removeItem(idx)} 
                             disabled={items.length===1} 
                             className="h-8 w-8 flex items-center justify-center rounded-[var(--radius-sm)] btn-secondary disabled:opacity-30 disabled:pointer-events-none"
                             title="Remove Item"
                           >
                             <Trash2 size={14} />
                           </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={addItem} 
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-brand-primary hover:underline ml-1"
                  >
                    <PlusCircle size={14} /> Add Another Medicine
                  </button>
                </div>

                <div className="px-6 py-4 border-t border-brand-border bg-brand-surface-soft flex justify-end gap-3 shrink-0">
                  <button 
                    onClick={() => setOpen(false)}
                    className="btn-secondary h-9 px-4 text-xs"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={busy} 
                    onClick={handleSave} 
                    className="btn-primary h-9 px-6 text-xs disabled:opacity-70 gap-2"
                  >
                    {busy ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
                    Generate Rx
                  </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
