import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, RotateCcw, Activity, Shield, Info, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface PainPoint {
  id: string;
  label: string;
  type: 'tmj' | 'muscle' | 'nerve' | 'bone';
  x: number;
  y: number;
}

export interface ClinicNotePoint {
  pointId: string;
  severity: 'mild' | 'moderate' | 'severe';
  notes?: string;
  date: string;
}

export interface TMJFaceAnatomyProps {
  selectedPoints?: string[];
  onPointSelect?: (pointId: string, severity: 'mild' | 'moderate' | 'severe') => void;
  onPointClear?: (pointId: string) => void;
  notes?: ClinicNotePoint[];
  className?: string;
  readOnly?: boolean;
}

const PAIN_POINTS: PainPoint[] = [
  { id: 'tmj-left', label: 'Left Temporomandibular Joint', type: 'tmj', x: 120, y: 155 },
  { id: 'tmj-right', label: 'Right Temporomandibular Joint', type: 'tmj', x: 280, y: 155 },
  { id: 'masseter-left', label: 'Left Masseter Muscle', type: 'muscle', x: 110, y: 190 },
  { id: 'masseter-right', label: 'Right Masseter Muscle', type: 'muscle', x: 290, y: 190 },
  { id: 'temporalis-left', label: 'Left Temporalis Muscle', type: 'muscle', x: 100, y: 100 },
  { id: 'temporalis-right', label: 'Right Temporalis Muscle', type: 'muscle', x: 300, y: 100 },
  { id: 'trigeminal-v2-left', label: 'Left Trigeminal (V2)', type: 'nerve', x: 140, y: 140 },
  { id: 'trigeminal-v2-right', label: 'Right Trigeminal (V2)', type: 'nerve', x: 260, y: 140 },
  { id: 'trigeminal-v3-left', label: 'Left Trigeminal (V3)', type: 'nerve', x: 130, y: 220 },
  { id: 'trigeminal-v3-right', label: 'Right Trigeminal (V3)', type: 'nerve', x: 270, y: 220 },
  { id: 'condyle-left', label: 'Left Mandibular Condyle', type: 'bone', x: 135, y: 165 },
  { id: 'condyle-right', label: 'Right Mandibular Condyle', type: 'bone', x: 265, y: 165 },
];

const SEVERITY_COLORS = {
  mild: { bg: 'bg-amber-400', text: 'text-amber-900', glow: 'shadow-amber-400/50', hex: '#fbbf24' },
  moderate: { bg: 'bg-orange-500', text: 'text-white', glow: 'shadow-orange-500/50', hex: '#f97316' },
  severe: { bg: 'bg-rose-600', text: 'text-white', glow: 'shadow-rose-600/50', hex: '#e11d48' },
};

const TYPE_COLORS = {
  tmj: '#0ea5e9',
  muscle: '#ec4899',
  nerve: '#a855f7',
  bone: '#f59e0b',
};

