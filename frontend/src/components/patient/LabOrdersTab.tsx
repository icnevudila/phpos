import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FlaskConical,
  Plus,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  Truck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ListEmptyState } from "../ListEmptyState";
import { listLabOrders, createLabOrder, updateLabOrder } from "../../services/labOrder";

const LAB_NS = "pages.patientDetail.labOrders";

const STATUS_I18N: Record<string, string> = {
  ORDERED: `${LAB_NS}.statusOrdered`,
  SENT_TO_LAB: `${LAB_NS}.statusSentToLab`,
  RECEIVED: `${LAB_NS}.statusReceivedFull`,
  COMPLETED: `${LAB_NS}.statusCompleted`,
  CANCELLED: `${LAB_NS}.statusCancelled`,
};

export function LabOrdersTab({ patientId, canWrite }: { patientId: string; canWrite: boolean }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["labOrders", patientId],
    queryFn: () => listLabOrders(patientId),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateLabOrder(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labOrders", patientId] });
      toast.success(t(`${LAB_NS}.statusUpdated`));
    },
    onError: () => toast.error(t(`${LAB_NS}.statusUpdateFailed`)),
  });

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="py-20 text-center text-slate-400 font-black uppercase tracking-widest animate-pulse"
      >
        {t(`${LAB_NS}.loading`)}
      </motion.div>
    );
  }

  return (
    <motion.div className="space-y-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-1">
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
            {t(`${LAB_NS}.title`)}
          </h3>
          <p className="text-xs font-bold text-slate-400">{t(`${LAB_NS}.subtitle`)}</p>
        </motion.div>
        {canWrite && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="flex h-12 items-center gap-2 rounded-2xl bg-indigo-600 px-6 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={18} /> {t(`${LAB_NS}.newCase`)}
          </button>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <AddLabOrderForm
              patientId={patientId}
              onClose={() => setIsAdding(false)}
              onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ["labOrders", patientId] });
                setIsAdding(false);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {orders.length === 0 ? (
        <div className="rounded-[3rem] border-2 border-dashed border-slate-200 bg-white/50">
          <ListEmptyState
            icon="box"
            title={t(`${LAB_NS}.empty`)}
            description={t(`${LAB_NS}.emptyHint`)}
            primary={
              canWrite
                ? { kind: "button", onClick: () => setIsAdding(true), label: t(`${LAB_NS}.newCase`) }
                : undefined
            }
          />
        </div>
      ) : (
        <motion.div className="grid gap-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {orders.map((order) => (
            <LabOrderCard
              key={order.id}
              order={order}
              onStatusUpdate={(status) => updateStatusMutation.mutate({ id: order.id, status })}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

function LabOrderCard({
  order,
  onStatusUpdate,
}: {
  order: {
    id: string;
    status: string;
    itemDescription: string;
    orderDate: string;
    dueDate?: string | null;
    labName?: string | null;
    shade?: string | null;
    mould?: string | null;
    notes?: string | null;
    dentist: { firstName: string; lastName: string };
  };
  onStatusUpdate: (s: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const statusStyles: Record<string, string> = {
    ORDERED: "bg-slate-100 text-slate-600 border-slate-200",
    SENT_TO_LAB: "bg-amber-100 text-amber-600 border-amber-200",
    RECEIVED: "bg-sky-100 text-sky-600 border-sky-200",
    COMPLETED: "bg-teal-100 text-teal-600 border-teal-200",
    CANCELLED: "bg-rose-100 text-rose-600 border-rose-200",
  };
  const statusKey = STATUS_I18N[order.status];
  const statusLabel = statusKey ? t(statusKey) : order.status.replace(/_/g, " ");
  const locale = i18n.language?.startsWith("tr") ? "tr-PH" : "en-PH";
  const orderDateStr = new Date(order.orderDate).toLocaleDateString(locale);

  return (
    <div className="group relative flex flex-col md:flex-row gap-8 rounded-[2.5rem] bg-white p-8 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 transition-all hover:shadow-2xl">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 space-y-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
          <div className="space-y-1">
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusStyles[order.status] ?? statusStyles.ORDERED}`}
            >
              {statusLabel}
            </span>
            <h4 className="text-2xl font-black text-slate-900 tracking-tight pt-2">
              {order.itemDescription}
            </h4>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span className="flex items-center gap-1">
                <User size={12} /> {order.dentist.firstName} {order.dentist.lastName}
              </span>
              <span className="h-1 w-1 rounded-full bg-slate-200" />
              <span className="flex items-center gap-1">
                <Clock size={12} /> {t(`${LAB_NS}.orderedOn`, { date: orderDateStr })}
              </span>
            </div>
          </div>

          {order.dueDate && (
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {t(`${LAB_NS}.targetDelivery`)}
              </p>
              <p className="text-sm font-black text-indigo-600">
                {new Date(order.dueDate).toLocaleDateString(locale)}
              </p>
            </div>
          )}
        </motion.div>

        <div className="flex flex-wrap gap-3">
          {order.labName && <MetaTag label={t(`${LAB_NS}.metaLab`)} value={order.labName} icon={<FlaskConical size={12} />} />}
          {order.shade && <MetaTag label={t(`${LAB_NS}.metaShade`)} value={order.shade} />}
          {order.mould && <MetaTag label={t(`${LAB_NS}.metaMould`)} value={order.mould} />}
        </div>

        {order.notes && (
          <div className="p-4 bg-slate-50 rounded-2xl text-xs font-medium text-slate-500 italic">
            &ldquo;{order.notes}&rdquo;
          </div>
        )}
      </motion.div>

      <div className="md:w-48 flex md:flex-col justify-center gap-2 border-t md:border-t-0 md:border-l border-slate-50 pt-6 md:pt-0 md:pl-8">
        <StatusButton
          active={order.status === "SENT_TO_LAB"}
          onClick={() => onStatusUpdate("SENT_TO_LAB")}
          icon={<Truck size={14} />}
          label={t(`${LAB_NS}.statusSent`)}
        />
        <StatusButton
          active={order.status === "RECEIVED"}
          onClick={() => onStatusUpdate("RECEIVED")}
          icon={<Clock size={14} />}
          label={t(`${LAB_NS}.statusReceived`)}
        />
        <StatusButton
          active={order.status === "COMPLETED"}
          onClick={() => onStatusUpdate("COMPLETED")}
          icon={<CheckCircle2 size={14} />}
          label={t(`${LAB_NS}.statusDone`)}
          tone="emerald"
        />
        <StatusButton
          active={order.status === "CANCELLED"}
          onClick={() => onStatusUpdate("CANCELLED")}
          icon={<XCircle size={14} />}
          label={t(`${LAB_NS}.statusVoid`)}
          tone="rose"
        />
      </div>
    </div>
  );
}

function MetaTag({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 ring-1 ring-slate-100"
    >
      {icon && <span className="text-slate-400">{icon}</span>}
      <span className="text-[10px] font-black uppercase text-slate-400">{label}:</span>
      <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{value}</span>
    </motion.div>
  );
}

function StatusButton({
  active,
  onClick,
  icon,
  label,
  tone = "indigo",
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
  tone?: "indigo" | "emerald" | "rose";
}) {
  const tones: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white",
    emerald: "bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white",
    rose: "bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white",
  };
  const actives: Record<string, string> = {
    indigo: "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20",
    emerald: "bg-teal-600 text-white shadow-lg shadow-teal-600/20",
    rose: "bg-rose-600 text-white shadow-lg shadow-rose-600/20",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-10 w-full items-center gap-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? actives[tone] : tones[tone]}`}
    >
      {icon} {label}
    </button>
  );
}

function AddLabOrderForm({
  patientId,
  onClose,
  onSuccess,
}: {
  patientId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    itemDescription: "",
    labName: "",
    shade: "",
    mould: "",
    dueDate: "",
    notes: "",
  });
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.itemDescription) return toast.error(t(`${LAB_NS}.itemRequired`));

    setBusy(true);
    try {
      await createLabOrder({
        patientId,
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      });
      toast.success(t(`${LAB_NS}.created`));
      onSuccess();
    } catch {
      toast.error(t(`${LAB_NS}.createFailed`));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-8 rounded-[2.5rem] bg-slate-50 ring-1 ring-slate-200 mb-10 space-y-6"
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
            {t(`${LAB_NS}.formItem`)}
          </label>
          <input
            value={formData.itemDescription}
            onChange={(e) => setFormData({ ...formData, itemDescription: e.target.value })}
            placeholder={t(`${LAB_NS}.formItemPlaceholder`)}
            className="h-12 w-full rounded-xl bg-white px-4 text-sm font-bold outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
            {t(`${LAB_NS}.formLab`)}
          </label>
          <input
            value={formData.labName}
            onChange={(e) => setFormData({ ...formData, labName: e.target.value })}
            placeholder={t(`${LAB_NS}.formLabPlaceholder`)}
            className="h-12 w-full rounded-xl bg-white px-4 text-sm font-bold outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </motion.div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
              {t(`${LAB_NS}.formShade`)}
            </label>
            <input
              value={formData.shade}
              onChange={(e) => setFormData({ ...formData, shade: e.target.value })}
              placeholder={t(`${LAB_NS}.formShadePlaceholder`)}
              className="h-12 w-full rounded-xl bg-white px-4 text-sm font-bold outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
              {t(`${LAB_NS}.formMould`)}
            </label>
            <input
              value={formData.mould}
              onChange={(e) => setFormData({ ...formData, mould: e.target.value })}
              placeholder={t(`${LAB_NS}.formMouldPlaceholder`)}
              className="h-12 w-full rounded-xl bg-white px-4 text-sm font-bold outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
            {t(`${LAB_NS}.formDue`)}
          </label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            className="h-12 w-full rounded-xl bg-white px-4 text-sm font-bold outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>
      <motion.div className="space-y-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
          {t(`${LAB_NS}.formNotes`)}
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full h-24 rounded-xl bg-white p-4 text-sm font-bold outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
        />
      </motion.div>
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-6 h-12 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
        >
          {t(`${LAB_NS}.cancel`)}
        </button>
        <button
          disabled={busy}
          type="submit"
          className="px-10 h-12 rounded-xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          {busy ? t(`${LAB_NS}.saving`) : t(`${LAB_NS}.createCase`)}
        </button>
      </div>
    </form>
  );
}
