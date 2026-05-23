import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Edit3, 
  X, 
  Mail, 
  Phone, 
  Search,
  RefreshCw,
  Building2,
  Hash
} from "lucide-react";

import {
  type HmoProvider,
  createHmoProvider,
  fetchHmoProviders,
  updateHmoProvider,
} from "../../services/hmo";

const fieldClass =
  "h-14 w-full rounded-2xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-900 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10   ";

export function HmoProvidersPanel(): JSX.Element {
  const { t } = useTranslation();
  const [rows, setRows] = useState<HmoProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [qInput, setQInput] = useState("");

  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchHmoProviders();
      setRows(list);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.settings.hmo.loadFailed", { defaultValue: "Load Failed" }));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredRows = rows.filter(r => 
    [r.name, r.code].join(" ").toLowerCase().includes(qInput.toLowerCase())
  );

  function startEdit(p: HmoProvider): void {
    setEditingId(p.id);
    setEditName(p.name);
    setEditCode(p.code);
    setEditPhone(p.contactPhone ?? "");
    setEditEmail(p.contactEmail ?? "");
    setEditNotes(p.notes ?? "");
  }

  function cancelEdit(): void {
    setEditingId(null);
  }

  async function saveEdit(id: string): Promise<void> {
    setBusy(true);
    try {
      await updateHmoProvider(id, {
        name: editName.trim(),
        code: editCode.trim(),
        contactPhone: editPhone.trim() || null,
        contactEmail: editEmail.trim() || null,
        notes: editNotes.trim() || null,
      });
      toast.success(t("pages.settings.hmo.saved", { defaultValue: "Saved" }));
      cancelEdit();
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.settings.hmo.saveFailed", { defaultValue: "Save Failed" }));
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(p: HmoProvider): Promise<void> {
    setBusy(true);
    try {
      await updateHmoProvider(p.id, { isActive: !p.isActive });
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.settings.hmo.saveFailed", { defaultValue: "Save Failed" }));
    } finally {
      setBusy(false);
    }
  }

  async function onCreate(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!newName.trim() || !newCode.trim()) {
      toast.error(t("pages.settings.hmo.nameCodeRequired", { defaultValue: "Name Code Required" }));
      return;
    }
    setBusy(true);
    try {
      await createHmoProvider({
        name: newName.trim(),
        code: newCode.trim(),
        contactPhone: newPhone.trim() || undefined,
        contactEmail: newEmail.trim() || undefined,
        notes: newNotes.trim() || undefined,
      });
      toast.success(t("pages.settings.hmo.created", { defaultValue: "Created" }));
      setNewName("");
      setNewCode("");
      setNewPhone("");
      setNewEmail("");
      setNewNotes("");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("pages.settings.hmo.createFailed", { defaultValue: "Create Failed" }));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-10">
      {/* Search & Action Bar */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center justify-between">
         <div className="relative flex-1 group max-w-2xl">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input 
              type="text"
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              placeholder={t("pages.settings.hmo.searchPlaceholder", { defaultValue: "Search Placeholder" })}
              className="h-16 w-full rounded-[2rem] bg-white pl-16 pr-8 text-sm font-bold outline-none ring-1 ring-slate-100 shadow-xl shadow-slate-200/40 focus:ring-4 focus:ring-indigo-500/10 transition-all"
            />
         </div>

         <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-6 h-16 rounded-[2rem] bg-white ring-1 ring-slate-100">
               <div className={`h-2 w-2 rounded-full ${loading ? 'bg-indigo-500 animate-pulse' : 'bg-slate-200'}`} />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                 {loading ? "Syncing..." : "HMO Network Active"}
               </span>
            </div>
         </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-12">
         {/* Main List */}
         <div className="lg:col-span-8">
            <div className="rounded-[3.5rem] bg-white shadow-2xl shadow-slate-200/50 overflow-hidden ring-1 ring-slate-100">
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                     <thead>
                        <tr className="bg-slate-50/50">
                           <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t("pages.settings.hmo.colName", { defaultValue: "Col Name" })}</th>
                           <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t("pages.settings.hmo.colCode", { defaultValue: "Col Code" })}</th>
                           <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t("pages.settings.hmo.colStatus", { defaultValue: "Col Status" })}</th>
                           <th className="px-10 py-8"></th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        <AnimatePresence mode="popLayout">
                           {loading ? (
                              <tr><td colSpan={4} className="py-40 text-center"><RefreshCw className="animate-spin mx-auto text-slate-200" size={40} /></td></tr>
                           ) : filteredRows.map((p, idx) => (
                              <motion.tr 
                                 key={p.id}
                                 initial={{ opacity: 0, y: 10 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 transition={{ delay: idx * 0.02 }}
                                 className="group hover:bg-slate-50/50 transition-all"
                              >
                                 <td className="px-10 py-8">
                                    <div className="flex items-center gap-4">
                                       <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-xs transition-all ${ p.isActive ? "bg-indigo-100 text-indigo-600 " : "bg-slate-100 text-slate-400" }`}>
                                          <Building2 size={20} />
                                       </div>
                                       <div>
                                          <p className="text-base font-black text-slate-900 uppercase leading-none">{p.name}</p>
                                          <div className="flex items-center gap-3 mt-1.5 opacity-40">
                                             {p.contactPhone && <span className="text-[10px] font-bold flex items-center gap-1"><Phone size={10} /> {p.contactPhone}</span>}
                                             {p.contactEmail && <span className="text-[10px] font-bold flex items-center gap-1"><Mail size={10} /> {p.contactEmail}</span>}
                                          </div>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-8 py-8">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                                       <Hash size={10} /> {p.code}
                                    </div>
                                 </td>
                                 <td className="px-8 py-8">
                                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${ p.isActive ? "bg-teal-50 text-teal-600 border-teal-100 " : "bg-slate-50 text-slate-400 border-slate-100 " }`}>
                                       <div className={`h-1.5 w-1.5 rounded-full ${p.isActive ? "bg-teal-500 animate-pulse" : "bg-slate-300"}`} />
                                       {p.isActive ? t("pages.settings.active", { defaultValue: "Active" }) : t("pages.settings.inactive", { defaultValue: "Inactive" })}
                                    </div>
                                 </td>
                                 <td className="px-10 py-8">
                                    <div className="flex items-center justify-end gap-3">
                                       <button
                                          onClick={() => startEdit(p)}
                                          className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-indigo-500 hover:text-white transition-all"
                                       >
                                          <Edit3 size={16} />
                                       </button>
                                       <button
                                          onClick={() => void toggleActive(p)}
                                          className={`h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${ p.isActive ? "bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white" : "bg-teal-50 text-teal-600 hover:bg-teal-500 hover:text-white" }`}
                                       >
                                          {p.isActive ? t("pages.settings.hmo.suspend", { defaultValue: "Suspend" }) : t("pages.settings.hmo.activate", { defaultValue: "Activate" })}
                                       </button>
                                    </div>
                                 </td>
                              </motion.tr>
                           ))}
                        </AnimatePresence>
                     </tbody>
                  </table>
               </div>
            </div>
         </div>

         {/* Create Form */}
         <div className="lg:col-span-4">
            <div className="rounded-[3rem] bg-white p-8 shadow-2xl ring-1 ring-slate-100">
               <div className="flex items-center gap-4 mb-8">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                     <Plus size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t("pages.settings.hmo.addNew", { defaultValue: "Add New" })}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("pages.settings.hmo.networkExpansion", { defaultValue: "Network Expansion" })}</p>
                  </div>
               </div>

               <form onSubmit={(ev) => void onCreate(ev)} className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">{t("pages.settings.hmo.colName", { defaultValue: "Col Name" })}</label>
                     <input
                        required
                        className={fieldClass}
                        placeholder={t("pages.settings.hmo.placeholderProviderName", { defaultValue: "Placeholder Provider Name" })}
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                     />
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">{t("pages.settings.hmo.colCode", { defaultValue: "Col Code" })}</label>
                     <input
                        required
                        className={`${fieldClass} font-mono uppercase`}
                        placeholder="e.g. MX-001"
                        value={newCode}
                        onChange={(e) => setNewCode(e.target.value)}
                     />
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">{t("pages.settings.phone", { defaultValue: "Phone" })}</label>
                     <input
                        className={fieldClass}
                        placeholder="+63 ..."
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                     />
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">{t("pages.settings.hmo.emailPlaceholder", { defaultValue: "Email Placeholder" })}</label>
                     <input
                        className={fieldClass}
                        placeholder="support@hmo.com"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                     />
                  </div>

                  <button
                     type="submit"
                     disabled={busy}
                     className="w-full h-16 rounded-[1.5rem] bg-white text-white text-xs font-black uppercase tracking-widest shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-40"
                  >
                     {busy ? <RefreshCw className="animate-spin inline mr-2" size={16} /> : <Plus size={18} className="inline mr-2" />}
                     {t("pages.settings.hmo.create", { defaultValue: "Create" })}
                  </button>
               </form>
            </div>
         </div>
      </div>

      {/* Edit Modal / Glassmorphic Overlay */}
      <AnimatePresence>
         {editingId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-white/40 backdrop-blur-md">
               <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full max-w-2xl bg-white rounded-[3rem] p-10 shadow-2xl ring-1 ring-white/20"
               >
                  <div className="flex items-center justify-between mb-10">
                     <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-lg">
                           <Edit3 size={24} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{t("pages.settings.hmo.editProvider", { defaultValue: "Edit Provider" })}</h2>
                     </div>
                     <button onClick={cancelEdit} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={24} />
                     </button>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">{t("pages.settings.hmo.labelProviderName", { defaultValue: "Label Provider Name" })}</label>
                        <input className={fieldClass} value={editName} onChange={e => setEditName(e.target.value)} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">{t("pages.settings.hmo.labelNetworkCode", { defaultValue: "Label Network Code" })}</label>
                        <input className={`${fieldClass} font-mono uppercase`} value={editCode} onChange={e => setEditCode(e.target.value)} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Contact Phone</label>
                        <input className={fieldClass} value={editPhone} onChange={e => setEditPhone(e.target.value)} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">{t("pages.settings.labelEmailIdentity", { defaultValue: "Label Email Identity" })}</label>
                        <input className={fieldClass} value={editEmail} onChange={e => setEditEmail(e.target.value)} />
                     </div>
                     <div className="sm:col-span-2 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">{t("pages.settings.hmo.labelOperationalNotes", { defaultValue: "Label Operational Notes" })}</label>
                        <textarea 
                           className="w-full rounded-2xl border border-slate-200 bg-white p-6 text-sm font-bold text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 min-h-[120px]" 
                           value={editNotes} 
                           onChange={e => setEditNotes(e.target.value)} 
                        />
                     </div>
                  </div>

                  <div className="mt-10 flex justify-end gap-4">
                     <button onClick={cancelEdit} className="h-16 px-10 rounded-[1.5rem] bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                        {t("common.cancel", { defaultValue: "Cancel" })}
                     </button>
                     <button 
                        onClick={() => void saveEdit(editingId)}
                        disabled={busy}
                        className="h-16 px-12 rounded-[1.5rem] bg-indigo-600 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all"
                     >
                        {busy ? <RefreshCw className="animate-spin" size={18} /> : t("common.save", { defaultValue: "Save" })}
                     </button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </section>
  );
}

