import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, PenTool, RotateCcw, Lock, CheckCircle, FileText, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface ElectronicConsentProps {
  title: string;
  content: string;
  patientName: string;
  onSign: (signatureData: string) => void;
  className?: string;
}

const EC = "pages.patientDetail.electronicConsent";

export function ElectronicConsent({
  title,
  content,
  patientName,
  onSign,
  className = '',
}: ElectronicConsentProps) {
  const { t } = useTranslation();
  const canvasRef = useRef<SVGSVGElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState("");
  const [isSigned, setIsSigned] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const getPoint = (e: any) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    return { x, y };
  };

  const startDrawing = (e: any) => {
    if (isSigned) return;
    setIsDrawing(true);
    const { x, y } = getPoint(e);
    setCurrentPath(`M ${x} ${y}`);
  };

  const draw = (e: any) => {
    if (!isDrawing || isSigned) return;
    const { x, y } = getPoint(e);
    setCurrentPath(prev => `${prev} L ${x} ${y}`);
  };

  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentPath.length > 10) {
        setPoints(prev => [...prev, currentPath]);
    }
    setCurrentPath("");
  };

  const handleVerify = () => {
    if (points.length === 0) return;
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsSigned(true);
      onSign(points.join(" "));
    }, 1500);
  };

  const clear = () => {
    setPoints([]);
    setCurrentPath("");
    setIsSigned(false);
  };

  return (
    <div className={`flex flex-col gap-8 rounded-[2.5rem] bg-white border border-slate-200 p-10 shadow-2xl ${className}`}>
      {/* Header with Security Badge */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
         <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-600">
               <ShieldCheck size={32} />
            </div>
            <div>
               <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">{t(`${EC}.legalVerification`)}</h3>
               <p className="text-2xl font-black text-slate-900">{title}</p>
            </div>
         </div>
         <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
            <Lock size={14} className="text-teal-500" />
            <span className="text-[10px] font-black uppercase text-slate-500">{t(`${EC}.encrypted`)}</span>
         </div>
      </header>

      {/* Consent Content Box */}
      <div className="relative group">
         <div className="max-h-[300px] overflow-y-auto pr-4 custom-scrollbar text-sm font-bold text-slate-600 leading-relaxed bg-slate-50/50 p-8 rounded-3xl border border-slate-100">
            {content}
         </div>
         <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none rounded-b-3xl" />
      </div>

      {/* Signature Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between px-2">
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                  <PenTool size={12} /> Patient Signature
               </p>
               <button onClick={clear} className="text-[10px] font-black uppercase text-rose-500 hover:text-rose-600 flex items-center gap-1">
                  <RotateCcw size={10} /> {t('common.clear')}
               </button>
            </div>
            
            <div className="relative aspect-[3/1] w-full rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden group">
               <svg
                 ref={canvasRef}
                 onMouseDown={startDrawing}
                 onMouseMove={draw}
                 onMouseUp={endDrawing}
                 onMouseLeave={endDrawing}
                 onTouchStart={startDrawing}
                 onTouchMove={draw}
                 onTouchEnd={endDrawing}
                 className="absolute inset-0 h-full w-full cursor-crosshair"
               >
                 {points.map((p, i) => (
                   <path key={i} d={p} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-900" />
                 ))}
                 {currentPath && (
                   <path d={currentPath} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-900" />
                 )}
               </svg>
               
               <AnimatePresence>
                  {points.length === 0 && (
                    <motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                       <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">{t(`${EC}.drawHere`)}</p>
                    </motion.div>
                  )}
               </AnimatePresence>

               {isSigned && (
                 <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center gap-2">
                       <div className="h-12 w-12 rounded-full bg-teal-500 text-white flex items-center justify-center shadow-xl">
                          <CheckCircle size={24} />
                       </div>
                       <p className="text-[10px] font-black uppercase text-teal-600">{t(`${EC}.digitallyVerified`)}</p>
                    </motion.div>
                 </div>
               )}
            </div>
         </div>

         {/* Verification Controls */}
         <div className="lg:col-span-4 flex flex-col justify-end gap-4">
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
               <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{t(`${EC}.signedBy`)}</p>
               <p className="text-sm font-black text-slate-900">{patientName}</p>
               <div className="mt-2 h-px bg-slate-200" />
               <p className="text-[10px] font-bold text-slate-400 mt-2">
                  {t(`${EC}.timestamp`, { value: new Date().toLocaleString() })}
               </p>
            </div>

            <button
              onClick={handleVerify}
              disabled={points.length === 0 || isSigned || isVerifying}
              className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl ${ isSigned ? 'bg-teal-500 text-white shadow-teal-500/20' : 'bg-white text-white shadow-slate-900/20 disabled:opacity-50' }`}
            >
               {isVerifying ? (
                 <div className="flex items-center justify-center gap-2">
                    <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t(`${EC}.verifying`)}
                 </div>
               ) : isSigned ? t(`${EC}.verificationComplete`) : t(`${EC}.verifySeal`)}
            </button>
         </div>
      </div>

      {/* Footer Info */}
      <footer className="flex items-center justify-between pt-6 border-t border-slate-100">
         <div className="flex items-center gap-2 text-slate-400">
            <FileText size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {t(`${EC}.documentId`, { id: `TP-${Math.random().toString(36).substring(7).toUpperCase()}` })}
            </span>
         </div>
         <button className="flex items-center gap-2 text-[10px] font-black uppercase text-sky-500 hover:text-sky-600 transition-colors">
            <Download size={14} /> {t(`${EC}.downloadPdf`)}
         </button>
      </footer>
    </div>
  );
}
