import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Maximize2, 
  Minimize2, 
  ChevronRight, 
  ChevronLeft,
  Star,
  CheckCircle2,
  Calendar,
  Wallet
} from "lucide-react";
import api from "../services/api";

export function PatientPresentationPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<any>(null);
  const [treatments, setTreatments] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    api.get(`/patients/${id}`).then((res: any) => setPatient(res.data));
    api.get(`/patients/${id}/treatments`).then((res: any) => setTreatments(res.data));
  }, [id]);

  // Group by phase
  const phases = treatments.reduce((acc: any, curr: any) => {
    const phaseName = curr.phase || t("pages.casePresentation.initialPhase");
    if (!acc[phaseName]) acc[phaseName] = [];
    acc[phaseName].push(curr);
    return acc;
  }, {});

  const phaseNames = Object.keys(phases);
  const currentPhaseName = phaseNames[currentIndex];
  const currentPhaseItems = phases[currentPhaseName] || [];

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (!patient) return null;

  return (
    <div className="fixed inset-0 bg-[#f5f7f9] text-white z-[9999] flex flex-col overflow-hidden selection:bg-indigo-500/30">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[150px] animate-pulse" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-sky-500/10 blur-[180px]" />
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-8 md:p-12 flex items-center justify-between">
         <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate(-1)}
              className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
            >
               <ArrowLeft size={24} />
            </button>
            <div>
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-1">
                 {t("pages.casePresentation.kicker")}
               </p>
               <h1 className="text-3xl font-black tracking-tighter">{patient.firstName} {patient.lastName}</h1>
            </div>
         </div>
         
         <div className="flex items-center gap-4">
            <button 
              onClick={toggleFullscreen}
              className="h-14 px-6 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all"
            >
               {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />} 
               {isFullscreen ? t("pages.casePresentation.exitFullscreen") : t("pages.casePresentation.fullscreen")}
            </button>
         </div>
      </header>

      {/* Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-12 pb-24">
         <AnimatePresence mode="wait">
            <motion.div 
              key={currentPhaseName}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.95 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
            >
               {/* Phase Left: Branding & Summary */}
               <div className="space-y-10">
                  <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-black uppercase tracking-widest">
                     <Star size={14} className="fill-indigo-300" /> Phase {currentIndex + 1} of {phaseNames.length}
                  </div>
                  
                  <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40">
                     {currentPhaseName}
                  </h2>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-md">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                          {t("pages.casePresentation.procedures")}
                        </p>
                        <p className="text-4xl font-black">{currentPhaseItems.length}</p>
                     </div>
                     <div className="p-8 rounded-[2.5rem] bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md">
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">
                          {t("pages.casePresentation.estimatedInvestment")}
                        </p>
                        <p className="text-4xl font-black text-indigo-400">
                           ₱{currentPhaseItems.reduce((s: number, i: { unitPrice: string; quantity: number }) => s + (Number(i.unitPrice) * i.quantity), 0).toLocaleString()}
                        </p>
                     </div>
                  </div>
               </div>

               {/* Phase Right: Items List */}
               <div className="space-y-4">
                  {currentPhaseItems.map((item: any, i: number) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + (i * 0.1) }}
                      className="group p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 hover:bg-white/5 hover:border-white/20 transition-all flex items-center justify-between"
                    >
                       <div className="flex items-center gap-6">
                          <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                             <CheckCircle2 size={24} />
                          </div>
                          <div>
                             <h4 className="text-xl font-bold">{item.procedure.replace(/_/g, " ")}</h4>
                             <p className="text-sm text-slate-500 font-medium">
                                {item.toothIds.length > 0
                                  ? t("pages.casePresentation.toothLabel", {
                                      teeth: item.toothIds.join(", "),
                                    })
                                  : t("pages.casePresentation.generalProcedure")}
                             </p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-lg font-black text-white/80">₱{Number(item.unitPrice).toLocaleString()}</p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-slate-500 font-bold">
                              {t("pages.casePresentation.qty", { n: item.quantity })}
                            </p>
                          )}
                       </div>
                    </motion.div>
                  ))}
               </div>
            </motion.div>
         </AnimatePresence>
      </main>

      {/* Footer Controls */}
      <footer className="relative z-10 p-12 flex items-center justify-between border-t border-white/5 bg-[#f5f7f9]/50 backdrop-blur-xl">
         <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 text-slate-500">
               <Calendar size={18} />
               <span className="text-xs font-bold">{t("pages.casePresentation.duration")}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-500">
               <Wallet size={18} />
               <span className="text-xs font-bold">{t("pages.casePresentation.installment")}</span>
            </div>
         </div>

         <div className="flex items-center gap-6">
            <button 
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(c => c - 1)}
              className="h-16 w-16 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 disabled:opacity-20 transition-all"
            >
               <ChevronLeft size={24} />
            </button>
            <div className="flex gap-2">
               {phaseNames.map((_, i) => (
                 <div key={i} className={`h-2 rounded-full transition-all duration-500 ${i === currentIndex ? "w-8 bg-indigo-500" : "w-2 bg-white/10"}`} />
               ))}
            </div>
            <button 
              disabled={currentIndex === phaseNames.length - 1}
              onClick={() => setCurrentIndex(c => c + 1)}
              className="h-16 w-16 rounded-full bg-indigo-600 flex items-center justify-center hover:bg-indigo-500 disabled:opacity-20 transition-all shadow-xl shadow-indigo-500/20"
            >
               <ChevronRight size={24} />
            </button>
         </div>
      </footer>
    </div>
  );
}
