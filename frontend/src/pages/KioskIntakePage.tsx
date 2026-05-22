import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Search, 
  User, 
  Phone, 
  ChevronRight, 
  CheckCircle2, 
  HeartPulse,
  ClipboardList,
  PenTool,
  Save
} from "lucide-react";
import { ElectronicConsent } from "../components/patient/ElectronicConsent";

type Step = "IDENTIFY" | "PROFILE" | "MEDICAL" | "CONSENT" | "SUCCESS";

export function KioskIntakePage() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("IDENTIFY");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [patient, setPatient] = useState<any>(null);

  // Identify patient mock
  const handleIdentify = async () => {
    setIsSearching(true);
    await new Promise(r => setTimeout(r, 1500));
    setPatient({
      id: "123",
      firstName: t("pages.kioskIntake.mockFirstName"),
      lastName: t("pages.kioskIntake.mockLastName"),
      phone: searchQuery,
      email: "juan@example.com",
    });
    setIsSearching(false);
    setStep("PROFILE");
  };

  const stepCurrent =
    step === "IDENTIFY" ? 1 : step === "PROFILE" ? 2 : step === "MEDICAL" ? 3 : step === "CONSENT" ? 4 : 4;

  const medicalConditions = useMemo(
    () => [
      t("pages.kioskIntake.condHypertension"),
      t("pages.kioskIntake.condDiabetes"),
      t("pages.kioskIntake.condAsthma"),
      t("pages.kioskIntake.condHeart"),
      t("pages.kioskIntake.condAllergies"),
      t("pages.kioskIntake.condPregnancy"),
      t("pages.kioskIntake.condSurgery"),
      t("pages.kioskIntake.condBloodThinners"),
    ],
    [t],
  );

  const profileFields = useMemo(
    () => [
      { label: t("pages.kioskIntake.fieldFirstName"), value: patient?.firstName, icon: <User /> },
      { label: t("pages.kioskIntake.fieldLastName"), value: patient?.lastName, icon: <User /> },
      { label: t("pages.kioskIntake.fieldMobile"), value: patient?.phone, icon: <Phone /> },
      { label: t("pages.kioskIntake.fieldEmail"), value: patient?.email, icon: <ClipboardList /> },
    ],
    [patient, t],
  );

  return (
    <div className="min-h-screen bg-white text-white flex flex-col">
      {/* Kiosk Header */}
      <header className="p-8 md:p-12 flex items-center justify-between relative z-10">
        <button 
          onClick={() => step === "IDENTIFY" ? navigate(`/${slug}/kiosk`) : setStep("IDENTIFY")}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-1">
            {t("pages.kioskIntake.headerKicker")}
          </p>
          <h2 className="text-xl font-black">
            {t("pages.kioskIntake.stepOf", { current: stepCurrent, total: 4 })}
          </h2>
        </div>
        <div className="w-14" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
        <AnimatePresence mode="wait">
          {step === "IDENTIFY" && (
            <motion.div 
              key="identify"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl w-full space-y-10"
            >
              <div className="text-center space-y-4">
                <div className="h-24 w-24 rounded-[2.5rem] bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-500 mx-auto">
                  <Search size={40} />
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight">{t("pages.kioskIntake.identifyTitle")}</h1>
                <p className="text-lg text-slate-400 font-bold">{t("pages.kioskIntake.identifySub")}</p>
              </div>

              <div className="relative group">
                <div className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-500 transition-colors">
                  <Phone size={28} />
                </div>
                <input 
                  type="text"
                  placeholder={t("pages.kioskIntake.phonePlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-24 w-full rounded-[2.5rem] bg-white/5 border-2 border-white/10 pl-24 pr-10 text-3xl font-black outline-none focus:border-teal-500 focus:bg-white/10 transition-all placeholder:text-slate-700"
                />
              </div>

              <button 
                onClick={handleIdentify}
                disabled={!searchQuery || isSearching}
                className="w-full h-24 rounded-[2.5rem] bg-teal-500 text-white text-xl font-black uppercase tracking-widest shadow-2xl shadow-teal-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-4"
              >
                {isSearching ? <div className="h-8 w-8 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : t("pages.kioskIntake.continue")}
                {!isSearching && <ChevronRight size={24} />}
              </button>
            </motion.div>
          )}

          {step === "PROFILE" && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl w-full space-y-12"
            >
              <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                  {t("pages.kioskIntake.profileWelcome", { name: patient?.firstName ?? "" })}
                </h1>
                <p className="text-lg text-slate-400 font-bold">{t("pages.kioskIntake.profileSub")}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profileFields.map((field, i) => (
                  <div key={i} className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      {field.icon} {field.label}
                    </p>
                    <input 
                      type="text" 
                      defaultValue={field.value} 
                      className="w-full bg-transparent text-xl font-black outline-none text-white focus:text-teal-400 transition-colors"
                    />
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setStep("MEDICAL")}
                className="w-full h-24 rounded-[2.5rem] bg-white text-slate-900 text-xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
              >
                {t("pages.kioskIntake.confirmNext")} <ChevronRight size={24} />
              </button>
            </motion.div>
          )}

          {step === "MEDICAL" && (
            <motion.div 
              key="medical"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-5xl w-full space-y-12"
            >
              <div className="text-center space-y-4">
                <div className="h-20 w-20 rounded-[2rem] bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mx-auto">
                  <HeartPulse size={32} />
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight">{t("pages.kioskIntake.medicalTitle")}</h1>
                <p className="text-lg text-slate-400 font-bold">{t("pages.kioskIntake.medicalSub")}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {medicalConditions.map((cond, i) => (
                  <label key={i} className="flex items-center gap-4 p-6 rounded-3xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all group">
                    <input type="checkbox" className="w-6 h-6 rounded-lg border-2 border-slate-700 bg-transparent checked:bg-teal-500 checked:border-teal-500 transition-all cursor-pointer" />
                    <span className="text-lg font-bold text-slate-300 group-hover:text-white transition-colors">{cond}</span>
                  </label>
                ))}
              </div>

              <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {t("pages.kioskIntake.otherConditions")}
                </p>
                <textarea
                  rows={3}
                  placeholder={t("pages.kioskIntake.otherPlaceholder")}
                  className="w-full bg-transparent text-xl font-bold outline-none text-white resize-none"
                />
              </div>

              <button 
                onClick={() => setStep("CONSENT")}
                className="w-full h-24 rounded-[2.5rem] bg-teal-500 text-white text-xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-teal-500/20"
              >
                {t("pages.kioskIntake.saveContinue")} <ChevronRight size={24} />
              </button>
            </motion.div>
          )}

          {step === "CONSENT" && (
            <motion.div 
              key="consent"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="max-w-5xl w-full"
            >
              <ElectronicConsent
                title={t("pages.kioskIntake.consentTitle")}
                patientName={`${patient?.firstName} ${patient?.lastName}`}
                content={t("pages.kioskIntake.consentBody")}
                onSign={() => setStep("SUCCESS")}
                className="!bg-slate-800 !border-white/10"
              />
            </motion.div>
          )}

          {step === "SUCCESS" && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl w-full text-center space-y-10"
            >
              <div className="relative">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12 }}
                  className="h-40 w-40 rounded-[3rem] bg-teal-500 flex items-center justify-center text-white mx-auto shadow-2xl shadow-teal-500/40"
                >
                  <CheckCircle2 size={80} />
                </motion.div>
                <div className="absolute inset-0 bg-teal-500/20 blur-[100px] -z-10" />
              </div>
              
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-black tracking-tight">{t("pages.kioskIntake.successTitle")}</h1>
                <p className="text-xl text-slate-400 font-bold">{t("pages.kioskIntake.successSub")}</p>
              </div>

              <button 
                onClick={() => navigate(`/${slug}/kiosk`)}
                className="px-12 h-20 rounded-[2rem] bg-white/5 border border-white/10 text-lg font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-4 mx-auto"
              >
                {t("pages.kioskIntake.done")}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Decorative elements */}
      <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-teal-500/5 blur-[120px] pointer-events-none" />
      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-600/5 blur-[120px] pointer-events-none" />
    </div>
  );
}
