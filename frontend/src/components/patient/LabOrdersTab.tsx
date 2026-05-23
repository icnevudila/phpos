import { useState, type ReactNode } from "react";
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
import { listLabOrders, createLabOrder, updateLabOrder } from "../../services/labOrder";

export function LabOrdersTab({ patientId, canWrite }: { patientId: string; canWrite: boolean }) {
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
      toast.success("Lab order status updated.");
    },
    onError: () => toast.error("Failed to update status."),
  });

  if (isLoading) {
    return (
      <div className="card p-8 flex flex-col items-center justify-center text-center bg-brand-surface border border-brand-border">
        <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest animate-pulse">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-brand-text uppercase tracking-widest">
            Laboratory Orders
          </h3>
          <p className="text-xs text-brand-muted">Track external lab cases, prosthetics, and appliances.</p>
        </div>
        {canWrite && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="btn-primary flex items-center gap-2 h-8 px-3 text-xs"
          >
            <Plus size={14} /> New Case
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
        <div className="card p-8 flex flex-col items-center justify-center text-center bg-brand-surface-soft border border-brand-border">
          <p className="text-sm font-bold text-brand-muted uppercase tracking-widest">No Lab Orders Found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <LabOrderCard
              key={order.id}
              order={order}
              onStatusUpdate={(status) => updateStatusMutation.mutate({ id: order.id, status })}
            />
          ))}
        </div>
      )}
    </div>
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
  const statusStyles: Record<string, string> = {
    ORDERED: "bg-brand-surface text-brand-muted border-brand-border",
    SENT_TO_LAB: "bg-amber-50 text-amber-700 border-amber-200",
    RECEIVED: "bg-sky-50 text-sky-700 border-sky-200",
    COMPLETED: "bg-teal-50 text-teal-800 border-teal-200",
    CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
  };
  
  const statusLabel = order.status.replace(/_/g, " ");
  const orderDateStr = new Date(order.orderDate).toLocaleDateString();

  return (
    <div className="card border border-brand-border bg-white flex flex-col lg:flex-row overflow-hidden hover:bg-brand-surface-soft transition-colors">
      <div className="flex-1 p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <span
              className={`inline-flex px-2 py-0.5 rounded-[var(--radius-sm)] border text-[10px] font-black uppercase tracking-widest ${statusStyles[order.status] ?? statusStyles.ORDERED}`}
            >
              {statusLabel}
            </span>
            <h4 className="text-base font-bold text-brand-text">
              {order.itemDescription}
            </h4>
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-brand-muted">
              <span className="flex items-center gap-1.5">
                <User size={12} /> Dr. {order.dentist.firstName} {order.dentist.lastName}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={12} /> Ordered: {orderDateStr}
              </span>
            </div>
          </div>

          {order.dueDate && (
            <div className="text-right bg-brand-surface-soft border border-brand-border px-3 py-1.5 rounded-[var(--radius-sm)]">
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-0.5">
                Target Delivery
              </p>
              <p className="text-xs font-bold text-brand-text">
                {new Date(order.dueDate).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {order.labName && <MetaTag label="Lab" value={order.labName} icon={<FlaskConical size={12} />} />}
          {order.shade && <MetaTag label="Shade" value={order.shade} />}
          {order.mould && <MetaTag label="Mould" value={order.mould} />}
        </div>

        {order.notes && (
          <div className="p-3 bg-brand-surface-soft border border-brand-border/50 rounded-[var(--radius-sm)] text-xs text-brand-text font-medium leading-relaxed">
            "{order.notes}"
          </div>
        )}
      </div>

      <div className="lg:w-48 flex lg:flex-col gap-1 p-3 border-t lg:border-t-0 lg:border-l border-brand-border bg-brand-surface-soft">
        <StatusButton
          active={order.status === "SENT_TO_LAB"}
          onClick={() => onStatusUpdate("SENT_TO_LAB")}
          icon={<Truck size={14} />}
          label="Sent to Lab"
        />
        <StatusButton
          active={order.status === "RECEIVED"}
          onClick={() => onStatusUpdate("RECEIVED")}
          icon={<Clock size={14} />}
          label="Received"
        />
        <StatusButton
          active={order.status === "COMPLETED"}
          onClick={() => onStatusUpdate("COMPLETED")}
          icon={<CheckCircle2 size={14} />}
          label="Completed"
          tone="emerald"
        />
        <StatusButton
          active={order.status === "CANCELLED"}
          onClick={() => onStatusUpdate("CANCELLED")}
          icon={<XCircle size={14} />}
          label="Cancelled"
          tone="rose"
        />
      </div>
    </div>
  );
}

function MetaTag({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-[var(--radius-sm)] bg-brand-surface border border-brand-border">
      {icon && <span className="text-brand-muted">{icon}</span>}
      <span className="text-[10px] font-black uppercase text-brand-muted">{label}:</span>
      <span className="text-[10px] font-bold text-brand-text uppercase tracking-widest">{value}</span>
    </div>
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
    indigo: "bg-white text-brand-muted hover:bg-brand-surface hover:text-brand-text border-transparent",
    emerald: "bg-white text-brand-muted hover:bg-teal-50 hover:text-teal-700 border-transparent",
    rose: "bg-white text-brand-muted hover:bg-rose-50 hover:text-rose-700 border-transparent",
  };
  const actives: Record<string, string> = {
    indigo: "bg-white text-brand-primary border-brand-primary shadow-sm",
    emerald: "bg-teal-500 text-white border-teal-600 shadow-sm",
    rose: "bg-rose-500 text-white border-rose-600 shadow-sm",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-9 w-full items-center gap-2 px-3 rounded-[var(--radius-sm)] border text-[10px] font-black uppercase tracking-widest transition-all ${active ? actives[tone] : tones[tone]}`}
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
    if (!formData.itemDescription) return toast.error("Item description is required.");

    setBusy(true);
    try {
      await createLabOrder({
        patientId,
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      });
      toast.success("Lab order created.");
      onSuccess();
    } catch {
      toast.error("Failed to create lab order.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="card p-5 bg-brand-surface-soft border border-brand-border space-y-4 mb-6"
    >
      <div className="flex items-center gap-2 mb-2">
         <FlaskConical className="text-brand-primary" size={16} />
         <h4 className="text-xs font-black uppercase tracking-widest text-brand-text">New Lab Case</h4>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted ml-1">
            Item Description
          </label>
          <input
            value={formData.itemDescription}
            onChange={(e) => setFormData({ ...formData, itemDescription: e.target.value })}
            placeholder="e.g. PFM Crown #14"
            className="h-9 w-full rounded-[var(--radius-sm)] bg-white px-3 text-xs font-medium text-brand-text outline-none border border-brand-border focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted ml-1">
            Laboratory Name
          </label>
          <input
            value={formData.labName}
            onChange={(e) => setFormData({ ...formData, labName: e.target.value })}
            placeholder="e.g. Apex Dental Lab"
            className="h-9 w-full rounded-[var(--radius-sm)] bg-white px-3 text-xs font-medium text-brand-text outline-none border border-brand-border focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted ml-1">
              Shade
            </label>
            <input
              value={formData.shade}
              onChange={(e) => setFormData({ ...formData, shade: e.target.value })}
              placeholder="e.g. A2"
              className="h-9 w-full rounded-[var(--radius-sm)] bg-white px-3 text-xs font-medium text-brand-text outline-none border border-brand-border focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted ml-1">
              Mould
            </label>
            <input
              value={formData.mould}
              onChange={(e) => setFormData({ ...formData, mould: e.target.value })}
              placeholder="e.g. Ovoid"
              className="h-9 w-full rounded-[var(--radius-sm)] bg-white px-3 text-xs font-medium text-brand-text outline-none border border-brand-border focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted ml-1">
            Due Date
          </label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            className="h-9 w-full rounded-[var(--radius-sm)] bg-white px-3 text-xs font-medium text-brand-text outline-none border border-brand-border focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted ml-1">
          Clinical Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full h-20 rounded-[var(--radius-sm)] bg-white p-3 text-xs font-medium text-brand-text outline-none border border-brand-border focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all resize-none"
        />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary h-9 px-4 text-xs"
        >
          Cancel
        </button>
        <button
          disabled={busy}
          type="submit"
          className="btn-primary h-9 px-6 text-xs disabled:opacity-50"
        >
          {busy ? "Saving..." : "Create Case"}
        </button>
      </div>
    </form>
  );
}
