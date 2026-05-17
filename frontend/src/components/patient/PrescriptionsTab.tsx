import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { motion } from "framer-motion";
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
  const { t } = useTranslation();
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
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Activity className="h-10 w-10 animate-spin text-emerald-500" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
          {t("pages.patientDetail.prescriptions.loading")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {canWrite && (
        <CreatePrescription 
          patientId={patientId} 
          appointments={appointments} 
          onCreated={load} 
          t={t}
        />
      )}
      
      {prescriptions?.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[3rem] border-2 border-dashed border-slate-200 bg-white/50 p-20 text-center dark:border-slate-800 dark:bg-slate-900/50"
        >
          <FileText className="mx-auto text-slate-200 dark:text-slate-800 mb-6" size={64} />
          <p className="text-lg font-black text-slate-400 uppercase tracking-widest">
            {t("pages.patientDetail.prescriptions.empty")}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {prescriptions?.map((rx, idx) => (
            <motion.div
              key={rx.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="group relative flex flex-col rounded-[2.5rem] bg-white p-8 shadow-xl shadow-slate-200/40 transition-all hover:shadow-2xl hover:shadow-slate-300/50 dark:bg-slate-900 dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden"
            >
              <div className="flex justify-between items-start mb-8 pb-8 border-b border-slate-50 dark:border-slate-800">
                <div className="flex items-center gap-5">
                   <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                      <Stethoscope size={28} />
                   </div>
                   <div>
                      <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                        {t("pages.patientDetail.prescriptions.itemTitle")}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                         <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(rx.prescriptionDate).toLocaleDateString(dateLocale)}
                         </span>
                         <span className="h-1 w-1 rounded-full bg-slate-200" />
                         <span className="flex items-center gap-1">
                            <User size={12} />
                            {t("pages.common.drPrefix")} {rx.dentist.firstName} {rx.dentist.lastName}
                         </span>
                      </div>
                   </div>
                </div>
                <button
                  onClick={() => openAuthedPdf(`/prescriptions/${rx.id}/pdf`).catch(() => toast.error(t("pages.patientDetail.prescriptions.pdfFailed")))}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                >
                  <Download size={20} />
                </button>
              </div>

              <div className="space-y-6 flex-1">
                {rx.items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 ring-1 ring-slate-100 dark:ring-slate-800">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-900 text-emerald-500 shadow-sm">
                       <Pill size={18} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                        {item.medicineName} <span className="text-emerald-500">{item.dosage}</span>
                      </p>
                      <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                         <span className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg shadow-sm">SIG: {item.frequency}</span>
                         <span className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg shadow-sm">QTY: {item.quantity}</span>
                      </div>
                      {item.specialInstructions && (
                        <p className="text-xs font-medium text-slate-500 italic mt-2">
                           "{item.specialInstructions}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {rx.notes && (
                <div className="mt-8 p-6 bg-amber-50/50 dark:bg-amber-950/20 rounded-[1.5rem] ring-1 ring-amber-100 dark:ring-amber-900/30">
                  <div className="flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-widest text-amber-600">
                     <Clipboard size={12} />
                     {t("pages.patientDetail.prescriptions.notesLabel")}
                  </div>
                  <p className="text-xs font-bold text-amber-900 dark:text-amber-300 leading-relaxed">
                    {rx.notes}
                  </p>
                </div>
              )}
            </motion.div>
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
  t
}: {
  patientId: string;
  appointments: Array<{ id: string; scheduledAt: string; type: string | null; status: string }>;
  onCreated: () => void;
  t: any;
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
      toast.error(t("pages.patientDetail.prescriptions.form.fillAll"));
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
      toast.success(t("pages.patientDetail.prescriptions.form.success"));
      setOpen(false);
      setItems([{ medicineName: "", dosage: "", frequency: "", quantity: 1, specialInstructions: "" }]);
      setNotes("");
      onCreated();
    } catch (err) {
      toast.error(t("pages.patientDetail.prescriptions.form.error"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative">
      {!open ? (
        <button 
          onClick={() => setOpen(true)} 
          className="flex h-16 items-center gap-3 rounded-3xl bg-slate-900 dark:bg-white px-8 text-xs font-black uppercase tracking-widest text-white dark:text-slate-900 shadow-2xl transition-all hover:scale-105 active:scale-95"
        >
          <Plus size={20} />
          {t("pages.patientDetail.prescriptions.writeCta")}
        </button>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[3rem] bg-slate-50 dark:bg-slate-900/50 p-10 ring-1 ring-slate-200 dark:ring-slate-800 shadow-xl"
        >
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-4">
               <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                  <Pill size={24} />
               </div>
               <h4 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  {t("pages.patientDetail.prescriptions.form.title")}
               </h4>
            </div>
            <button 
              onClick={() => setOpen(false)} 
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-500 transition-colors shadow-sm"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid gap-6 mb-8 md:grid-cols-2">
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">{t("pages.patientDetail.prescriptions.form.linkedAppointment")}</label>
               <select 
                 value={appointmentId} 
                 onChange={(e) => setAppointmentId(e.target.value)} 
                 className="h-14 w-full rounded-2xl bg-white dark:bg-slate-900 px-6 text-sm font-bold outline-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
               >
                 <option value="">{t("pages.patientDetail.prescriptions.form.noAppointment")}</option>
                 {validAppointments.map(a => (
                   <option key={a.id} value={a.id}>{new Date(a.scheduledAt).toLocaleDateString()} - {a.type || t("pages.patientDetail.appointments.apptTypeGeneral")}</option>
                 ))}
               </select>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">{t("pages.patientDetail.prescriptions.form.clinicalNotes")}</label>
               <input 
                 value={notes} 
                 onChange={(e) => setNotes(e.target.value)} 
                 placeholder={t("pages.patientDetail.prescriptions.form.notesPlaceholder")} 
                 className="h-14 w-full rounded-2xl bg-white dark:bg-slate-900 px-6 text-sm font-bold outline-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-emerald-500 transition-all" 
               />
            </div>
          </div>

          <div className="space-y-4">
            {items.map((it, idx) => (
              <motion.div 
                key={idx}
                layout
                className="grid gap-4 p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm md:grid-cols-12 items-center"
              >
                <div className="md:col-span-3">
                   <input placeholder={t("pages.patientDetail.prescriptions.form.medicinePlaceholder")} value={it.medicineName} onChange={e => updateItem(idx, 'medicineName', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4 py-3 text-sm font-bold outline-none border border-transparent focus:border-emerald-500 transition-all" />
                </div>
                <div className="md:col-span-2">
                   <input placeholder={t("pages.patientDetail.prescriptions.form.dosagePlaceholder")} value={it.dosage} onChange={e => updateItem(idx, 'dosage', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4 py-3 text-sm font-bold outline-none border border-transparent focus:border-emerald-500 transition-all" />
                </div>
                <div className="md:col-span-3">
                   <input placeholder={t("pages.patientDetail.prescriptions.form.sigPlaceholder")} value={it.frequency} onChange={e => updateItem(idx, 'frequency', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4 py-3 text-sm font-bold outline-none border border-transparent focus:border-emerald-500 transition-all" />
                </div>
                <div className="md:col-span-1">
                   <input type="number" min={1} value={it.quantity} onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value)||1)} className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4 py-3 text-sm font-bold outline-none border border-transparent focus:border-emerald-500 transition-all tabular-nums text-center" />
                </div>
                <div className="md:col-span-2">
                   <input placeholder={t("pages.patientDetail.prescriptions.form.instPlaceholder")} value={it.specialInstructions} onChange={e => updateItem(idx, 'specialInstructions', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4 py-3 text-sm font-bold outline-none border border-transparent focus:border-emerald-500 transition-all" />
                </div>
                <div className="md:col-span-1 flex justify-center">
                   <button 
                     onClick={() => removeItem(idx)} 
                     disabled={items.length===1} 
                     className="h-10 w-10 flex items-center justify-center rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none"
                   >
                     <Trash2 size={18} />
                   </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 flex flex-col sm:flex-row justify-between items-center gap-6">
            <button 
              onClick={addItem} 
              className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-500 transition-all"
            >
              <PlusCircle size={18} />
              {t("pages.patientDetail.prescriptions.form.addMedicine")}
            </button>
            <button 
              disabled={busy} 
              onClick={handleSave} 
              className="group flex h-16 items-center gap-3 rounded-3xl bg-emerald-500 px-10 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-70"
            >
              {busy ? (
                <RefreshCw className="animate-spin" size={18} />
              ) : (
                <>
                  <Save size={18} className="group-hover:rotate-12 transition-transform" />
                  {t("pages.patientDetail.prescriptions.form.saveCta")}
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
