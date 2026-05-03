import { useEffect, useState } from "react";
import { 
  Users as IconUsers, 
  CheckCircle2 as IconDone,
  Stethoscope as IconStethoscope,
  MapPin as IconRoom
} from "lucide-react";

import { apiFetch } from "../services/api";

interface QueueItem {
  id: string;
  patientName: string;
  type: "WAITLIST" | "APPOINTMENT";
  status: "WAITING" | "CHECKED_IN" | "IN_PROGRESS" | "DONE";
  arrivalTime: string;
  waitTime: number;
  dentistName: string;
  procedure: string;
  room: string;
  priority: "NORMAL" | "URGENT";
}

export function PublicQueuePage() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchQueue = async () => {
    try {
      const res = await apiFetch<{ success: true; data: QueueItem[] }>("/analytics/queue");
      if (res.success) {
        setQueue(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchQueue();
    const qInterval = setInterval(fetchQueue, 15000); 
    const tInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearInterval(qInterval);
      clearInterval(tInterval);
    };
  }, []);

  const serving = queue.filter(p => p.status === "IN_PROGRESS");
  const waiting = queue.filter(p => p.status !== "IN_PROGRESS");

  return (
    <div className="flex h-screen w-full flex-col bg-[#f8fafc] text-slate-900 overflow-hidden font-sans dark:bg-slate-950">
      {/* Top Header */}
      <header className="flex h-24 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-8 md:px-12 shadow-sm dark:bg-slate-900/80 dark:border-slate-800">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
             <IconStethoscope size={32} />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-slate-900 dark:text-white">DentEase <span className="text-emerald-600 italic">Live Queue</span></h1>
            <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Clinical Triage Information</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white tabular-nums leading-none">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
          <p className="mt-1 text-[10px] md:text-xs font-bold text-emerald-600 uppercase tracking-[0.2em]">
            {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Left Side: Currently Serving */}
        <section className="w-full md:w-[45%] flex flex-col p-8 md:p-12 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
           <h2 className="mb-6 md:mb-10 flex items-center gap-3 text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-slate-400">
             <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
             Active Treatment
           </h2>

           <div className="flex-1 flex flex-col justify-center">
                {serving.length > 0 ? (
                  serving.map((p) => (
                    <div key={p.id} className="space-y-6 md:space-y-10">
                      <div className="space-y-3 md:space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-4 md:px-6 py-2 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-100 dark:ring-emerald-900/50">
                           <IconRoom size={20} />
                           <span className="text-xl md:text-2xl font-black tracking-tight">{p.room}</span>
                        </div>
                        <h3 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none break-words">
                          {p.patientName}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 md:gap-6">
                        <div className="h-[2px] w-12 md:w-24 bg-emerald-600" />
                        <p className="text-2xl md:text-4xl font-bold text-emerald-600 tracking-tight italic">{p.procedure}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-200 dark:text-slate-800 text-center space-y-4">
                     <p className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-tight italic">Ready for<br/>Next Session</p>
                  </div>
                )}
           </div>

           <div className="mt-auto rounded-3xl bg-slate-50 dark:bg-slate-950 p-6 md:p-10 border border-slate-200 dark:border-slate-800">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 md:mb-4">Clinic Notice</p>
              <p className="text-lg md:text-2xl font-medium text-slate-700 dark:text-slate-300 leading-snug">Please have your <span className="text-emerald-600 font-black">Patient ID</span> ready. We value your time.</p>
           </div>
        </section>

        {/* Right Side: Waiting List */}
        <section className="w-full md:w-[55%] flex flex-col p-8 md:p-12 overflow-hidden">
           <div className="mb-8 md:mb-12 flex items-center justify-between">
              <h2 className="flex items-center gap-3 text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-slate-400">
                Waiting List
              </h2>
              <div className="rounded-full bg-slate-200 dark:bg-slate-800 px-4 md:px-6 py-2 text-[10px] md:text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                {waiting.length} In Line
              </div>
           </div>

           <div className="flex-1 space-y-4 md:space-y-5 overflow-y-auto pr-2 scrollbar-hide">
                 {waiting.slice(0, 5).map((p, idx) => (
                   <div 
                     key={p.id}
                     className="flex items-center justify-between rounded-[2rem] md:rounded-[2.5rem] bg-white dark:bg-slate-900 p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-all active:scale-[0.98]"
                   >
                     <div className="flex items-center gap-6 md:gap-10">
                        <div className="text-3xl md:text-5xl font-black text-slate-100 dark:text-slate-800 italic tabular-nums">{idx + 1}</div>
                        <div>
                          <h4 className="text-2xl md:text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase truncate max-w-[200px] md:max-w-none">{p.patientName}</h4>
                          <div className="mt-1 flex items-center gap-2 md:gap-4 text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-widest">
                             <span className="truncate max-w-[100px]">{p.dentistName}</span>
                             <span className="h-1 w-1 rounded-full bg-slate-300" />
                             <span className="text-emerald-600">{p.room}</span>
                          </div>
                        </div>
                     </div>
                     <div className="text-right shrink-0">
                        <div className={`px-4 md:px-6 py-1.5 md:py-2 rounded-full text-[9px] md:text-xs font-black uppercase tracking-widest ${
                          p.status === 'CHECKED_IN' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-sky-100 text-sky-700 border border-sky-200'
                        }`}>
                          {p.status === 'CHECKED_IN' ? 'Ready' : 'Waiting'}
                        </div>
                     </div>
                   </div>
                 ))}
           </div>

           {/* Footer Icons */}
           <div className="mt-8 flex items-center justify-center gap-10 md:gap-16 opacity-30">
              <div className="flex items-center gap-2 md:gap-3">
                <IconDone size={18} className="text-emerald-600" />
                <span className="text-[9px] md:text-xs font-black uppercase tracking-[0.2em]">Live Sync</span>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <IconUsers size={18} className="text-emerald-600" />
                <span className="text-[9px] md:text-xs font-black uppercase tracking-[0.2em]">Capacity Active</span>
              </div>
           </div>
        </section>
      </div>

      {/* Bottom Ticker */}
      <div className="h-12 md:h-14 bg-emerald-600 flex items-center overflow-hidden whitespace-nowrap shrink-0">
        <div className="flex gap-16 md:gap-24 text-[10px] md:text-sm font-black uppercase tracking-[0.2em] text-white animate-pulse">
          <span>Welcome to DentEase Philippines — Quality Dental Care for every Filipino family</span>
          <span>Please sanitize your hands upon entry — Health is our priority</span>
          <span>Follow us on Instagram @DentEasePH for dental health tips</span>
          <span>We value your time — Thank you for your patience</span>
        </div>
      </div>
    </div>
  );
}
