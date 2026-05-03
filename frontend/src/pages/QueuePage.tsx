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
  Calendar as IconCalendar
} from "lucide-react";

import { apiFetch } from "../services/api";

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

  const fetchQueueData = async () => {
    try {
      setLoading(true);
      const res = await apiFetch<{ success: true; data: QueueItem[] }>("/analytics/queue");
      if (res.success) {
        setQueue(res.data);
      }
    } catch (err) {
      console.error("Queue fetch error:", err);
      toast.error(t("pages.queue.syncFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchQueueData();
    const interval = setInterval(() => void fetchQueueData(), 30000);
    return () => clearInterval(interval);
  }, []);

  const refreshQueue = () => {
    void fetchQueueData();
    toast.success(t("pages.queue.synced"));
  };

  return (
    <div className="min-h-screen w-full pb-12">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Clinical Header */}
        <header className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-emerald-600">
               <span className="relative flex h-2 w-2">
                 <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                 <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
               </span>
               {t("pages.queue.liveFlow")}
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white lg:text-5xl">
              {t("pages.queue.title")}
            </h1>
            <p className="max-w-2xl text-base font-medium text-slate-500 leading-relaxed">
              {t("pages.queue.subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-4">
             <div className="glass-premium flex items-center gap-5 !py-4 px-6 shadow-xl shadow-slate-200/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                   <IconUsers size={24} />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                     {t("pages.queue.waitingCount")}
                   </p>
                   <p className="text-2xl font-black text-slate-900 leading-none mt-1">{queue.length}</p>
                </div>
             </div>
             <button 
               onClick={refreshQueue}
               className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md active:scale-95"
             >
               <IconClock className={loading ? "animate-spin" : ""} size={24} />
             </button>
          </div>
        </header>

        {/* Queue Grid Layout */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          
          {/* Main Waiting List */}
          <div className="lg:col-span-8 space-y-6">
             <div className="flex items-center justify-between px-2">
                <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                  {t("pages.queue.waitingArea")}
                </h2>
                <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                   <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" /> {t("pages.queue.typeAppt")}
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-amber-500" /> {t("pages.queue.typeWait")}
                   </div>
                </div>
             </div>

             <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                   {queue.length === 0 && !loading && (
                     <motion.div className="glass-premium p-12 text-center border-dashed border-2">
                        <p className="font-bold text-slate-400">{t("pages.queue.empty")}</p>
                     </motion.div>
                   )}
                   {queue.map((item, index) => (
                     <motion.div
                       key={item.id}
                       initial={{ opacity: 0, x: -20 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, x: 20 }}
                       transition={{ delay: index * 0.05 }}
                       className="group glass-premium !p-6 flex flex-col gap-6 transition-all hover:scale-[1.01] hover:shadow-2xl hover:shadow-slate-200 lg:flex-row lg:items-center lg:justify-between relative overflow-hidden"
                     >
                       {/* Priority Indicator */}
                       <div className={`absolute left-0 top-0 h-full w-1.5 transition-all group-hover:w-2 ${item.type === 'APPOINTMENT' ? 'bg-emerald-500' : 'bg-amber-500'}`} />

                       <div className="flex items-start gap-6 lg:items-center">
                          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-2xl font-black text-slate-200 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all border border-slate-100">
                             {index + 1}
                          </div>

                          <div className="space-y-1.5">
                             <div className="flex items-center gap-3">
                                <h3 className="text-xl font-black tracking-tight text-slate-900">
                                  {item.patientName}
                                </h3>
                                {item.priority === 'URGENT' && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-[10px] font-black text-rose-600 ring-1 ring-inset ring-rose-200 animate-pulse">
                                    <IconAlert size={10} /> {t("pages.queue.urgent")}
                                  </span>
                                )}
                             </div>
                             
                             <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm font-bold text-slate-500">
                                <div className="flex items-center gap-2">
                                   <IconStethoscope size={16} className="text-emerald-500" />
                                   <span className="text-slate-800">{item.procedure}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                   <IconRoom size={16} className="text-slate-400" />
                                   <span className="opacity-70">{t("pages.queue.assigned")}: <span className="text-slate-700">{item.room}</span></span>
                                </div>
                             </div>

                             {item.notes && (
                               <div className="mt-3 flex items-start gap-3 rounded-2xl bg-amber-50/50 p-4 text-xs font-medium text-amber-800 border border-amber-100/50">
                                  <IconNote size={16} className="flex-shrink-0 opacity-50" />
                                  <p>{item.notes}</p>
                               </div>
                             )}
                          </div>
                       </div>

                       <div className="flex flex-row items-center justify-between border-t border-slate-100 pt-6 lg:flex-col lg:items-end lg:border-t-0 lg:pt-0">
                          <div className="text-right space-y-1">
                             <div className="flex items-center justify-end gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <IconClock size={12} />
                                {t("pages.queue.arrived")}: {item.arrivalTime}
                             </div>
                             {item.appointmentTime && (
                               <div className="flex items-center justify-end gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                                  <IconCalendar size={12} />
                                  {t("pages.queue.apptTime")}: {item.appointmentTime}
                               </div>
                             )}
                          </div>
                          
                          <div className="mt-4 flex items-center gap-3">
                             <div className="mr-6 hidden text-right lg:block">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                  {t("pages.queue.waitTime")}
                                </p>
                                <p className={`text-lg font-black mt-0.5 ${item.waitTime > 20 ? 'text-rose-500' : 'text-slate-900'}`}>
                                   {item.waitTime} <span className="text-xs">MIN</span>
                                </p>
                             </div>
                             <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400 transition-all hover:border-emerald-500 hover:bg-emerald-500 hover:text-white hover:shadow-lg active:scale-95">
                                <IconArrowRight size={20} />
                             </button>
                             <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400 transition-all hover:bg-slate-50 active:scale-95">
                                <IconDots size={20} />
                             </button>
                          </div>
                       </div>
                     </motion.div>
                   ))}
                </AnimatePresence>
             </div>
          </div>

          {/* Side Panels - Stats & Active Treatment */}
          <div className="lg:col-span-4 space-y-10">
             {/* Active Session Info */}
             <div className="space-y-6">
                <h2 className="px-2 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                  {t("pages.queue.activeSessions")}
                </h2>
                <div className="glass-premium !bg-emerald-600 border-none shadow-2xl shadow-emerald-200 p-8 space-y-8 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 h-32 w-32 -mr-16 -mt-16 bg-white/10 rounded-full blur-3xl transition-all group-hover:scale-150 duration-700" />
                   
                   <div className="flex items-center justify-between relative z-10">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-md">
                         <IconStethoscope size={28} />
                      </div>
                      <div className="text-right">
                         <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-200">
                           {t("pages.queue.servingNow")}
                         </span>
                         <h4 className="text-xl font-black text-white leading-tight mt-1">Jamil Jan Baterna</h4>
                      </div>
                   </div>
                   
                   <div className="space-y-4 relative z-10">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-emerald-200">
                         <span>{t("pages.queue.procedure")}</span>
                         <span className="text-white">Root Canal</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-emerald-200">
                         <span>{t("pages.queue.elapsedTime")}</span>
                         <span className="text-white font-mono text-base">18:42</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-white/20 overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: "65%" }}
                           className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                         />
                      </div>
                   </div>

                   <button className="w-full rounded-2xl bg-white py-4 text-sm font-black uppercase tracking-widest text-emerald-700 shadow-xl transition-all hover:scale-[1.02] active:scale-95 relative z-10">
                      {t("pages.queue.viewClinicalChart")}
                   </button>
                </div>
             </div>

             {/* Quick Statistics */}
             <div className="space-y-6">
                <h2 className="px-2 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                  {t("pages.queue.metrics")}
                </h2>
                <div className="grid grid-cols-1 gap-4">
                   <div className="glass-premium !p-6 shadow-xl shadow-slate-100">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        {t("pages.queue.avgWait")}
                      </p>
                      <div className="mt-2 flex items-baseline gap-2">
                         <p className="text-4xl font-black text-slate-900 tracking-tighter">14</p>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MINUTES</p>
                      </div>
                   </div>
                   <div className="glass-premium !p-6 shadow-xl shadow-slate-100">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        {t("pages.queue.satisfaction")}
                      </p>
                      <div className="mt-2 flex items-baseline gap-2">
                         <p className="text-4xl font-black text-slate-900 tracking-tighter">4.8</p>
                         <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">SCORE</p>
                      </div>
                   </div>
                </div>
             </div>

             {/* System Status */}
             <div className="glass-premium !p-4 !bg-slate-50 border-none">
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                   <IconAlert size={14} className="text-emerald-500" />
                   {t("pages.queue.syncStatus")}: <span className="text-emerald-600">HEALTHY</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
