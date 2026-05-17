import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Plus, Edit2, Check, X, ShieldAlert } from "lucide-react";
import { fetchHmoProviders, createHmoProvider, updateHmoProvider, type HmoProvider } from "../services/hmo";

const NS = "pages.hmoProvidersPage";

export function HmoProvidersPage(): JSX.Element {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    contactPhone: "",
    contactEmail: "",
    notes: "",
    isActive: true,
  });

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ["hmoProviders"],
    queryFn: fetchHmoProviders,
  });

  const createMutation = useMutation({
    mutationFn: createHmoProvider,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hmoProviders"] });
      toast.success(t(`${NS}.created`));
      setIsAdding(false);
      resetForm();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { id: string; payload: Partial<HmoProvider> }) => updateHmoProvider(vars.id, vars.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hmoProviders"] });
      toast.success(t(`${NS}.updated`));
      setEditingId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resetForm = () => {
    setFormData({ name: "", code: "", contactPhone: "", contactEmail: "", notes: "", isActive: true });
  };

  const handleSaveAdd = () => {
    if (!formData.name || !formData.code) {
      toast.error(t(`${NS}.nameCodeRequired`));
      return;
    }
    createMutation.mutate(formData);
  };

  const handleSaveEdit = (id: string) => {
    if (!formData.name || !formData.code) {
      toast.error(t(`${NS}.nameCodeRequired`));
      return;
    }
    updateMutation.mutate({ id, payload: formData });
  };

  const startEdit = (p: HmoProvider) => {
    setEditingId(p.id);
    setIsAdding(false);
    setFormData({
      name: p.name,
      code: p.code,
      contactPhone: p.contactPhone || "",
      contactEmail: p.contactEmail || "",
      notes: p.notes || "",
      isActive: p.isActive,
    });
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-8 px-4 pb-24 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {t(`${NS}.title`)}
              </h1>
              <p className="text-sm text-slate-500">{t(`${NS}.subtitle`)}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
            resetForm();
          }}
          className="inline-flex h-12 items-center gap-2 rounded-2xl bg-indigo-600 px-6 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-500/20 transition-all hover:bg-indigo-700 active:scale-95"
        >
          <Plus size={18} /> {t(`${NS}.addProvider`)}
        </button>
      </header>

      <div className="rounded-[2.5rem] border border-slate-100 bg-white shadow-2xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none p-6 overflow-x-auto">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="py-3 px-4 text-xs font-black uppercase tracking-widest text-slate-400">{t(`${NS}.colProvider`)}</th>
                <th className="py-3 px-4 text-xs font-black uppercase tracking-widest text-slate-400">{t(`${NS}.colCode`)}</th>
                <th className="py-3 px-4 text-xs font-black uppercase tracking-widest text-slate-400">{t(`${NS}.colContact`)}</th>
                <th className="py-3 px-4 text-xs font-black uppercase tracking-widest text-slate-400">{t(`${NS}.colStatus`)}</th>
                <th className="py-3 px-4 text-right text-xs font-black uppercase tracking-widest text-slate-400">{t(`${NS}.colActions`)}</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {isAdding && (
                  <motion.tr
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="border-b border-indigo-100 bg-indigo-50/50 dark:border-indigo-900/30 dark:bg-indigo-900/10"
                  >
                    <td className="py-3 px-4">
                      <input
                        placeholder={t(`${NS}.placeholderName`)}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                        autoFocus
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        placeholder={t(`${NS}.placeholderCode`)}
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        className="w-24 rounded-lg border border-slate-200 p-2 text-sm uppercase dark:border-slate-700 dark:bg-slate-800"
                      />
                    </td>
                    <td className="py-3 px-4 space-y-2">
                      <input
                        placeholder={t(`${NS}.placeholderPhone`)}
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                      />
                      <input
                        placeholder={t(`${NS}.placeholderEmail`)}
                        value={formData.contactEmail}
                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                        />
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{t(`${NS}.active`)}</span>
                      </label>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={handleSaveAdd}
                          disabled={createMutation.isPending}
                          className="rounded-lg bg-indigo-600 p-2 text-white hover:bg-indigo-700"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => setIsAdding(false)}
                          className="rounded-lg bg-slate-200 p-2 text-slate-600 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-400"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )}
                {providers.map((p) => {
                  if (editingId === p.id) {
                    return (
                      <motion.tr
                        key={p.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-indigo-100 bg-indigo-50/50 dark:border-indigo-900/30 dark:bg-indigo-900/10"
                      >
                        <td className="py-3 px-4">
                          <input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            className="w-24 rounded-lg border border-slate-200 p-2 text-sm uppercase dark:border-slate-700 dark:bg-slate-800"
                          />
                        </td>
                        <td className="py-3 px-4 space-y-2">
                          <input
                            placeholder={t(`${NS}.placeholderPhone`)}
                            value={formData.contactPhone}
                            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                            className="w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                          />
                          <input
                            placeholder={t(`${NS}.placeholderEmail`)}
                            value={formData.contactEmail}
                            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                            className="w-full rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.isActive}
                              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                            />
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{t(`${NS}.active`)}</span>
                          </label>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleSaveEdit(p.id)}
                              disabled={updateMutation.isPending}
                              className="rounded-lg bg-indigo-600 p-2 text-white hover:bg-indigo-700"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="rounded-lg bg-slate-200 p-2 text-slate-600 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-400"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  }

                  return (
                    <motion.tr key={p.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                      <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                        {p.name}
                        {p.notes && <p className="mt-1 text-xs font-normal text-slate-500">{p.notes}</p>}
                      </td>
                      <td className="py-4 px-4">
                        <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-mono font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {p.code}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-600 dark:text-slate-400">
                        {p.contactPhone && <div>{p.contactPhone}</div>}
                        {p.contactEmail && <div>{p.contactEmail}</div>}
                        {!p.contactPhone && !p.contactEmail && (
                          <span className="italic opacity-50">{t(`${NS}.noContact`)}</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {p.isActive ? (
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                            {t(`${NS}.statusActive`)}
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            {t(`${NS}.statusInactive`)}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => startEdit(p)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                        >
                          <Edit2 size={16} />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        )}
        {!isLoading && providers.length === 0 && !isAdding && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <ShieldAlert size={48} className="mb-4 opacity-20" />
            <p className="text-sm font-bold">{t(`${NS}.empty`)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
