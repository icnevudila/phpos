import { useState } from "react";
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
  Layout,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { ReportBuilder } from "../components/reports/ReportBuilder";
import { downloadBirJournalCsv, fetchOrGapAudit, type OrGapAuditResult } from "../services/reports";

export function ReportsPage(): JSX.Element {
  const { t } = useTranslation();
  const now = new Date();

  const [auditResult, setAuditResult] = useState<OrGapAuditResult | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);

  async function onBirExport(): Promise<void> {
    try {
      await downloadBirJournalCsv(now.getFullYear(), now.getMonth() + 1);
      toast.success(t("pages.reports.birDownloaded"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.reports.birFailed"));
    }
  }

  async function onRunAudit(): Promise<void> {
    setAuditLoading(true);
    try {
      const res = await fetchOrGapAudit(now.getFullYear());
      setAuditResult(res);
      setAuditModalOpen(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to run OR Serial Gap Audit");
    } finally {
      setAuditLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full pb-24 bg-[#fafbfc]">
      <div className="mx-auto max-w-[1500px] px-6 lg:px-10 space-y-12 pt-10">
        
        {/* Cinematic Header */}
        <header className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
           <div className="space-y-4">
            <div className="flex items-center gap-3">
               <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                  <BarChart3 size={18} />
               </span>
               <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                  Clinical Intelligence Hub
               </span>
            </div>
            <h1 className="text-5xl font-black tracking-tight text-slate-900 lg:text-7xl">
              Insight <span className="text-indigo-500 italic">Portal</span>
            </h1>
            <p className="max-w-2xl text-lg font-medium text-slate-400 leading-relaxed">
              {t("pages.reports.subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex items-center gap-6 rounded-[2rem] bg-white p-2 pl-8 shadow-xl ring-1 ring-slate-100">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">System Integrity</p>
                   <p className="text-lg font-black text-teal-500 mt-0.5 uppercase tracking-widest">Verfied</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500 text-white shadow-lg shadow-teal-500/20">
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
                    className="group flex flex-col justify-between rounded-[2.5rem] border border-amber-200 bg-amber-50/50 p-8 text-left transition hover:shadow-xl"
                 >
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600">{t("pages.reports.birKicker")}</p>
                       <h3 className="mt-2 text-xl font-black text-slate-900">{t("pages.reports.birTitle")}</h3>
                       <p className="mt-2 text-sm text-slate-600">{t("pages.reports.birDesc")}</p>
                    </div>
                    <span className="mt-6 text-xs font-black uppercase tracking-widest text-amber-700">{t("pages.reports.birCta")}</span>
                 </button>
                  <button
                     type="button"
                     disabled={auditLoading}
                     onClick={() => void onRunAudit()}
                     className="group flex flex-col justify-between rounded-[2.5rem] border border-rose-200 bg-rose-50/50 p-8 text-left transition hover:shadow-xl"
                  >
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-600">BIR COMPLIANCE</p>
                        <h3 className="mt-2 text-xl font-black text-slate-900">OR Serial Gap Audit</h3>
                        <p className="mt-2 text-sm text-slate-600">Scan sequential Official Receipt (OR) numbers to detect any missing/skipped IDs to prevent tax audit issues.</p>
                     </div>
                     <span className="mt-6 text-xs font-black uppercase tracking-widest text-rose-700">Run Serial Audit</span>
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
              <section className="rounded-[3rem] bg-white p-10 shadow-2xl relative overflow-hidden group">
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

              <section className="rounded-[3rem] bg-white p-10 shadow-xl ring-1 ring-slate-100 space-y-8">
                 <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                       <PieChart size={20} />
                    </div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{t("pages.reports.pipelineTitle")}</h3>
                 </div>
                 <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-4 group cursor-help">
                         <div className="h-2 w-2 rounded-full bg-amber-500" />
                         <span className="text-xs font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-900 transition-colors">
                            {t(`pages.reports.pipelineLi${i}` as any)}
                         </span>
                      </div>
                    ))}
                 </div>
                 <div className="pt-6 flex flex-wrap gap-2">
                    {["CSV", "PDF", "XLSX"].map(tag => (
                      <span key={tag} className="px-3 py-1.5 rounded-lg bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">{tag}</span>
                    ))}
                 </div>
              </section>
           </div>
        </div>
      </div>

      {/* OR Audit Modal */}
      {auditModalOpen && auditResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f5f7f9]/40 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-[2.5rem] bg-white p-8 shadow-2xl ring-1 ring-slate-100 space-y-6"
          >
            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-indigo-500" size={24} />
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">OR Serial Audit — {auditResult.year}</h3>
              </div>
              <button
                onClick={() => setAuditModalOpen(false)}
                className="text-xs font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Issued</p>
                <p className="text-2xl font-mono font-black text-slate-900 mt-1">{auditResult.totalIssued}</p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Max Sequence ID</p>
                <p className="text-2xl font-mono font-black text-slate-900 mt-1">{auditResult.expectedCount}</p>
              </div>
            </div>

            {auditResult.missingCount > 0 ? (
              <div className="p-6 rounded-[2rem] bg-rose-50 border border-rose-100 space-y-4">
                <div className="flex items-center gap-3 text-rose-600">
                  <AlertTriangle size={20} />
                  <p className="text-xs font-black uppercase tracking-widest">{auditResult.missingCount} Missing Sequence Numbers</p>
                </div>
                <div className="max-h-48 overflow-y-auto divide-y divide-rose-100/50 pr-2">
                  {auditResult.missingSequences.map((seq) => (
                    <div key={seq} className="py-2.5 flex items-center justify-between text-xs font-mono font-bold text-rose-700">
                      <span>{seq}</span>
                      <span className="text-[9px] uppercase font-black bg-rose-100 px-2 py-0.5 rounded">Gap</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-[2rem] bg-teal-50 border border-teal-100 flex items-center gap-4">
                <CheckCircle2 size={32} className="text-teal-500 shrink-0" />
                <div>
                  <p className="text-xs font-black text-teal-800 uppercase tracking-widest">Audit Passed Successfully</p>
                  <p className="text-xs text-teal-600 mt-1 font-bold">No missing sequence gaps detected in issued Official Receipts for this year.</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}

function ReportCard({ to, title, desc, icon: Icon, kicker, tone, bullets }: any) {
  const tones: any = {
    sky: "bg-sky-500 shadow-sky-500/20 text-sky-500 bg-sky-50",
    emerald: "bg-teal-500 shadow-teal-500/20 text-teal-500 bg-teal-50",
    indigo: "bg-indigo-500 shadow-indigo-500/20 text-indigo-500 bg-indigo-50"
  };

  return (
    <Link to={to} className="group relative block rounded-[3rem] bg-white p-10 shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 transition-all hover:shadow-2xl hover:-translate-y-1">
       <div className="flex items-center justify-between mb-8">
          <div className={`h-16 w-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl ${tones[tone].split(' ')[0]} ${tones[tone].split(' ')[1]}`}>
             <Icon size={32} />
          </div>
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${tones[tone].split(' ').slice(2).join(' ')}`}>
             {kicker}
          </span>
       </div>
       <div className="space-y-3 mb-8">
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-500 transition-colors">{title}</h3>
          <p className="text-sm font-medium text-slate-400 leading-relaxed">{desc}</p>
       </div>
       <div className="space-y-3 pt-6 border-t border-slate-50">
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
