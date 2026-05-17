import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Activity, Droplets, Info, AlertCircle, ChevronUp } from 'lucide-react';
import type { PerioToothDto } from '../../services/perio';

const CH = 'pages.patientDetail.perio.chart';

export interface AdvancedPerioVisualizerProps {
  teeth?: PerioToothDto[];
  selectedToothId?: string | number | null;
  onToothSelect?: (tooth: PerioToothDto, toothIndex: number) => void;
  className?: string;
}

// Helper to determine anatomical shape
const getToothShape = (num: number): 'molar' | 'premolar' | 'canine' | 'incisor' => {
  const n = num > 32 ? num - 32 : num; // Handle primary teeth
  if ([1, 2, 3, 14, 15, 16, 17, 18, 19, 30, 31, 32].includes(n)) return 'molar';
  if ([4, 5, 12, 13, 20, 21, 28, 29].includes(n)) return 'premolar';
  if ([6, 11, 22, 27].includes(n)) return 'canine';
  return 'incisor';
};

export function AdvancedPerioVisualizer({
  teeth = [],
  selectedToothId,
  onToothSelect,
  className = '',
}: AdvancedPerioVisualizerProps) {
  const { t } = useTranslation();
  const [hoveredTooth, setHoveredTooth] = useState<number | null>(null);

  const processedTeeth = useMemo(() => {
    return (teeth || []).map((t, idx) => {
      const sites = (t as any).sites || (t as any).perioSites || [];
      const pocketDepths = sites.map((s: any) => s.pocketDepth || 0);
      const recessions = sites.map((s: any) => s.recession || 0);
      const maxPocket = Math.max(...pocketDepths, 0);
      const avgPocket = pocketDepths.reduce((a: number, b: number) => a + b, 0) / (sites.length || 1);
      const bleeding = sites.some((s: any) => s.bleedingOnProbing || s.bop);
      const toothNum = (t as any).toothNumber || (t as any).number || idx + 1;
      
      return {
        ...t,
        toothNumber: toothNum,
        maxPocket,
        avgPocket,
        bleeding,
        recessions,
        pocketDepths,
        shape: getToothShape(toothNum),
        isUpper: toothNum <= 16 || (toothNum >= 51 && toothNum <= 65)
      };
    });
  }, [teeth]);

  const upperTeeth = processedTeeth.filter(t => t.isUpper).sort((a, b) => a.toothNumber - b.toothNumber);
  const lowerTeeth = processedTeeth.filter(t => !t.isUpper).sort((a, b) => b.toothNumber - a.toothNumber);

  return (
    <div className={`flex flex-col gap-6 rounded-[2.5rem] bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 p-8 shadow-inner ${className}`}>
      <header className="flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-600">
               <Activity size={20} />
            </div>
            <div>
               <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">{t(`${CH}.advancedTitle`)}</h3>
               <p className="text-xs font-bold text-slate-900 dark:text-white">{t(`${CH}.advancedSubtitle`)}</p>
            </div>
         </div>
         
         <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
            <div className="flex items-center gap-1.5">
               <div className="h-2 w-2 rounded-full bg-emerald-500" />
               <span className="text-slate-500">{t(`${CH}.healthy`)}</span>
            </div>
            <div className="flex items-center gap-1.5">
               <motion.div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
               <span className="text-slate-500">{t(`${CH}.bopPlus`)}</span>
            </div>
         </div>
      </header>

      {/* Main Perio Grid */}
      <div className="relative space-y-12 py-4">
         {/* Upper Arch */}
         <div className="flex justify-center gap-2">
            {upperTeeth.map((t, i) => (
              <PerioToothNode 
                key={t.toothNumber} 
                tooth={t} 
                isSelected={selectedToothId === String(t.toothNumber)}
                isHovered={hoveredTooth === t.toothNumber}
                onHover={setHoveredTooth}
                onSelect={() => onToothSelect?.(t as any, i)}
              />
            ))}
         </div>

         {/* Gingival Midline */}
         <div className="relative flex items-center px-12">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
            <div className="px-6 flex items-center gap-2">
               <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300 dark:text-slate-600">{t(`${CH}.baseline`)}</span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
         </div>

         {/* Lower Arch */}
         <div className="flex justify-center gap-2">
            {lowerTeeth.map((t, i) => (
              <PerioToothNode 
                key={t.toothNumber} 
                tooth={t} 
                isSelected={selectedToothId === String(t.toothNumber)}
                isHovered={hoveredTooth === t.toothNumber}
                onHover={setHoveredTooth}
                onSelect={() => onToothSelect?.(t as any, i)}
              />
            ))}
         </div>
      </div>

      {/* Clinical Insight Footer */}
      <footer className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
         <InsightItem icon={<Droplets size={14} />} label={t(`${CH}.bleedingIndex`)} value={`${Math.round((processedTeeth.filter(t => t.bleeding).length / (processedTeeth.length || 1)) * 100)}%`} color="text-rose-500" />
         <InsightItem icon={<AlertCircle size={14} />} label={t(`${CH}.riskSites`)} value={processedTeeth.filter(t => t.maxPocket > 4).length} color="text-amber-500" />
         <InsightItem icon={<Info size={14} />} label={t(`${CH}.avgPocket`)} value={`${(processedTeeth.reduce((a, b) => a + b.avgPocket, 0) / (processedTeeth.length || 1)).toFixed(1)}mm`} color="text-sky-500" />
      </footer>
    </div>
  );
}

