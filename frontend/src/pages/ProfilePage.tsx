import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
// motion removed
import { toast } from "sonner";
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Calendar, 
  Link as IconLink, 
  Save, 
  Camera,
  ShieldCheck,
  Building,
  GraduationCap,
  Activity,
  Globe,
  RefreshCw,
  ChevronRight
} from "lucide-react";

import api from "../services/api";
import { getUser } from "../hooks/authTokens";

const WEEKDAY_I18N: Record<string, string> = {
  Mon: "pages.profile.dayMon",
  Tue: "pages.profile.dayTue",
  Wed: "pages.profile.dayWed",
  Thu: "pages.profile.dayThu",
  Fri: "pages.profile.dayFri",
  Sat: "pages.profile.daySat",
  Sun: "pages.profile.daySun",
};

export function ProfilePage(): JSX.Element {
  const { t } = useTranslation();
  const profile = getUser();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState({
    firstName: "",
    lastName: "",
    email: "",
    degree: "",
    affiliations: "",
    phone: "",
    specialization: "",
  });

  useEffect(() => {
    async function load() {
      if (!profile?.id) return;
      try {
        const res = await api.get(`/users/${profile.id}`);
        const u = res.data;
        setDraft({
          firstName: u.firstName || "",
          lastName: u.lastName || "",
          email: u.email || "",
          degree: u.degree || "",
          affiliations: u.affiliations || "",
          phone: u.phone || "",
          specialization: u.specialization || "",
        });
      } catch (err) {
        toast.error(t("pages.profile.loadFailed"));
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [profile?.id]);

  const handleSave = async () => {
    setBusy(true);
    try {
      await api.put(`/users/${profile?.id}`, draft);
      toast.success(t("pages.profile.updated"));
    } catch (err) {
      toast.error(t("pages.profile.updateFailed"));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Activity className="h-10 w-10 animate-spin text-emerald-500" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Syncing Profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full pb-24 bg-[#fafbfc] dark:bg-slate-950">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10 space-y-12 pt-10">
        
        {/* Profile Header */}
        <header className="flex flex-col gap-10 lg:flex-row lg:items-center justify-between">
           <div className="flex flex-col lg:flex-row items-center gap-8 text-center lg:text-left">
              <div className="relative group">
                 <div className="absolute -inset-2 bg-emerald-500/20 rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition-all" />
                 <div className="relative h-40 w-40 rounded-[3rem] bg-white dark:bg-slate-900 shadow-2xl flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-800">
                    <User size={80} className="text-slate-200 dark:text-slate-700" />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer">
                       <Camera className="text-white" size={32} />
                    </div>
                 </div>
              </div>
              <div className="space-y-2">
                 <div className="flex items-center justify-center lg:justify-start gap-3">
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                      {draft.firstName} {draft.lastName}
                    </h1>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-white shadow-lg shadow-sky-500/20">
                       <ShieldCheck size={14} />
                    </span>
                 </div>
                 <p className="text-lg font-bold text-emerald-500 uppercase tracking-widest">
                   {draft.degree || t("pages.profile.degreeFallback")}
                 </p>
                 <div className="flex flex-wrap justify-center lg:justify-start items-center gap-6 text-xs font-black text-slate-400 uppercase tracking-widest">
                    <span className="flex items-center gap-2">
                       <Mail size={14} className="opacity-40" />
                       {draft.email}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-slate-200" />
                    <span className="flex items-center gap-2">
                       <Phone size={14} className="opacity-40" />
                       {draft.phone || t("pages.profile.noPhone")}
                    </span>
                 </div>
              </div>
           </div>

           <div className="flex items-center justify-center gap-4">
              <button
                disabled={busy}
                onClick={handleSave}
                className="flex h-16 items-center gap-3 rounded-[1.5rem] bg-slate-900 dark:bg-white px-10 text-xs font-black uppercase tracking-widest text-white dark:text-slate-900 shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
              >
                {busy ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                {busy ? t("pages.profile.saving") : t("pages.profile.saveProfile")}
              </button>
           </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
           {/* Left Column: Form */}
           <div className="lg:col-span-8 space-y-12">
              <section className="rounded-[3.5rem] bg-white dark:bg-slate-900 p-10 shadow-xl shadow-slate-200/40 dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-800">
                 <div className="flex items-center gap-4 mb-12">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400">
                       <Briefcase size={24} />
                    </div>
                    <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">{t("pages.profile.professionalIdentity")}</h2>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">First Name</label>
                       <input 
                         value={draft.firstName}
                         onChange={e => setDraft({...draft, firstName: e.target.value})}
                         className="h-16 w-full rounded-2xl bg-slate-50 dark:bg-slate-800/50 px-6 text-sm font-bold outline-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-sky-500 transition-all" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">{t("pages.profile.lastName")}</label>
                       <input 
                         value={draft.lastName}
                         onChange={e => setDraft({...draft, lastName: e.target.value})}
                         className="h-16 w-full rounded-2xl bg-slate-50 dark:bg-slate-800/50 px-6 text-sm font-bold outline-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-sky-500 transition-all" 
                       />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">{t("pages.profile.professionalDegree")}</label>
                       <div className="relative">
                          <GraduationCap className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                          <input 
                            value={draft.degree}
                            onChange={e => setDraft({...draft, degree: e.target.value})}
                            placeholder={t("pages.profile.degreePlaceholder")}
                            className="h-16 w-full rounded-2xl bg-slate-50 dark:bg-slate-800/50 pl-16 pr-6 text-sm font-bold outline-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-sky-500 transition-all" 
                          />
                       </div>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">{t("pages.profile.clinicalAffiliations")}</label>
                       <div className="relative">
                          <Building className="absolute left-6 top-6 text-slate-300" size={20} />
                          <textarea 
                            value={draft.affiliations}
                            onChange={e => setDraft({...draft, affiliations: e.target.value})}
                            className="h-32 w-full rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 pl-16 pr-6 py-5 text-sm font-bold outline-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-sky-500 transition-all resize-none"
                            placeholder={t("pages.profile.affiliationsPlaceholder")}
                          />
                       </div>
                    </div>
                 </div>
              </section>

              {/* Public Reach Section */}
              <section className="rounded-[3.5rem] bg-slate-900 p-10 shadow-2xl relative overflow-hidden group border border-slate-800">
                 <div className="absolute -top-20 -right-20 h-64 w-64 bg-sky-500/10 rounded-full blur-[100px]" />
                 <div className="flex items-center gap-4 mb-10 relative z-10">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-xl shadow-sky-500/20">
                       <Globe size={24} />
                    </div>
                    <h2 className="text-xl font-black tracking-tight text-white">{t("pages.profile.patientDiscovery")}</h2>
                 </div>

                 <div className="bg-slate-800/50 rounded-[2rem] p-8 border border-slate-700 relative z-10">
                    <p className="text-xs font-bold text-slate-400 leading-relaxed italic mb-6">
                       {t("pages.profile.patientDiscoveryHint")}
                    </p>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                       <div className="flex h-14 flex-1 items-center gap-3 rounded-xl bg-slate-950 px-6 text-xs font-bold text-slate-500 border border-slate-800">
                          <IconLink size={16} className="opacity-40" />
                          <span>visit.dentease.ph/doctor/</span>
                          <span className="text-white">{profile?.id?.slice(0, 8)}</span>
                       </div>
                       <button className="h-14 px-8 rounded-xl bg-sky-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all">
                          {t("pages.profile.copyLink")}
                       </button>
                    </div>
                 </div>
              </section>
           </div>

           {/* Right Column: Schedule & Quick Stats */}
           <div className="lg:col-span-4 space-y-12">
              <section className="rounded-[3rem] bg-white dark:bg-slate-900 p-8 shadow-xl ring-1 ring-slate-100 dark:ring-slate-800">
                 <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                       <Calendar size={18} className="text-slate-400" />
                       <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">{t("pages.profile.clinicalHours")}</h3>
                    </div>
                    <button type="button" className="text-[10px] font-black text-sky-500 uppercase tracking-widest hover:underline">
                      {t("pages.profile.edit")}
                    </button>
                 </div>

                 <div className="space-y-4">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                      <div key={day} className="flex items-center justify-between group">
                         <div className="flex items-center gap-4">
                            <span className="text-xs font-black text-slate-400 w-8">{t(WEEKDAY_I18N[day] ?? day)}</span>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                              {t("pages.profile.hoursDemo")}
                            </span>
                         </div>
                         <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                      </div>
                    ))}
                 </div>
              </section>

              <section className="rounded-[3rem] bg-white dark:bg-slate-900 p-8 shadow-xl ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden relative">
                 <div className="flex items-center gap-3 mb-8">
                    <Activity size={18} className="text-slate-400" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                      {t("pages.profile.efficiencyPulse")}
                    </h3>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">
                         {t("pages.profile.retention")}
                       </p>
                       <p className="text-2xl font-black text-slate-900 dark:text-white">92%</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">
                         {t("pages.profile.nps")}
                       </p>
                       <p className="text-2xl font-black text-slate-900 dark:text-white">4.9</p>
                    </div>
                 </div>

                 <div className="mt-8 pt-8 border-t border-slate-50 dark:border-slate-800">
                    <button className="w-full flex items-center justify-between group">
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-sky-500 transition-colors">Detailed Analytics</span>
                       <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-all" />
                    </button>
                 </div>
              </section>

              <div className="text-center py-6">
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                    {t("pages.profile.versionFooter")}
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
