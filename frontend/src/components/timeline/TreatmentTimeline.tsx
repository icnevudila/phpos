import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Clock, Activity, ArrowRight, ChevronRight, Zap, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface TreatmentPhase {
  id: string;
  title: string;
  description?: string;
  startDate: Date | string;
  endDate: Date | string;
  status: 'pending' | 'in-progress' | 'completed' | 'paused';
  treatments?: string[];
  notes?: string;
  order: number;
}

export interface TreatmentTimelineProps {
  phases: TreatmentPhase[];
  onPhaseUpdate?: (phase: TreatmentPhase) => void;
  className?: string;
}

const STATUS_CONFIG = {
  completed: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: <CheckCircle2 size={16} /> },
  'in-progress': { color: 'text-sky-500', bg: 'bg-sky-500/10', border: 'border-sky-500/20', icon: <Activity size={16} /> },
  pending: { color: 'text-slate-400', bg: 'bg-slate-500/5', border: 'border-slate-500/10', icon: <Circle size={16} /> },
  paused: { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: <Clock size={16} /> },
};

export function TreatmentTimeline({
  phases = [],
  onPhaseUpdate,
  className = '',
}: TreatmentTimelineProps) {
  const { t } = useTranslation();
  const sortedPhases = useMemo(() => [...phases].sort((a, b) => a.order - b.order), [phases]);
  
  const stats = useMemo(() => {
    const total = sortedPhases.length;
    const completed = sortedPhases.filter(p => p.status === 'completed').length;
    return {
      total,
      completed,
      percent: Math.round((completed / (total || 1)) * 100)
    };
  }, [sortedPhases]);

  return (
    <div className={`flex flex-col gap-8 ${className}`}>
      {/* Header with Progress Orbit */}
      <header className="flex items-center justify-between rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-xl shadow-slate-200/40 dark:shadow-none">
         <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 flex items-center justify-center">
               <svg className="absolute inset-0 h-full w-full -rotate-90">
                  <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-100 dark:text-slate-800" />
                  <motion.circle 
                    cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="6" 
                    strokeDasharray="226" 
                    initial={{ strokeDashoffset: 226 }}
                    animate={{ strokeDashoffset: 226 - (226 * stats.percent) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="text-sky-500" 
                  />
               </svg>
               <div className="flex flex-col items-center">
                  <span className="text-xl font-black text-slate-900 dark:text-white">{stats.percent}%</span>
                  <span className="text-[8px] font-black uppercase text-slate-400">{t("pages.patientDetail.timeline.successLabel")}</span>
               </div>
            </div>
            <div>
               <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">{t("pages.patientDetail.timeline.headerKicker")}</h3>
               <p className="text-lg font-black text-slate-900 dark:text-white">{t("pages.patientDetail.timeline.headerTitle")}</p>
               <div className="mt-1 flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                  <span>{t("pages.patientDetail.timeline.stats.complete", { count: stats.completed })}</span>
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <span>{t("pages.patientDetail.timeline.stats.remaining", { count: stats.total - stats.completed })}</span>
               </div>
            </div>
         </div>

         <div className="hidden md:flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
            <Trophy className="text-amber-500" size={20} />
            <div className="pr-2">
               <p className="text-[10px] font-black uppercase text-slate-400">{t("pages.patientDetail.timeline.nextMilestone")}</p>
               <p className="text-xs font-black text-slate-900 dark:text-white">
                  {sortedPhases.find(p => p.status !== 'completed')?.title || t("pages.patientDetail.timeline.finalized")}
               </p>
            </div>
         </div>
      </header>

      {/* The Journey Path */}
      <div className="relative pl-8 md:pl-24 space-y-12">
         {/* Vertical Path Line */}
         <div className="absolute left-10 md:left-28 top-0 bottom-0 w-px bg-gradient-to-b from-sky-500 via-slate-200 dark:via-slate-800 to-transparent" />

         {sortedPhases.map((phase, idx) => (
           <JourneyPhaseNode 
             key={phase.id} 
             phase={phase} 
             index={idx} 
             isLast={idx === sortedPhases.length - 1}
             onUpdate={onPhaseUpdate} 
             t={t}
           />
         ))}
      </div>
    </div>
  );
}

function JourneyPhaseNode({ phase, index, t }: any) {
  const config = STATUS_CONFIG[phase.status as keyof typeof STATUS_CONFIG];
  const [isExpanded, setIsExpanded] = useState(phase.status === 'in-progress');

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="relative group"
    >
      {/* Date Pillar (Desktop) */}
      <div className="hidden md:block absolute -left-24 top-2 text-right">
         <p className="text-[10px] font-black uppercase text-slate-400">{t("pages.patientDetail.timeline.phaseLabel", { count: index + 1 })}</p>
         <p className="text-xs font-black text-slate-900 dark:text-white">
            {new Date(phase.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
         </p>
      </div>

      {/* Status Orb */}
      <div className={`absolute -left-10 md:left-[-1.125rem] top-2 z-10 h-5 w-5 rounded-full border-4 border-slate-50 dark:border-slate-950 flex items-center justify-center ${config.bg} ${config.color} shadow-lg`}>
         {config.icon}
      </div>

      {/* Content Card */}
      <div className={`ml-4 md:ml-12 rounded-[2rem] border transition-all duration-300 ${
        isExpanded ? 'bg-white dark:bg-slate-900 shadow-2xl border-slate-200 dark:border-slate-800 p-8' : 'bg-slate-50 dark:bg-slate-950/40 border-transparent hover:border-slate-200 p-6'
      }`}>
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${config.bg} ${config.color}`}>
                  <Zap size={18} />
               </div>
               <div>
                  <div className="flex items-center gap-2">
                     <h4 className="text-lg font-black text-slate-900 dark:text-white">{phase.title}</h4>
                     <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${config.bg} ${config.color}`}>
                        {t(`pages.patientDetail.timeline.status.${phase.status}`)}
                     </span>
                  </div>
                  {!isExpanded && <p className="text-xs font-bold text-slate-400 mt-0.5 line-clamp-1">{phase.description}</p>}
               </div>
            </div>

            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-10 w-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
            >
               <ChevronRight size={20} className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
            </button>
         </div>

         <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-6">
                   <p className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                      {phase.description}
                   </p>

                   {phase.treatments && (
                     <div className="flex flex-wrap gap-2">
                        {phase.treatments.map((t_item: string, i: number) => (
                          <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-[11px] font-black uppercase text-slate-500">
                             <ArrowRight size={12} className="text-sky-500" />
                             {t_item}
                          </div>
                        ))}
                     </div>
                   )}

                   {phase.notes && (
                     <div className="bg-sky-50/50 dark:bg-sky-500/5 p-4 rounded-2xl border border-sky-100 dark:border-sky-500/10">
                        <p className="text-[10px] font-black uppercase text-sky-600 mb-1">{t("pages.patientDetail.timeline.notesTitle")}</p>
                        <p className="text-xs font-bold text-sky-900 dark:text-sky-200">{phase.notes}</p>
                     </div>
                   )}
                </div>
              </motion.div>
            )}
         </AnimatePresence>
      </div>
    </motion.div>
  );
}
