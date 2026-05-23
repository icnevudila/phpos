import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users as IconUsers, 
  Clock as IconClock, 
  ArrowRight as IconArrowRight, 
  MoreHorizontal as IconDots,
  Stethoscope as IconStethoscope,
  AlertCircle as IconAlert,
  Clipboard as IconNote,
  MapPin as IconRoom,
  Calendar as IconCalendar,
  Activity,
  ChevronRight,
  Zap,
  TrendingUp,
  ShieldCheck,
  RefreshCw
} from "lucide-react";

import api from "../services/api";

interface QueueItem {
  id: string;
  patientName: string;
  avatar?: string;
  type: "WAITLIST" | "APPOINTMENT";
  status: "WAITING" | "PREPARING" | "IN_PROGRESS";
  appointmentTime?: string;
  arrivalTime: string;
  waitTime: number; // minutes
  dentistName: string;
  procedure: string;
  room: string;
  priority: "NORMAL" | "URGENT";
  notes?: string;
}

export function QueuePage() {
  const { t } = useTranslation();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueueData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await api.get<any, { data: QueueItem[] }>("/analytics/queue");
      setQueue(res.data);
    } catch (err: any) {
      console.error("Queue fetch error:", err);
      toast.error(err.response?.data?.message || t("pages.queue.syncFailed", { defaultValue: "Sync Failed" }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchQueueData();
    const interval = setInterval(() => void fetchQueueData(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const refreshQueue = () => {
    void fetchQueueData();
    toast.success(t("pages.queue.synced", { defaultValue: "Synced" }));
  };

  return (
    <div className="page-wrapper">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <span className="relative flex h-2.5 w-2.5">
                 <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-primary opacity-75" />
                 <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-primary" />
               </span>
               <span className="text-xs font-semibold uppercase tracking-widest text-brand-primary">
                  {t("pages.queue.liveFlow", { defaultValue: "Live Flow" })}
               </span>
            </div>
            <h1 className="page-header-title">{t("pages.queue.title", { defaultValue: "Title" })}</h1>
            <p className="page-header-sub">{t("pages.queue.subtitle", { defaultValue: "Subtitle" })}</p>
          </div>

          <div className="flex items-center gap-3">
             <div className="card flex items-center gap-4 p-4">
                <div>
                   <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                     {t("pages.queue.waitingCount", { defaultValue: "Waiting Count" })}
                   </p>
                   <p className="text-2xl font-bold text-slate-800 mt-0.5 tabular-nums">{queue.length}</p>
                </div>
                 <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-brand-primary-soft text-brand-primary">
                   <IconUsers size={22} />
                 </div>
             </div>
             <button
               type="button"
               onClick={refreshQueue}
               aria-label={t("pages.queue.refreshQueueAria", { defaultValue: "Refresh Queue Aria" })}
               className="btn-primary h-14 w-14 flex items-center justify-center"
             >
               <IconClock className={loading ? "animate-spin" : ""} size={22} />
             </button>
          </div>
        </div>

        {/* Queue Grid Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          
          {/* Main Waiting List */}
          <div className="lg:col-span-8 space-y-4">
             <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  {t("pages.queue.waitingArea", { defaultValue: "Waiting Area" })}
                </h2>
                <div className="flex gap-5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                   <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-teal-500" /> {t("pages.queue.typeAppt", { defaultValue: "Type Appt" })}
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-amber-500" /> {t("pages.queue.typeWait", { defaultValue: "Type Wait" })}
                   </div>
                </div>
             </div>

             <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                   {queue.length === 0 && !loading && (
                     <motion.div 
                       initial={{ opacity: 0, scale: 0.95 }}
                       animate={{ opacity: 1, scale: 1 }}
                       className="flex flex-col items-center justify-center py-16 text-center card"
                     >
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-brand-surface-muted text-brand-muted">
                          <IconUsers className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium text-slate-500">{t("pages.queue.empty", { defaultValue: "Empty" })}</p>
                     </motion.div>
                   )}
                   {loading && queue.length === 0 && (
                     <div className="flex items-center justify-center py-20">
                       <div className="h-8 w-8 rounded-[var(--radius-md)] bg-brand-primary-soft flex items-center justify-center">
                         <RefreshCw className="h-4 w-4 animate-spin text-brand-primary" />
                       </div>
                     </div>
                   )}
                   {queue.map((item, index) => (
                     <motion.div
                       key={item.id}
                       layout
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, scale: 0.95 }}
                       transition={{ delay: index * 0.05, type: "spring", stiffness: 100 }}
                       className="group relative flex flex-col gap-6 rounded-[var(--radius-lg)] bg-brand-surface p-6 shadow-sm transition-all hover:shadow-md lg:flex-row lg:items-center lg:justify-between overflow-hidden border border-brand-border"
                     >
                       {/* Indicator Tab */}
                       <div className={`absolute left-0 top-0 h-full w-1.5 transition-all group-hover:w-2.5 ${item.type === 'APPOINTMENT' ? 'bg-brand-primary' : 'bg-brand-warning'}`} />

                       <div className="flex items-start gap-6 lg:items-center">
                          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-brand-surface-muted text-lg font-bold text-brand-muted transition-all group-hover:bg-brand-primary-soft group-hover:text-brand-primary">
                             {index + 1}
                          </div>

                          <div className="space-y-2">
                             <div className="flex flex-wrap items-center gap-3">
                                <h3 className="text-base font-bold tracking-tight text-slate-800">
                                  {item.patientName}
                                </h3>
                                {item.priority === 'URGENT' && (
                                  <motion.span 
                                    animate={{ opacity: [1, 0.5, 1] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500 px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm shadow-rose-500/20"
                                  >
                                    <IconAlert size={10} /> {t("pages.queue.urgent", { defaultValue: "Urgent" })}
                                  </motion.span>
                                )}
                             </div>
                             
                             <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5">
                                 <div className="flex items-center gap-2">
                                   <div className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] bg-brand-primary-soft text-brand-primary">
                                      <IconStethoscope size={14} />
                                   </div>
                                   <span className="text-sm font-medium text-slate-600">{item.procedure}</span>
                                </div>
                                 <div className="flex items-center gap-2">
                                   <div className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] bg-brand-surface-muted text-brand-muted">
                                      <IconRoom size={14} />
                                   </div>
                                   <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                                      {t("pages.queue.assigned", { defaultValue: "Assigned" })}: <span className="text-slate-700">{item.room}</span>
                                   </span>
                                </div>
                             </div>

                             {item.notes && (
                               <div className="mt-2 flex items-start gap-2.5 rounded-[var(--radius-sm)] bg-brand-warning-soft p-3.5 text-sm font-medium text-brand-warning border border-brand-warning-soft">
                                  <IconNote size={15} className="flex-shrink-0 opacity-50 mt-0.5" />
                                  <p className="leading-snug">{item.notes}</p>
                               </div>
                             )}
                          </div>
                       </div>

                       <div className="flex flex-row items-center justify-between border-t border-slate-50 pt-5 lg:flex-col lg:items-end lg:border-t-0 lg:pt-0">
                          <div className="text-right space-y-1.5">
                             <div className="flex items-center justify-end gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 px-2.5 py-1.5 rounded-lg">
                                <IconClock size={11} />
                                {t("pages.queue.arrived", { defaultValue: "Arrived" })}: {item.arrivalTime}
                             </div>
                             {item.appointmentTime && (
                               <div className="flex items-center justify-end gap-1.5 text-[10px] font-semibold text-teal-600 uppercase tracking-wider bg-teal-50 px-2.5 py-1.5 rounded-lg">
                                  <IconCalendar size={11} />
                                  {t("pages.queue.apptTime", { defaultValue: "Appt Time" })}: {item.appointmentTime}
                               </div>
                             )}
                          </div>
                          
                          <div className="mt-4 flex items-center gap-3">
                             <div className="mr-6 hidden text-right lg:block">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                  {t("pages.queue.waitTime", { defaultValue: "Wait Time" })}
                                </p>
                                <p className={`text-xl font-bold mt-0.5 tabular-nums ${item.waitTime > 20 ? 'text-rose-500' : 'text-slate-700'}`}>
                                   {item.waitTime} <span className="text-xs tracking-wider text-slate-400">MIN</span>
                                </p>
                             </div>
                             <div className="flex gap-2">
                                <button className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-white shadow-sm transition-all hover:bg-teal-500 hover:scale-105 active:scale-95">
                                   <IconArrowRight size={20} />
                                </button>
                                 <button className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-brand-surface-muted text-brand-muted hover:bg-brand-primary hover:text-white transition-all">
                                    <IconDots size={20} />
                                 </button>
                             </div>
                          </div>
                       </div>
                     </motion.div>
                   ))}
                </AnimatePresence>
             </div>
          </div>

          {/* Side Panels - Stats & Active Treatment */}
          <div className="lg:col-span-4 space-y-6">
             {/* Active Session Info */}
             <div className="space-y-3">
                <h2 className="px-1 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  {t("pages.queue.activeSessions", { defaultValue: "Active Sessions" })}
                </h2>
                <div className="rounded-[var(--radius-lg)] bg-slate-800 p-8 space-y-6 shadow-xl relative overflow-hidden group">
                   <div className="absolute -top-20 -right-20 h-64 w-64 bg-brand-primary/20 rounded-full blur-[80px] transition-all group-hover:scale-150 duration-1000" />
                   
                   <div className="flex items-center justify-between relative z-10">
                      <div className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-md)] bg-brand-primary text-white shadow-lg shadow-brand-primary/20">
                         <Activity size={28} />
                      </div>
                      <div className="text-right">
                         <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-400">
                           {t("pages.queue.servingNow", { defaultValue: "Serving Now" })}
                         </span>
                         <h4 className="text-lg font-bold text-white leading-tight mt-0.5">
                           {t("pages.queue.demoServingName", { defaultValue: "Demo Serving Name" })}
                         </h4>
                      </div>
                   </div>
                   
                   <div className="space-y-4 relative z-10">
                      <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider">
                         <span className="text-slate-400">{t("pages.queue.procedure", { defaultValue: "Procedure" })}</span>
                         <span className="text-white bg-slate-700 px-2.5 py-1 rounded-lg">
                           {t("pages.queue.demoServingProcedure", { defaultValue: "Demo Serving Procedure" })}
                         </span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider">
                         <span className="text-slate-400">{t("pages.queue.elapsedTime", { defaultValue: "Elapsed Time" })}</span>
                         <span className="text-teal-400 font-mono text-lg tabular-nums">18:42</span>
                      </div>
                      <div className="relative h-2.5 w-full rounded-full bg-slate-700 overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: "65%" }}
                           className="h-full bg-teal-500 rounded-full"
                         />
                      </div>
                   </div>

                   <button className="group w-full flex items-center justify-center gap-2.5 rounded-xl bg-white py-4 text-xs font-bold uppercase tracking-wider text-slate-800 shadow-lg transition-all hover:scale-[1.02] active:scale-95 relative z-10">
                      {t("pages.queue.viewClinicalChart", { defaultValue: "View Clinical Chart" })}
                      <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
                   </button>
                </div>
             </div>

             {/* Quick Statistics */}
             <div className="space-y-3">
                <h2 className="px-1 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  {t("pages.queue.metrics", { defaultValue: "Metrics" })}
                </h2>
                <div className="grid grid-cols-1 gap-3">
                   <div className="card">
                      <div className="flex items-center gap-2.5 mb-3">
                         <IconClock size={15} className="text-sky-500" />
                         <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                           {t("pages.queue.avgWait", { defaultValue: "Avg Wait" })}
                         </p>
                      </div>
                      <div className="flex items-baseline gap-2">
                         <p className="text-3xl font-bold text-slate-800 tabular-nums">14</p>
                         <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                           {t("pages.queue.minutesUnit", { defaultValue: "Minutes Unit" })}
                         </p>
                      </div>
                   </div>
                   <div className="card">
                      <div className="flex items-center gap-2.5 mb-3">
                         <TrendingUp size={15} className="text-teal-500" />
                         <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                           {t("pages.queue.satisfaction", { defaultValue: "Satisfaction" })}
                         </p>
                      </div>
                      <div className="flex items-baseline gap-2">
                         <p className="text-3xl font-bold text-slate-800 tabular-nums">4.8</p>
                         <p className="text-xs font-semibold text-teal-500 uppercase tracking-wider">
                           {t("pages.queue.scoreUnit", { defaultValue: "Score Unit" })}
                         </p>
                      </div>
                   </div>
                </div>
             </div>

             {/* System Status */}
             <div className="card p-4">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2.5">
                      <ShieldCheck size={16} className="text-teal-500" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                         {t("pages.queue.syncStatus", { defaultValue: "Sync Status" })}
                      </span>
                   </div>
                   <span className="flex items-center gap-1.5 text-[10px] font-semibold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                      <Zap size={10} /> {t("pages.queue.syncHealthy", { defaultValue: "Sync Healthy" })}
                   </span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