export function TMJFaceAnatomy({
  selectedPoints = [],
  onPointSelect,
  onPointClear,
  notes = [],
  className = '',
  readOnly = false
}: TMJFaceAnatomyProps) {
  const { t } = useTranslation();
  const [selectedSeverity, setSelectedSeverity] = useState<'mild' | 'moderate' | 'severe'>('moderate');
  const [activePoint, setActivePoint] = useState<string | null>(null);

  const notesByPoint = useMemo(() => {
    const map: Record<string, ClinicNotePoint> = {};
    notes.forEach(n => map[n.pointId] = n);
    return map;
  }, [notes]);

  const handlePointClick = (pointId: string) => {
    if (readOnly) return;
    if (selectedPoints.includes(pointId)) {
      onPointClear?.(pointId);
    } else {
      onPointSelect?.(pointId, selectedSeverity);
    }
  };

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px] ${className}`}>
      {/* 3D-Like Anatomy Canvas */}
      <div className="lg:col-span-7 relative flex items-center justify-center rounded-[2.5rem] bg-slate-50 border border-slate-200 overflow-hidden shadow-inner p-6">
        <svg viewBox="0 0 400 400" className="w-full h-full max-w-[400px] drop-shadow-2xl">
          <defs>
            <radialGradient id="headGrad" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="rgba(226, 232, 240, 0.4)" />
              <stop offset="100%" stopColor="rgba(203, 213, 225, 0.1)" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Realistic Face Silhouette */}
          <path 
            d="M 200,40 C 140,40 100,80 100,160 C 100,240 140,340 200,340 C 260,340 300,240 300,160 C 300,80 260,40 200,40 Z" 
            fill="url(#headGrad)" 
            stroke="#e2e8f0"
            strokeWidth="1.5" 
          />
          
          {/* Internal Structures - Simplified Anatomical Landmarks */}
          <g opacity="0.4" stroke="#cbd5e1">
            {/* Zygomatic Arches */}
            <path d="M 120,150 Q 200,160 280,150" fill="none" stroke="currentColor" strokeWidth="1" />
            {/* Mandible */}
            <path d="M 130,160 Q 200,300 270,160" fill="none" stroke="currentColor" strokeWidth="2" />
            {/* Midline */}
            <line x1="200" y1="40" x2="200" y2="340" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
          </g>

          {/* Pain Markers */}
          {PAIN_POINTS.map((point) => {
            const note = notesByPoint[point.id];
            const isSelected = selectedPoints.includes(point.id);
            const severity = note?.severity;
            const color = severity ? SEVERITY_COLORS[severity].hex : TYPE_COLORS[point.type];
            
            return (
              <motion.g 
                key={point.id} 
                className="cursor-pointer"
                onMouseEnter={() => setActivePoint(point.id)}
                onMouseLeave={() => setActivePoint(null)}
                onClick={() => handlePointClick(point.id)}
                whileHover={{ scale: 1.1 }}
              >
                {/* Visual Feedback Circle */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.circle
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.2 }}
                      exit={{ scale: 0, opacity: 0 }}
                      cx={point.x} cy={point.y} r={isSelected && severity === 'severe' ? 24 : 18}
                      fill={color}
                    />
                  )}
                </AnimatePresence>

                {/* Core Marker */}
                <circle 
                  cx={point.x} cy={point.y} r="8" 
                  fill={color} 
                  stroke="white" strokeWidth="2"
                  className={isSelected ? "shadow-lg" : "opacity-60"}
                />
                
                {/* Active Ripple Animation for High Severity */}
                {isSelected && severity === 'severe' && (
                  <motion.circle
                    cx={point.x} cy={point.y} r="8"
                    stroke={color}
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{ scale: 3, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                )}

                {/* Label Tooltip - Subtle */}
                {(activePoint === point.id || isSelected) && (
                  <foreignObject x={point.x + 12} y={point.y - 12} width="150" height="40">
                    <div className="flex items-center gap-1.5 rounded-full bg-white/90 px-2 py-1 shadow-sm backdrop-blur-sm border border-slate-200">
                       <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                       <span className="text-[9px] font-semibold uppercase text-slate-700 whitespace-nowrap">
                          {point.label.replace(' Temporomandibular Joint', ' TMJ')}
                       </span>
                    </div>
                  </foreignObject>
                )}
              </motion.g>
            );
          })}
        </svg>

        {/* Floating Controls */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between pointer-events-none">
           <div className="flex items-center gap-2 pointer-events-auto rounded-full bg-white/80 p-1.5 shadow-lg backdrop-blur-md border border-slate-100">
              <button 
                onClick={() => setSelectedSeverity('mild')}
                className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase transition-all ${selectedSeverity === 'mild' ? 'bg-amber-400 text-amber-950' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                Mild
              </button>
              <button 
                onClick={() => setSelectedSeverity('moderate')}
                className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase transition-all ${selectedSeverity === 'moderate' ? 'bg-orange-500 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                Moderate
              </button>
              <button 
                onClick={() => setSelectedSeverity('severe')}
                className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase transition-all ${selectedSeverity === 'severe' ? 'bg-rose-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                Severe
              </button>
           </div>
           
           <button 
             onClick={() => selectedPoints.forEach(p => onPointClear?.(p))}
             className="pointer-events-auto flex items-center gap-2 rounded-full bg-teal-600 px-4 py-2 text-[10px] font-semibold uppercase text-white shadow-xl"
           >
             <RotateCcw size={12} /> {t('common.clear')}
           </button>
        </div>
      </div>

      {/* Diagnostic Insight Panel */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <section className="flex-1 rounded-[2rem] bg-white border border-slate-200 p-6 shadow-xl shadow-slate-200/40">
           <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-600">
                 <Activity size={20} />
              </div>
              <div>
                 <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Diagnostic Hub</h3>
                 <p className="text-xs font-bold text-slate-800">Active Findings</p>
              </div>
           </div>

           <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {selectedPoints.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                   <div className="h-12 w-12 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center mb-4 text-slate-300">
                      <Shield size={20} />
                   </div>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Points Marked</p>
                   <p className="text-[10px] text-slate-400 mt-1">Tap anatomical markers to record pain areas.</p>
                </div>
              ) : (
                selectedPoints.map(pid => {
                  const point = PAIN_POINTS.find(p => p.id === pid);
                  const note = notesByPoint[pid];
                  const severity = note?.severity || selectedSeverity;
                  const colors = SEVERITY_COLORS[severity];
                  
                  return (
                    <motion.div 
                      key={pid}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="group relative rounded-2xl bg-slate-50 border border-slate-100 p-4 transition-all hover:shadow-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                         <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: TYPE_COLORS[point?.type || 'tmj'] }} />
                            <span className="text-xs font-bold text-slate-800 uppercase tracking-tight">
                               {point?.label}
                            </span>
                         </div>
                         <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${colors.bg} ${colors.text} ${colors.glow} shadow-lg`}>
                            {severity}
                         </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <Info size={12} className="text-slate-400" />
                         <span className="text-[10px] font-bold text-slate-500">
                            {point?.type === 'tmj' ? 'Articular involvement detected' : 'Muscular tension identified'}
                         </span>
                      </div>
                      <button 
                        onClick={() => onPointClear?.(pid)}
                        className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                         <RotateCcw size={10} />
                      </button>
                    </motion.div>
                  );
                })
              )}
           </div>

           {selectedPoints.length > 0 && (
             <div className="mt-8 pt-6 border-t border-slate-100">
                <button className="w-full flex items-center justify-between rounded-2xl bg-teal-500 p-4 text-white shadow-xl shadow-teal-500/20 group overflow-hidden relative">
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                   <span className="text-xs font-semibold uppercase tracking-widest">Generate Analysis</span>
                   <ChevronRight size={16} />
                </button>
             </div>
           )}
        </section>
      </div>
    </div>
  );
}
