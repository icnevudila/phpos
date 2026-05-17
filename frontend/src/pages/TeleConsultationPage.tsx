import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  PhoneOff, 
  MessageSquare, 
  User,
  Settings,
  Monitor
} from "lucide-react";
export function TeleConsultationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isJoined) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isJoined]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-950 text-white z-[10000] flex flex-col overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-slate-950 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 p-6 flex items-center justify-between bg-slate-900/50 backdrop-blur-xl border-b border-white/5">
         <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
               <Video size={20} />
            </div>
            <div>
               <h1 className="text-lg font-black tracking-tight">Tele-Dental Consultation</h1>
               <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                  {isJoined ? `Live · ${formatTime(callDuration)}` : "Waiting for patient..."}
               </p>
            </div>
         </div>
         
         <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
               <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
               {t("pages.teleConsultation.secureConnection")}
            </div>
         </div>
      </header>

      {/* Video Grid */}
      <main className="relative z-0 flex-1 p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-center justify-center overflow-hidden">
         {/* Patient Video (Large) */}
         <div className="relative h-full w-full rounded-[3rem] bg-slate-900 border border-white/5 overflow-hidden group">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 space-y-6">
               <div className="h-32 w-32 rounded-full bg-slate-800 flex items-center justify-center text-slate-600 border-4 border-slate-700/50">
                  <User size={64} />
               </div>
               <div>
                  <h3 className="text-2xl font-black">{t("pages.teleConsultation.patientNameFallback")}</h3>
                  <p className="text-slate-500 font-medium mt-1">{t("pages.teleConsultation.connectingCamera")}</p>
               </div>
            </div>
            {/* Visual Effect */}
            <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
         </div>

         {/* Doctor Video (Small/Self View) */}
         <div className="relative h-full w-full rounded-[3rem] bg-slate-900 border border-white/5 overflow-hidden shadow-2xl">
            {!isVideoOff ? (
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center">
                 <div className="absolute inset-0 bg-slate-950/20" />
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800 text-slate-500">
                 <VideoOff size={48} />
              </div>
            )}
            <div className="absolute bottom-6 left-6 px-4 py-2 rounded-xl bg-slate-900/80 backdrop-blur-md text-[10px] font-black uppercase tracking-widest border border-white/10">
               {t("pages.teleConsultation.selfView", {
                 name: t("pages.teleConsultation.selfViewFallback"),
               })}
            </div>
         </div>
      </main>

      {/* Controls */}
      <footer className="relative z-10 p-10 flex items-center justify-center gap-6 bg-gradient-to-t from-slate-950 to-transparent">
         <button 
           onClick={() => setIsMuted(!isMuted)}
           className={`h-20 w-20 rounded-full flex items-center justify-center transition-all ${isMuted ? "bg-rose-500 text-white" : "bg-white/10 hover:bg-white/20 border border-white/10"}`}
         >
            {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
         </button>

         <button 
           onClick={() => setIsVideoOff(!isVideoOff)}
           className={`h-20 w-20 rounded-full flex items-center justify-center transition-all ${isVideoOff ? "bg-rose-500 text-white" : "bg-white/10 hover:bg-white/20 border border-white/10"}`}
         >
            {isVideoOff ? <VideoOff size={28} /> : <Video size={28} />}
         </button>

         <button 
           onClick={() => {
             if (!isJoined) setIsJoined(true);
             else {
               if (confirm(t("pages.teleConsultation.endConfirm"))) navigate(-1);
             }
           }}
           className={`h-20 px-12 rounded-full flex items-center gap-4 transition-all shadow-xl ${isJoined ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20"}`}
         >
            {isJoined ? <PhoneOff size={28} /> : <Video size={28} />}
            <span className="text-xs font-black uppercase tracking-[0.2em]">
               {isJoined ? t("pages.teleConsultation.endCall") : t("pages.teleConsultation.startCall")}
            </span>
         </button>

         <div className="w-px h-12 bg-white/10 mx-4" />

         <button className="h-20 w-20 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center">
            <MessageSquare size={28} />
         </button>

         <button className="h-20 w-20 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center">
            <Monitor size={28} />
         </button>

         <button className="h-20 w-20 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center">
            <Settings size={28} />
         </button>
      </footer>
    </div>
  );
}
