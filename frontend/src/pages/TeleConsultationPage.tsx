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
    <div className="fixed inset-0 bg-white text-white z-[10000] flex flex-col overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-slate-900 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 p-5 flex items-center justify-between bg-slate-800/50 backdrop-blur-xl border-b border-white/5">
         <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
               <Video size={18} />
            </div>
            <div>
               <h1 className="text-base font-bold tracking-tight">Tele-Dental Consultation</h1>
               <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                  {isJoined ? `Live · ${formatTime(callDuration)}` : "Waiting for patient..."}
               </p>
            </div>
         </div>
         
         <div className="flex items-center gap-2.5">
            <div className="px-3 py-1.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
               <div className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
               {t("pages.teleConsultation.secureConnection")}
            </div>
         </div>
      </header>

      {/* Video Grid */}
      <main className="relative z-0 flex-1 p-5 grid grid-cols-1 lg:grid-cols-2 gap-4 items-center justify-center overflow-hidden">
         {/* Patient Video (Large) */}
         <div className="relative h-full w-full rounded-2xl bg-slate-800 border border-white/5 overflow-hidden group">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 space-y-5">
               <div className="h-28 w-28 rounded-full bg-slate-700 flex items-center justify-center text-slate-500 border-4 border-slate-600/50">
                  <User size={56} />
               </div>
               <div>
                  <h3 className="text-xl font-bold">{t("pages.teleConsultation.patientNameFallback")}</h3>
                  <p className="text-slate-500 font-medium mt-1 text-sm">{t("pages.teleConsultation.connectingCamera")}</p>
               </div>
            </div>
            {/* Visual Effect */}
            <div className="absolute inset-0 bg-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
         </div>

         {/* Doctor Video (Small/Self View) */}
         <div className="relative h-full w-full rounded-2xl bg-slate-800 border border-white/5 overflow-hidden shadow-2xl">
            {!isVideoOff ? (
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center">
                 <div className="absolute inset-0 bg-white/20" />
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-700 text-slate-400">
                 <VideoOff size={44} />
              </div>
            )}
            <div className="absolute bottom-5 left-5 px-3 py-1.5 rounded-lg bg-white/80 backdrop-blur-md text-[10px] font-semibold uppercase tracking-wider border border-white/10">
               {t("pages.teleConsultation.selfView", {
                 name: t("pages.teleConsultation.selfViewFallback"),
               })}
            </div>
         </div>
      </main>

      {/* Controls */}
      <footer className="relative z-10 p-8 flex items-center justify-center gap-4 bg-gradient-to-t from-slate-900 to-transparent">
         <button 
           onClick={() => setIsMuted(!isMuted)}
           className={`h-16 w-16 rounded-full flex items-center justify-center transition-all ${isMuted ? "bg-rose-500 text-white" : "bg-white/10 hover:bg-white/20 border border-white/10"}`}
         >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
         </button>

         <button 
           onClick={() => setIsVideoOff(!isVideoOff)}
           className={`h-16 w-16 rounded-full flex items-center justify-center transition-all ${isVideoOff ? "bg-rose-500 text-white" : "bg-white/10 hover:bg-white/20 border border-white/10"}`}
         >
            {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
         </button>

         <button 
           onClick={() => {
             if (!isJoined) setIsJoined(true);
             else {
               if (confirm(t("pages.teleConsultation.endConfirm"))) navigate(-1);
             }
           }}
           className={`h-16 px-10 rounded-full flex items-center gap-3 transition-all shadow-xl ${isJoined ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20" : "bg-teal-600 hover:bg-teal-700 shadow-teal-600/20"}`}
         >
            {isJoined ? <PhoneOff size={24} /> : <Video size={24} />}
            <span className="text-xs font-bold uppercase tracking-wider">
               {isJoined ? t("pages.teleConsultation.endCall") : t("pages.teleConsultation.startCall")}
            </span>
         </button>

         <div className="w-px h-10 bg-white/10 mx-2" />

         <button className="h-16 w-16 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center">
            <MessageSquare size={24} />
         </button>

         <button className="h-16 w-16 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center">
            <Monitor size={24} />
         </button>

         <button className="h-16 w-16 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center">
            <Settings size={24} />
         </button>
      </footer>
    </div>
  );
}
