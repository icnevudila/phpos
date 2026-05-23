import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Users, Globe, ChevronRight, ShieldCheck, WifiOff } from "lucide-react";

import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { useKioskIdle } from "../hooks/useKioskIdle";
import { resolveClinic, type PortalClinic } from "../portal/services/portalApi";

export function KioskHomePage(): JSX.Element {
  const { slug = "" } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [clinic, setClinic] = useState<PortalClinic | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [online, setOnline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  const { idle, resetIdle } = useKioskIdle(
    Number(import.meta.env.VITE_KIOSK_IDLE_MS) || 120_000,
  );

  useEffect(() => {
    const onOnline = (): void => setOnline(true);
    const onOffline = (): void => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    let alive = true;
    void resolveClinic(slug)
      .then((c) => alive && setClinic(c))
      .catch(() => alive && setLoadError(true));
    return () => { alive = false; };
  }, [slug]);

  if (loadError || !clinic) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7f9] p-6">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold uppercase tracking-widest text-slate-400">{t("pages.kiosk.uplink", { defaultValue: "Uplink" })}</p>
        </div>
      </div>
    );
  }

  const portalLogin = `/${encodeURIComponent(slug)}/portal/login?kiosk=1`;

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-white text-white selection:bg-teal-500/30">
      {!online ? (
        <div
          role="alert"
          className="relative z-20 flex shrink-0 items-center justify-center gap-3 bg-amber-500 px-6 py-3 text-sm font-bold text-amber-950"
        >
          <WifiOff size={18} aria-hidden />
          {t("pages.kiosk.offlineBanner", { defaultValue: "Offline Banner" })}
        </div>
      ) : null}

      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-teal-500/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-600/10 blur-[150px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900" />
      </div>

      {/* Top Navigation */}
      <header className="relative z-10 flex items-center justify-between px-8 py-8 md:px-12">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-5"
        >
          <div className="h-16 w-16 rounded-[2rem] bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-2xl font-black shadow-2xl shadow-teal-500/20 ring-1 ring-white/20">
            {clinic.name[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight leading-none">{clinic.name}</h2>
            <div className="mt-1 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t("pages.kiosk.nodeActive", { defaultValue: "Node Active" })}</span>
            </div>
          </div>
        </motion.div>
        
        <div className="flex items-center gap-4">
          <LanguageSwitcher className="!bg-white/5 !border-white/10 !text-white hover:!bg-white/10" />
        </div>
      </header>

      {/* Main Kiosk Content */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl w-full text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-tight">
            {t("pages.kiosk.welcomeTitle", { defaultValue: "Welcome Title" })}<span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-300">{t("pages.kiosk.welcomeAccent", { defaultValue: "Welcome Accent" })}</span>
          </h1>
          <p className="text-lg md:text-xl font-bold text-slate-400 max-w-2xl mx-auto">
            {t("pages.kiosk.welcomeSub", { defaultValue: "Welcome Sub" })}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl">
          {/* Patient Intake Card */}
          <KioskCard 
            onClick={() => navigate(`/${slug}/kiosk/intake`)}
            icon={<ShieldCheck size={40} />}
            kicker={t("pages.kiosk.intakeKicker", { defaultValue: "Intake Kicker" })}
            title={t("pages.kiosk.intakeTitle", { defaultValue: "Intake Title" })}
            desc={t("pages.kiosk.intakeDesc", { defaultValue: "Intake Desc" })}
            color="from-teal-500/20 to-teal-600/5"
            border="border-teal-500/30"
            accent="text-teal-400"
            t={t}
          />

          {/* Patient Portal Card */}
          <KioskCard 
            to={portalLogin}
            icon={<User size={40} />}
            kicker={t("pages.kiosk.patientKicker", { defaultValue: "Patient Kicker" })}
            title={t("pages.kiosk.patientTitle", { defaultValue: "Patient Title" })}
            desc={t("pages.kiosk.patientDesc", { defaultValue: "Patient Desc" })}
            color="from-teal-400/20 to-teal-500/5"
            border="border-teal-400/30"
            accent="text-teal-300"
            t={t}
          />

          {/* Staff Portal Card */}
          <KioskCard 
            onClick={() => navigate("/login", { state: { from: { pathname: "/appointments" } } })}
            icon={<Users size={40} />}
            kicker={t("pages.kiosk.staffKicker", { defaultValue: "Staff Kicker" })}
            title={t("pages.kiosk.staffTitle", { defaultValue: "Staff Title" })}
            desc={t("pages.kiosk.staffDesc", { defaultValue: "Staff Desc" })}
            color="from-slate-500/20 to-slate-600/5"
            border="border-slate-500/30"
            accent="text-slate-300"
            t={t}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 flex flex-col items-center gap-6 px-8 py-10 border-t border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{t("pages.kiosk.securityBadge", { defaultValue: "Security Badge" })}</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{t("pages.kiosk.uplinkStatus", { defaultValue: "Uplink Status" })}</span>
          </div>
        </div>
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em]">
          {t("pages.kiosk.engineV", { defaultValue: "Engine V" })}
        </p>
      </footer>

      {idle ? (
        <button
          type="button"
          aria-label={t("pages.kiosk.touchToStart", { defaultValue: "Touch To Start" })}
          onClick={resetIdle}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-md p-8 text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg space-y-6"
          >
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-teal-500 to-teal-600 text-3xl font-black shadow-2xl">
              {clinic.name[0]?.toUpperCase()}
            </div>
            <h2 className="text-3xl font-black tracking-tight">{t("pages.kiosk.idleTitle", { defaultValue: "Idle Title" })}</h2>
            <p className="text-lg font-bold text-slate-400">{t("pages.kiosk.idleHint", { defaultValue: "Idle Hint" })}</p>
            <span className="inline-block rounded-2xl bg-white/10 px-8 py-4 text-xs font-black uppercase tracking-widest text-white">
              {t("pages.kiosk.touchToStart", { defaultValue: "Touch To Start" })}
            </span>
          </motion.div>
        </button>
      ) : null}
    </div>
  );
}

function KioskCard({ to, onClick, icon, kicker, title, desc, color, border, accent, t }: any) {
  const content = (
    <motion.div 
      whileHover={{ y: -15, scale: 1.03, rotateX: 2, rotateY: -2 }}
      whileTap={{ scale: 0.97 }}
      className={`relative h-full flex flex-col items-start p-12 rounded-[3.5rem] bg-gradient-to-br ${color} border-2 ${border} backdrop-blur-3xl transition-all duration-500 group cursor-pointer`}
    >
      <div className={`mb-10 h-24 w-24 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center ${accent} group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className={`text-xs font-black uppercase tracking-[0.3em] mb-4 ${accent}`}>{kicker}</p>
        <h3 className="text-4xl font-black tracking-tight mb-5 leading-tight">{title}</h3>
        <p className="text-xl text-slate-400 font-bold leading-relaxed">{desc}</p>
      </div>
      <div className="mt-12 flex items-center gap-3 text-sm font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">
        {t("pages.kiosk.beginCta", { defaultValue: "Begin Cta" })} <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
      </div>
    </motion.div>
  );

  return to ? <Link to={to} className="h-full">{content}</Link> : <div onClick={onClick} className="h-full">{content}</div>;
}
