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
  ShieldCheck
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
      const res = await api.get<{ data: QueueItem[] }>("/analytics/queue");
      setQueue(res.data.data);
    } catch (err: any) {
      console.error("Queue fetch error:", err);
      toast.error(err.response?.data?.message || t("pages.queue.syncFailed"));
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
    toast.success(t("pages.queue.synced"));
  };

  return (
    <div className="min-h-screen w-full pb-24 bg-[#fafbfc] dark:bg-slate-950">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 space-y-12 pt-10">
        {/* Clinical Header */}
        <header className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               <span className="relative flex h-3 w-3">
                 <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                 <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
               </span>
               <span className="text-xs font-black uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400">
                  {t("pages.queue.liveFlow")}
               </span>
            </div>
            <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white lg:text-6xl">
              {t("pages.queue.title")}
            </h1>
            <p className="max-w-2xl text-lg font-medium text-slate-400 leading-relaxed">
              {t("pages.queue.subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-5">
             <div className="flex items-center gap-6 rounded-[2.5rem] bg-white dark:bg-slate-900 p-2 pl-8 shadow-2xl shadow-slate-200/50 dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-800">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                     {t("pages.queue.waitingCount")}
                   </p>
                   <p className="text-3xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">{queue.length}</p>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-[2rem] bg-emerald-500 text-white shadow-xl shadow-emerald-500/20">
                   <IconUsers size={28} />
                </div>
             </div>
             <button
               type="button"
               onClick={refreshQueue}
               aria-label={t("pages.queue.refreshQueueAria")}
               className="flex h-20 w-20 items-center justify-center rounded-[2.5rem] bg-slate-900 text-white shadow-2xl transition-all hover:scale-105 active:scale-95 dark:bg-white dark:text-slate-900"
             >
               <IconClock className={loading ? "animate-spin" : ""} size={32} />
             </button>
          </div>
        </header>

        {/* Queue Grid Layout */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          
          {/* Main Waiting List */}
          <div className="lg:col-span-8 space-y-8">
             <div className="flex items-center justify-between px-4">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                  {t("pages.queue.waitingArea")}
                </h2>
                <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
                   <div className="flex items-center gap-2.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> {t("pages.queue.typeAppt")}
                   </div>
                   <div className="flex items-center gap-2.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-amber-500" /> {t("pages.queue.typeWait")}
                   </div>
                </div>
             </div>

             <div className="space-y-5">
                <AnimatePresence mode="popLayout">
                   {queue.length === 0 && !loading && (
                     <motion.div 
                       initial={{ opacity: 0, scale: 0.95 }}
                       animate={{ opacity: 1, scale: 1 }}
                       className="rounded-[3rem] border-2 border-dashed border-slate-200 bg-white/50 p-20 text-center dark:border-slate-800 dark:bg-slate-900/50"
                     >
                        <IconUsers className="mx-auto text-slate-200 dark:text-slate-800 mb-6" size={64} />
                        <p className="text-lg font-black text-slate-400 uppercase tracking-widest">{t("pages.queue.empty")}</p>
                     </motion.div>
                   )}
                   {queue.map((item, index) => (
                     <motion.div
                       key={item.id}
                       layout
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, scale: 0.95 }}
                       transition={{ delay: index * 0.05, type: "spring", stiffness: 100 }}
                       className="group relative flex flex-col gap-8 rounded-[3rem] bg-white p-8 shadow-xl shadow-slate-200/40 transition-all hover:shadow-2xl hover:shadow-slate-300/50 dark:bg-slate-900 dark:shadow-none lg:flex-row lg:items-center lg:justify-between overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800"
                     >
                       {/* Indicator Tab */}
                       <div className={`absolute left-0 top-0 h-full w-2.5 transition-all group-hover:w-4 ${item.type === 'APPOINTMENT' ? 'bg-emerald-500' : 'bg-amber-500'}`} />

                       <div className="flex items-start gap-8 lg:items-center">
                          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-[2rem] bg-slate-50 text-3xl font-black text-slate-200 transition-all group-hover:bg-emerald-50 group-hover:text-emerald-500 dark:bg-slate-950 dark:text-slate-800 dark:group-hover:bg-emerald-950 dark:group-hover:text-emerald-400">
                             {index + 1}
                          </div>

                          <div className="space-y-3">
                             <div className="flex flex-wrap items-center gap-4">
                                <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                                  {item.patientName}
                                </h3>
                                {item.priority === 'URGENT' && (
                                  <motion.span 
                                    animate={{ opacity: [1, 0.5, 1] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-1.5 text-[10px] font-black text-white uppercase tracking-widest shadow-lg shadow-rose-500/20"
                                  >
                                    <IconAlert size={12} /> {t("pages.queue.urgent")}
                                  </motion.span>
                                )}
                             </div>
                             
                             <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
                                <div className="flex items-center gap-2.5">
                                   <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                                      <IconStethoscope size={16} />
                                   </div>
                                   <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{item.procedure}</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                   <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                                      <IconRoom size={16} />
                                   </div>
                                   <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                                      {t("pages.queue.assigned")}: <span className="text-slate-900 dark:text-white">{item.room}</span>
                                   </span>
                                </div>
                             </div>

                             {item.notes && (
                               <div className="mt-4 flex items-start gap-3 rounded-2xl bg-amber-50/50 p-5 text-sm font-bold text-amber-800 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-100/30">
                                  <IconNote size={18} className="flex-shrink-0 opacity-40" />
                                  <p className="leading-snug">{item.notes}</p>
                               </div>
                             )}
                          </div>
                       </div>

                       <div className="flex flex-row items-center justify-between border-t border-slate-50 pt-8 lg:flex-col lg:items-end lg:border-t-0 lg:pt-0 dark:border-slate-800">
                          <div className="text-right space-y-2">
                             <div className="flex items-center justify-end gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-xl">
                                <IconClock size={12} />
                                {t("pages.queue.arrived")}: {item.arrivalTime}
                             </div>
                             {item.appointmentTime && (
                               <div className="flex items-center justify-end gap-2 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-xl">
                                  <IconCalendar size={12} />
                                  {t("pages.queue.apptTime")}: {item.appointmentTime}
                               </div>
                             )}
                          </div>
                          
                          <div className="mt-6 flex items-center gap-4">
                             <div className="mr-8 hidden text-right lg:block">
                                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                                  {t("pages.queue.waitTime")}
                                </p>
                                <p className={`text-2xl font-black mt-1 tabular-nums ${item.waitTime > 20 ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                                   {item.waitTime} <span className="text-xs tracking-widest text-slate-400">MIN</span>
                                </p>
                             </div>
                             <div className="flex gap-2">
                                <button className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-xl transition-all hover:bg-emerald-500 hover:scale-105 active:scale-95 dark:bg-white dark:text-slate-900 dark:hover:bg-emerald-400">
                                   <IconArrowRight size={24} />
                                </button>
                                <button className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-500 dark:hover:bg-slate-700">
                                   <IconDots size={24} />
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
          <div className="lg:col-span-4 space-y-12">
             {/* Active Session Info */}
             <div className="space-y-8">
                <h2 className="px-4 text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                  {t("pages.queue.activeSessions")}
                </h2>
                <div className="rounded-[3.5rem] bg-slate-900 p-10 space-y-10 shadow-2xl relative overflow-hidden group border border-slate-800">
                   <div className="absolute -top-20 -right-20 h-64 w-64 bg-emerald-500/20 rounded-full blur-[80px] transition-all group-hover:scale-150 duration-1000" />
                   
                   <div className="flex items-center justify-between relative z-10">
                      <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-emerald-500 text-white shadow-xl shadow-emerald-500/20">
                         <Activity size={32} />
                      </div>
                      <div className="text-right">
                         <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">
                           {t("pages.queue.servingNow")}
                         </span>
                         <h4 className="text-2xl font-black text-white leading-tight mt-1">
                           {t("pages.queue.demoServingName")}
                         </h4>
                      </div>
                   </div>
                   
                   <div className="space-y-6 relative z-10">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                         <span className="text-slate-500">{t("pages.queue.procedure")}</span>
                         <span className="text-white bg-slate-800 px-3 py-1 rounded-lg">
                           {t("pages.queue.demoServingProcedure")}
                         </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                         <span className="text-slate-500">{t("pages.queue.elapsedTime")}</span>
                         <span className="text-emerald-400 font-mono text-xl tabular-nums">18:42</span>
                      </div>
                      <div className="relative h-3 w-full rounded-full bg-slate-800 overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: "65%" }}
                           className="h-full bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                         />
                      </div>
                   </div>

                   <button className="group w-full flex items-center justify-center gap-3 rounded-[1.5rem] bg-white py-5 text-xs font-black uppercase tracking-[0.2em] text-slate-900 shadow-xl transition-all hover:scale-[1.02] active:scale-95 relative z-10">
                      {t("pages.queue.viewClinicalChart")}
                      <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                   </button>
                </div>
             </div>

             {/* Quick Statistics */}
             <div className="space-y-8">
                <h2 className="px-4 text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                  {t("pages.queue.metrics")}
                </h2>
                <div className="grid grid-cols-1 gap-6">
                   <div className="rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 shadow-xl shadow-slate-100 dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-800">
                      <div className="flex items-center gap-3 mb-4">
                         <IconClock size={16} className="text-sky-500" />
                         <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                           {t("pages.queue.avgWait")}
                         </p>
                      </div>
                      <div className="flex items-baseline gap-3">
                         <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">14</p>
                         <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                           {t("pages.queue.minutesUnit")}
                         </p>
                      </div>
                   </div>
                   <div className="rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 shadow-xl shadow-slate-100 dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-800">
                      <div className="flex items-center gap-3 mb-4">
                         <TrendingUp size={16} className="text-emerald-500" />
                         <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                           {t("pages.queue.satisfaction")}
                         </p>
                      </div>
                      <div className="flex items-baseline gap-3">
                         <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">4.8</p>
                         <p className="text-xs font-black text-emerald-500 uppercase tracking-widest">
                           {t("pages.queue.scoreUnit")}
                         </p>
                      </div>
                   </div>
                </div>
             </div>

             {/* System Status */}
             <div className="rounded-[2rem] bg-white dark:bg-slate-900 p-5 ring-1 ring-slate-100 dark:ring-slate-800 shadow-sm">
                <div className="flex items-center justify-between px-2">
                   <div className="flex items-center gap-3">
                      <ShieldCheck size={18} className="text-emerald-500" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                         {t("pages.queue.syncStatus")}
                      </span>
                   </div>
                   <span className="flex items-center gap-2 text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-lg uppercase tracking-widest">
                      <Zap size={10} /> {t("pages.queue.syncHealthy")}
                   </span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