function PerioToothNode({ tooth, isSelected, isHovered, onHover, onSelect }: any) {
  const severityColor = tooth.maxPocket > 5 ? 'bg-rose-500' : tooth.maxPocket > 3 ? 'bg-amber-500' : 'bg-emerald-500';
  
  return (
    <motion.div
      onMouseEnter={() => onHover(tooth.toothNumber)}
      onMouseLeave={() => onHover(null)}
      onClick={onSelect}
      className={`relative flex flex-col items-center gap-2 p-2 rounded-2xl transition-all cursor-pointer ${
        isSelected ? 'bg-white dark:bg-slate-900 shadow-xl ring-2 ring-sky-500/20 scale-110 z-10' : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'
      } ${tooth.isUpper ? 'flex-col' : 'flex-col-reverse'}`}
    >
      <span className="text-[10px] font-black text-slate-400 dark:text-slate-600">{tooth.toothNumber}</span>
      
      <div className="relative w-8 h-12 flex flex-col justify-center">
         {/* Simple Anatomical Representative Rect (can be upgraded to full SVG paths later) */}
         <div className={`w-full h-full rounded-md border-2 transition-colors ${
            isSelected ? 'border-sky-500 bg-sky-500/10' : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/40'
         }`} />
         
         {/* Pocket Depth Visual Overlay */}
         <div 
           className={`absolute left-0 right-0 ${tooth.isUpper ? 'bottom-0 rounded-b-md' : 'top-0 rounded-t-md'} transition-all duration-500 opacity-60 ${severityColor}`}
           style={{ height: `${Math.min(tooth.maxPocket * 10, 100)}%` }}
         />

         {/* Bleeding Indicator */}
         {tooth.bleeding && (
           <motion.div 
             animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
             transition={{ repeat: Infinity, duration: 2 }}
             className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-600 shadow-lg shadow-rose-600/50" 
           />
         )}
      </div>

      <AnimatePresence>
         {isHovered && (
           <motion.div
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: 10 }}
             className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 text-white px-2 py-1 text-[9px] font-bold z-20 shadow-2xl"
           >
             {tooth.maxPocket}mm · {tooth.shape}
           </motion.div>
         )}
      </AnimatePresence>
    </motion.div>
  );
}

function InsightItem({ icon, label, value, color }: any) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
       <div className={`h-8 w-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center ${color}`}>
          {icon}
       </div>
       <div>
          <p className="text-[10px] font-black uppercase text-slate-400">{label}</p>
          <p className="text-sm font-black text-slate-900 dark:text-white">{value}</p>
       </div>
    </div>
  );
}
