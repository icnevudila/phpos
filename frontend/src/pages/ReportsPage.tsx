import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  ShieldCheck, 
  ChevronRight, 
  Activity,
  Zap,
  Layout
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { ReportBuilder } from "../components/reports/ReportBuilder";
import { downloadBirJournalCsv } from "../services/reports";

export function ReportsPage(): JSX.Element {
  const { t } = useTranslation();
  const now = new Date();

  async function onBirExport(): Promise<void> {
    try {
      await downloadBirJournalCsv(now.getFullYear(), now.getMonth() + 1);
      toast.success(t("pages.reports.birDownloaded"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.reports.birFailed"));
    }
  }

  return (
    <div className="min-h-screen w-full pb-24 bg-[#fafbfc] dark:bg-slate-950">
      <div className="mx-auto max-w-[1500px] px-6 lg:px-10 space-y-12 pt-10">
        
        {/* Cinematic Header */}
        <header className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
           <div className="space-y-4">
            <div className="flex items-center gap-3">
               <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                  <BarChart3 size={18} />
               </span>
               <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                  Clinical Intelligence Hub
               </span>
            </div>
            <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white lg:text-7xl">
              Insight <span className="text-indigo-500 italic">Portal</span>
            </h1>
            <p className="max-w-2xl text-lg font-medium text-slate-400 leading-relaxed">
              {t("pages.reports.subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex items-center gap-6 rounded-[2rem] bg-white dark:bg-slate-900 p-2 pl-8 shadow-xl ring-1 ring-slate-100 dark:ring-slate-800">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">System Integrity</p>
                   <p className="text-lg font-black text-emerald-500 mt-0.5 uppercase tracking-widest">Verfied</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                   <ShieldCheck size={20} />
                </div>
             </div>
          </div>
        </header>

        {/* Intelligence Grid */}
        <div className="grid gap-10 lg:grid-cols-12">
           
           {/* Visual Report Builder Section */}
           <div className="lg:col-span-12">
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                 <div className="flex items-center justify-between px-4">
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Dynamic Visualization</h2>
                    <div className="flex items-center gap-2">
                       <Zap size={14} className="text-amber-500" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Architect Engine v2.0</span>
                    </div>
                 </div>
                 <ReportBuilder />
              </motion.section>
           </div>

           {/* Financial Modules */}
           <div className="lg:col-span-8 space-y-8">
              <h2 className="px-4 text-xs font-black uppercase tracking-[0.3em] text-slate-400">{t("pages.reports.sectionFinancial")}</h2>
              <div className="grid gap-8 md:grid-cols-2">
                 <ReportCard 
                    to="/reports/aged-receivables"
                    title={t("pages.reports.cardArTitle")}
                    desc={t("pages.reports.cardArDesc")}
                    icon={TrendingUp}
                    kicker={t("pages.reports.cardArKicker")}
                    tone="sky"
                    bullets={[t("pages.reports.cardArBullet1"), t("pages.reports.cardArBullet2")]}
                 />
                 <button
                    type="button"
                    onClick={() => void onBirExport()}
                    className="group flex flex-col justify-between rounded-[2.5rem] border border-amber-200 bg-amber-50/50 p-8 text-left transition hover:shadow-xl dark:border-amber-900 dark:bg-amber-950/20"
                 >
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600">{t("pages.reports.birKicker")}</p>
                       <h3 className="mt-2 text-xl font-black text-slate-900 dark:text-white">{t("pages.reports.birTitle")}</h3>
                       <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{t("pages.reports.birDesc")}</p>
                    </div>
                    <span className="mt-6 text-xs font-black uppercase tracking-widest text-amber-700">{t("pages.reports.birCta")}</span>
                 </button>
                 <ReportCard
                    to="/philhealth-claims"
                    title={t("pages.reports.cardPhicTitle")}
                    desc={t("pages.reports.cardPhicDesc")}
                    icon={ShieldCheck}
                    kicker={t("pages.reports.cardPhicKicker")}
                    tone="emerald"
                    bullets={[t("pages.reports.cardPhicBullet1"), t("pages.reports.cardPhicBullet2")]}
                 />
                 <ReportCard
                    to="/hmo-claims"
                    title={t("pages.reports.cardHmoTitle")}
                    desc={t("pages.reports.cardHmoDesc")}
                    icon={PieChart}
                    kicker={t("pages.reports.cardHmoKicker")}
                    tone="indigo"
                    bullets={[t("pages.reports.cardHmoBullet1"), t("pages.reports.cardHmoBullet2")]}
                 />
                 <ReportCard 
                    to="/dashboard"
                    title={t("pages.reports.cardDashTitle")}
                    desc={t("pages.reports.cardDashDesc")}
                    icon={Layout}
                    kicker={t("pages.reports.cardDashKicker")}
                    tone="emerald"
                    bullets={[t("pages.reports.cardDashBullet1"), t("pages.reports.cardDashBullet2")]}
                 />
              </div>
           </div>

           {/* Quick Stats & Meta */}
           <div className="lg:col-span-4 space-y-10">
              <section className="rounded-[3rem] bg-slate-900 p-10 shadow-2xl relative overflow-hidden group">
                 <div className="absolute -top-20 -right-20 h-64 w-64 bg-indigo-500/10 rounded-full blur-[80px] group-hover:scale-150 transition-all duration-1000" />
                 <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400 mb-8 flex items-center gap-3">
                    <Activity size={16} /> Operational Meta
                 </h3>
                 <div className="space-y-6 relative z-10">
                    <MetaRow label={t("pages.reports.statScopeTitle")} value={t("pages.reports.statScopeBody")} />
                    <MetaRow label={t("pages.reports.statTzTitle")} value={t("pages.reports.statTzBody")} />
                    <MetaRow label={t("pages.reports.statAccessTitle")} value={t("pages.reports.statAccessBody")} />
                 </div>
                 <div className="mt-10 pt-8 border-t border-white/5 relative z-10">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">
                       {t("pages.reports.footerLead")}
                    </p>
                 </div>
              </section>

              <section className="rounded-[3rem] bg-white dark:bg-slate-900 p-10 shadow-xl ring-1 ring-slate-100 dark:ring-slate-800 space-y-8">
                 <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-600">
                       <PieChart size={20} />
                    </div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{t("pages.reports.pipelineTitle")}</h3>
                 </div>
                 <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-4 group cursor-help">
                         <div className="h-2 w-2 rounded-full bg-amber-500" />
                         <span className="text-xs font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                            {t(`pages.reports.pipelineLi${i}` as any)}
                         </span>
                      </div>
                    ))}
                 </div>
                 <div className="pt-6 flex flex-wrap gap-2">
                    {["CSV", "PDF", "XLSX"].map(tag => (
                      <span key={tag} className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest">{tag}</span>
                    ))}
                 </div>
              </section>
           </div>
        </div>
      </div>
    </div>
  );
}

function ReportCard({ to, title, desc, icon: Icon, kicker, tone, bullets }: any) {
  const tones: any = {
    sky: "bg-sky-500 shadow-sky-500/20 text-sky-500 bg-sky-50",
    emerald: "bg-emerald-500 shadow-emerald-500/20 text-emerald-500 bg-emerald-50",
    indigo: "bg-indigo-500 shadow-indigo-500/20 text-indigo-500 bg-indigo-50"
  };

  return (
    <Link to={to} className="group relative block rounded-[3rem] bg-white dark:bg-slate-900 p-10 shadow-xl shadow-slate-200/50 dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-800 transition-all hover:shadow-2xl hover:-translate-y-1">
       <div className="flex items-center justify-between mb-8">
          <div className={`h-16 w-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl ${tones[tone].split(' ')[0]} ${tones[tone].split(' ')[1]}`}>
             <Icon size={32} />
          </div>
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${tones[tone].split(' ').slice(2).join(' ')}`}>
             {kicker}
          </span>
       </div>
       <div className="space-y-3 mb-8">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-indigo-500 transition-colors">{title}</h3>
          <p className="text-sm font-medium text-slate-400 leading-relaxed">{desc}</p>
       </div>
       <div className="space-y-3 pt-6 border-t border-slate-50 dark:border-slate-800">
          {bullets.map((b: string) => (
            <div key={b} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
               <ChevronRight size={14} className="text-slate-300" />
               {b}
            </div>
          ))}
       </div>
    </Link>
  );
}

function MetaRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="space-y-1.5">
       <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
       <p className="text-sm font-bold text-white">{value}</p>
    </div>
  );
}
