import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Download, Share2, ZoomIn, ZoomOut, Info, Zap } from 'lucide-react';
// useTranslation removed

export interface EnhancedBeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  title?: string;
  date?: string;
  notes?: string;
  className?: string;
}

export function EnhancedBeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = 'Initial State',
  afterLabel = 'Final Result',
  title = 'Aesthetic Transformation',
  date,
  notes,
  className = '',
}: EnhancedBeforeAfterSliderProps) {
  // t removed
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(1);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.min(100, Math.max(0, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const onMouseMove = (e: React.MouseEvent) => isDragging && handleMove(e.clientX);
  const onTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX);

  useEffect(() => {
    const handleUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleUp);
    return () => window.removeEventListener('mouseup', handleUp);
  }, []);

  return (
    <div className={`flex flex-col gap-6 rounded-[2.5rem] bg-white border border-slate-200 p-8 shadow-xl shadow-slate-200/40 ${className}`}>
      {/* Header with Luxury Typography */}
      <header className="flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-600">
               <Zap size={24} />
            </div>
            <div>
               <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Clinical Transformation</h3>
               <p className="text-xl font-black text-slate-900">{title}</p>
            </div>
         </div>
         
         <div className="flex items-center gap-2">
            <button className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 hover:text-sky-500 transition-colors">
               <Share2 size={18} />
            </button>
            <button className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 hover:text-sky-500 transition-colors">
               <Download size={18} />
            </button>
         </div>
      </header>

      {/* The Immersive Slider Container */}
      <div 
        ref={containerRef}
        onMouseDown={() => setIsDragging(true)}
        onMouseMove={onMouseMove}
        onTouchStart={() => setIsDragging(true)}
        onTouchMove={onTouchMove}
        className="relative aspect-[16/9] w-full overflow-hidden rounded-[2rem] bg-slate-100 cursor-ew-resize group select-none shadow-2xl"
      >
         {/* Before Image Layer */}
         <div className="absolute inset-0">
            <motion.img 
              src={beforeImage} 
              animate={{ scale: zoom }}
              className="h-full w-full object-cover" 
            />
         </div>

         {/* After Image Layer (Clipped) */}
         <div 
           className="absolute inset-0 pointer-events-none"
           style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
         >
            <motion.img 
              src={afterImage} 
              animate={{ scale: zoom }}
              className="h-full w-full object-cover" 
            />
         </div>

         {/* Interactive Handle */}
         <div 
           className="absolute top-0 bottom-0 w-1 bg-white/40 backdrop-blur-md z-20 pointer-events-none"
           style={{ left: `${sliderPosition}%` }}
         >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
               <motion.div 
                 animate={{ scale: isDragging ? 1.2 : 1 }}
                 className="h-12 w-12 rounded-full bg-white shadow-2xl flex items-center justify-center border-4 border-sky-500 text-sky-500"
               >
                  <ChevronLeft size={16} />
                  <ChevronRight size={16} />
               </motion.div>
            </div>
         </div>

         {/* Floating Glass Labels */}
         <div className="absolute top-6 left-6 flex flex-col gap-1">
            <span className="px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-white">
               {beforeLabel}
            </span>
         </div>
         <div className="absolute top-6 right-6 flex flex-col gap-1">
            <span className="px-4 py-1.5 rounded-full bg-sky-500/60 backdrop-blur-xl border border-white/20 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-sky-500/20">
               {afterLabel}
            </span>
         </div>

         {/* Bottom Controls Overlay */}
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/40 backdrop-blur-xl p-2 rounded-2xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button onClick={() => setZoom(v => Math.max(v - 0.2, 1))} className="h-8 w-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white"><ZoomOut size={16} /></button>
            <div className="h-4 w-px bg-white/10 mx-1" />
            <span className="text-[10px] font-black text-white/60 uppercase tracking-tighter px-2">{Math.round(zoom * 100)}%</span>
            <div className="h-4 w-px bg-white/10 mx-1" />
            <button onClick={() => setZoom(v => Math.min(v + 0.2, 3))} className="h-8 w-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white"><ZoomIn size={16} /></button>
         </div>
      </div>

      {/* Case Metadata & Notes */}
      <footer className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
         <div className="flex flex-col gap-2">
            <p className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
               <Info size={12} /> Case Documentation
            </p>
            <p className="text-sm font-bold text-slate-600 leading-relaxed">
               {notes || "Comparison visualization generated for clinical documentation and aesthetic evaluation."}
            </p>
         </div>
         <div className="flex flex-col items-end gap-2">
            <div className="text-right">
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Analysis Date</p>
               <p className="text-sm font-black text-slate-900">{date || new Date().toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2 mt-2">
               {[25, 50, 75].map(p => (
                 <button 
                   key={p}
                   onClick={() => setSliderPosition(p)}
                   className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[9px] font-black text-slate-400 hover:text-sky-500 transition-colors"
                 >
                   {p}%
                 </button>
               ))}
            </div>
         </div>
      </footer>
    </div>
  );
}
