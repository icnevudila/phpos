import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Plus,
  History,
  Thermometer,
  Activity,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getSterilizationLogs, createSterilizationLog } from "../services/sterilization";
import { getStaffMembers, type StaffUserDto } from "../services/staff";
import type { SterilizationLog } from "../services/sterilization";

const C = "pages.compliance";

function useLogDateFmt() {
  const { i18n } = useTranslation();
  const locale = i18n.language?.startsWith("tr") ? "tr-PH" : "en-PH";
  return {
    date: (iso: string) =>
      new Intl.DateTimeFormat(locale, { month: "short", day: "2-digit", year: "numeric" }).format(new Date(iso)),
    time: (iso: string) =>
      new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(new Date(iso)),
  };
}

export function CompliancePage() {
  const { t } = useTranslation();
  const fmt = useLogDateFmt();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: logs, isLoading } = useQuery({
    queryKey: ["sterilizationLogs"],
    queryFn: getSterilizationLogs,
  });

  const { data: staff } = useQuery({
    queryKey: ["staff"],
    queryFn: getStaffMembers,
  });

  const mutation = useMutation({
    mutationFn: createSterilizationLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sterilizationLogs"] });
      setIsModalOpen(false);
      toast.success(t(`${C}.saved`));
    },
    onError: () => toast.error(t(`${C}.saveFailed`)),
  });

  const [formData, setFormData] = useState({
    autoclaveName: "",
    cycleNumber: 1,
    temperature: 134,
    pressure: 2.1,
    durationMinutes: 30,
    operatorId: "",
    status: "SUCCESS",
    biologicalIndicator: true,
    notes: "",
    startedAt: new Date().toISOString(),
  });

  const openModal = () => {
    setFormData((prev) => ({
      ...prev,
      autoclaveName: prev.autoclaveName || t(`${C}.defaultAutoclave`),
    }));
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const passRate =
    logs && logs.length > 0
      ? Math.round((logs.filter((l) => l.status === "SUCCESS").length / logs.length) * 1000) / 10
      : 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 max-w-7xl mx-auto"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <ShieldCheck className="w-10 h-10 text-emerald-500" />
            {t(`${C}.title`)}
          </h1>
          <p className="text-slate-500 mt-1">{t(`${C}.subtitle`)}</p>
        </div>
        <button
          type="button"
          onClick={openModal}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-200"
        >
          <Plus className="w-5 h-5" />
          {t(`${C}.logCycle`)}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-4">
            <motion.div className="p-3 bg-emerald-50 rounded-2xl">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </motion.div>
            <div>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">{t(`${C}.passRate`)}</p>
              <h3 className="text-2xl font-black text-slate-900">{passRate}%</h3>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full" style={{ width: `${passRate}%` }} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 rounded-2xl">
              <History className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">{t(`${C}.cyclesThisMonth`)}</p>
              <h3 className="text-2xl font-black text-slate-900">{logs?.length ?? 0}</h3>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-amber-50 rounded-2xl">
              <Activity className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">{t(`${C}.nextBiTest`)}</p>
              <h3 className="text-2xl font-black text-slate-900">{t(`${C}.nextBiIn`, { days: 2 })}</h3>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-slate-400" />
            {t(`${C}.historyTitle`)}
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={t(`${C}.filterPlaceholder`)}
              className="bg-slate-50 border-0 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t(`${C}.colDateTime`)}</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t(`${C}.colAutoclave`)}</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t(`${C}.colParameters`)}</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t(`${C}.colOperator`)}</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t(`${C}.colBi`)}</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">{t(`${C}.colStatus`)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center text-slate-400">
                    {t(`${C}.loading`)}
                  </td>
                </tr>
              ) : logs?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center text-slate-400">
                    {t(`${C}.empty`)}
                  </td>
                </tr>
              ) : (
                logs?.map((log: SterilizationLog) => (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={log.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="text-sm font-bold text-slate-900">{fmt.date(log.startedAt)}</div>
                      <div className="text-xs text-slate-400">{fmt.time(log.startedAt)}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-bold text-slate-900">{log.autoclaveName}</div>
                      <div className="text-xs text-slate-400"># {log.cycleNumber}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-xs font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-lg">
                          <Thermometer className="w-3 h-3" /> {log.temperature}°C
                        </span>
                        <span className="flex items-center gap-1 text-xs font-bold bg-purple-50 text-purple-600 px-2 py-1 rounded-lg">
                          <Activity className="w-3 h-3" /> {log.pressure} bar
                        </span>
                        <span className="flex items-center gap-1 text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">
                          <Clock className="w-3 h-3" /> {log.durationMinutes}m
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                          <User className="w-3 h-3 text-slate-500" />
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                          {log.operator.firstName} {log.operator.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      {log.biologicalIndicator ? (
                        <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                          {t(`${C}.biPass`)}
                        </span>
                      ) : (
                        <span className="text-xs font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                          {t(`${C}.biNa`)}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        {log.status === "SUCCESS" && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                        {log.status === "FAILED" && <AlertTriangle className="w-6 h-6 text-rose-500" />}
                        {log.status === "ABORTED" && <XCircle className="w-6 h-6 text-slate-400" />}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-2xl font-black text-slate-900">{t(`${C}.modalTitle`)}</h2>
                <p className="text-slate-500">{t(`${C}.modalSubtitle`)}</p>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t(`${C}.formAutoclave`)}</label>
                    <input
                      required
                      value={formData.autoclaveName}
                      onChange={(e) => setFormData({ ...formData, autoclaveName: e.target.value })}
                      className="w-full bg-slate-50 border-0 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t(`${C}.formCycle`)}</label>
                    <input
                      type="number"
                      required
                      value={formData.cycleNumber}
                      onChange={(e) => setFormData({ ...formData, cycleNumber: Number(e.target.value) })}
                      className="w-full bg-slate-50 border-0 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <motion.div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t(`${C}.formTemp`)}</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={formData.temperature}
                      onChange={(e) => setFormData({ ...formData, temperature: Number(e.target.value) })}
                      className="w-full bg-slate-50 border-0 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t(`${C}.formPressure`)}</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.pressure}
                      onChange={(e) => setFormData({ ...formData, pressure: Number(e.target.value) })}
                      className="w-full bg-slate-50 border-0 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t(`${C}.formTime`)}</label>
                    <input
                      type="number"
                      required
                      value={formData.durationMinutes}
                      onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                      className="w-full bg-slate-50 border-0 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </motion.div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t(`${C}.formOperator`)}</label>
                  <select
                    required
                    value={formData.operatorId}
                    onChange={(e) => setFormData({ ...formData, operatorId: e.target.value })}
                    className="w-full bg-slate-50 border-0 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">{t(`${C}.selectOperator`)}</option>
                    {staff?.map((s: StaffUserDto) => (
                      <option key={s.id} value={s.id}>
                        {s.firstName} {s.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                  <input
                    type="checkbox"
                    checked={formData.biologicalIndicator}
                    onChange={(e) => setFormData({ ...formData, biologicalIndicator: e.target.checked })}
                    className="w-5 h-5 rounded-lg border-0 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-bold text-slate-700">{t(`${C}.biPassCheckbox`)}</span>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    {t(`${C}.cancel`)}
                  </button>
                  <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-200"
                  >
                    {mutation.isPending ? t(`${C}.saving`) : t(`${C}.saveRecord`)}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
