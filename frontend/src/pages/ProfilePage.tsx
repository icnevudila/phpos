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
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 rounded-xl bg-teal-50 flex items-center justify-center">
          <RefreshCw className="h-4 w-4 animate-spin text-teal-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full pb-24 bg-[#f5f7f9]">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10 space-y-8 pt-8">
        
        {/* Profile Header */}
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center justify-between">
           <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="relative group">
                 <div className="absolute -inset-2 bg-teal-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all" />
                 <div className="relative h-24 w-24 rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 flex items-center justify-center overflow-hidden">
                    <User size={48} className="text-slate-200" />
                    <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer">
                       <Camera className="text-white" size={24} />
                    </div>
                 </div>
              </div>
              <div className="space-y-1">
                 <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-800">
                      {draft.firstName} {draft.lastName}
                    </h1>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-500 text-white shadow-sm">
                       <ShieldCheck size={12} />
                    </span>
                 </div>
                 <p className="text-sm font-semibold text-teal-500 uppercase tracking-widest">
                   {draft.degree || t("pages.profile.degreeFallback")}
                 </p>
                 <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 text-xs font-medium text-slate-400 uppercase tracking-widest">
                    <span className="flex items-center gap-2">
                       <Mail size={12} className="opacity-40" />
                       {draft.email}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-slate-200" />
                    <span className="flex items-center gap-2">
                       <Phone size={12} className="opacity-40" />
                       {draft.phone || t("pages.profile.noPhone")}
                    </span>
                 </div>
              </div>
           </div>

           <div className="flex items-center justify-center gap-3">
              <button
                disabled={busy}
                onClick={handleSave}
                className="btn-primary flex items-center gap-2 disabled:opacity-60"
              >
                {busy ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                {busy ? t("pages.profile.saving") : t("pages.profile.saveProfile")}
              </button>
           </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           {/* Left Column: Form */}
           <div className="lg:col-span-8 space-y-6">
              <section className="card">
                 <div className="flex items-center gap-3 mb-8">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                       <Briefcase size={20} />
                    </div>
                    <h2 className="text-base font-semibold text-slate-800">{t("pages.profile.professionalIdentity")}</h2>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 ml-2 mb-1 block">First Name</label>
                       <input 
                         value={draft.firstName}
                         onChange={e => setDraft({...draft, firstName: e.target.value})}
                         className="h-12 w-full rounded-xl bg-slate-50 px-4 text-sm font-medium outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-teal-500 transition-all" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 ml-2 mb-1 block">{t("pages.profile.lastName")}</label>
                       <input 
                         value={draft.lastName}
                         onChange={e => setDraft({...draft, lastName: e.target.value})}
                         className="h-12 w-full rounded-xl bg-slate-50 px-4 text-sm font-medium outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-teal-500 transition-all" 
                       />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                       <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 ml-2 mb-1 block">{t("pages.profile.professionalDegree")}</label>
                       <div className="relative">
                          <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                          <input 
                            value={draft.degree}
                            onChange={e => setDraft({...draft, degree: e.target.value})}
                            placeholder={t("pages.profile.degreePlaceholder")}
                            className="h-12 w-full rounded-xl bg-slate-50 pl-12 pr-4 text-sm font-medium outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-teal-500 transition-all" 
                          />
                       </div>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                       <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 ml-2 mb-1 block">{t("pages.profile.clinicalAffiliations")}</label>
                       <div className="relative">
                          <Building className="absolute left-4 top-4 text-slate-300" size={18} />
                          <textarea 
                            value={draft.affiliations}
                            onChange={e => setDraft({...draft, affiliations: e.target.value})}
                            className="h-28 w-full rounded-2xl bg-slate-50 pl-12 pr-4 py-4 text-sm font-medium outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-teal-500 transition-all resize-none"
                            placeholder={t("pages.profile.affiliationsPlaceholder")}
                          />
                       </div>
                    </div>
                 </div>
              </section>

              {/* Public Reach Section */}
              <section className="card bg-slate-800 relative overflow-hidden">
                 <div className="absolute -top-20 -right-20 h-64 w-64 bg-teal-500/10 rounded-full blur-[100px]" />
                 <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 text-white shadow-sm">
                       <Globe size={20} />
                    </div>
                    <h2 className="text-base font-semibold text-white">{t("pages.profile.patientDiscovery")}</h2>
                 </div>

                 <div className="bg-slate-700/50 rounded-2xl p-6 border border-slate-700 relative z-10">
                    <p className="text-xs font-medium text-slate-400 leading-relaxed italic mb-4">
                       {t("pages.profile.patientDiscoveryHint")}
                    </p>
                    <div className="flex flex-col md:flex-row items-center gap-3">
                       <div className="flex h-12 flex-1 items-center gap-2 rounded-xl bg-white px-4 text-xs font-medium text-slate-500 border border-slate-700">
                          <IconLink size={14} className="opacity-40" />
                          <span>visit.dentease.ph/doctor/</span>
                          <span className="text-white">{profile?.id?.slice(0, 8)}</span>
                       </div>
                       <button className="h-12 px-6 rounded-xl bg-teal-500 text-white text-xs font-semibold uppercase tracking-widest shadow-sm hover:scale-105 transition-all">
                          {t("pages.profile.copyLink")}
                       </button>
                    </div>
                 </div>
              </section>
           </div>

           {/* Right Column: Schedule & Quick Stats */}
           <div className="lg:col-span-4 space-y-6">
              <section className="card">
                 <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                       <Calendar size={16} className="text-slate-400" />
                       <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">{t("pages.profile.clinicalHours")}</h3>
                    </div>
                    <button type="button" className="text-xs font-semibold text-teal-500 uppercase tracking-widest hover:underline">
                      {t("pages.profile.edit")}
                    </button>
                 </div>

                 <div className="space-y-3">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                      <div key={day} className="flex items-center justify-between group">
                         <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-slate-400 w-8">{t(WEEKDAY_I18N[day] ?? day)}</span>
                            <span className="text-sm font-medium text-slate-800">
                              {t("pages.profile.hoursDemo")}
                            </span>
                         </div>
                         <div className="h-2 w-2 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.4)]" />
                      </div>
                    ))}
                 </div>
              </section>

              <section className="card overflow-hidden">
                 <div className="flex items-center gap-2 mb-6">
                    <Activity size={16} className="text-slate-400" />
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                      {t("pages.profile.efficiencyPulse")}
                    </h3>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-3">
                    <div className="stat-card">
                       <p className="stat-card-label">{t("pages.profile.retention")}</p>
                       <p className="stat-card-value">92%</p>
                    </div>
                    <div className="stat-card">
                       <p className="stat-card-label">{t("pages.profile.nps")}</p>
                       <p className="stat-card-value">4.9</p>
                    </div>
                 </div>

                 <div className="mt-6 pt-6 border-t border-slate-100">
                    <button className="w-full flex items-center justify-between group">
                       <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 group-hover:text-teal-500 transition-colors">Detailed Analytics</span>
                       <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-all" />
                    </button>
                 </div>
              </section>

              <div className="text-center py-4">
                 <p className="text-xs font-semibold text-slate-300 uppercase tracking-widest">
                    {t("pages.profile.versionFooter")}
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
