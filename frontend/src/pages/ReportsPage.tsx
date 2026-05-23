import { useState } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  ShieldCheck, 
  Layout,
  AlertTriangle,
  CheckCircle2,
  Download,
  Clock,
  FileText,
  Settings,
  RefreshCw,
  Search,
  Calendar,
  Box,
  Users,
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";

import { ReportBuilder } from "../components/reports/ReportBuilder";
import { downloadBirJournalCsv, fetchOrGapAudit, type OrGapAuditResult } from "../services/reports";

export function ReportsPage(): JSX.Element {
  const now = new Date();

  const [auditResult, setAuditResult] = useState<OrGapAuditResult | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);

  async function onBirExport(): Promise<void> {
    try {
      await downloadBirJournalCsv(now.getFullYear(), now.getMonth() + 1);
      toast.success("BIR Sales Journal exported successfully.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to export BIR journal.");
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

  const reportCategories = [
    {
      title: "Finance & Accounting",
      icon: TrendingUp,
      reports: [
        { name: "Aged Receivables", desc: "Track overdue patient and HMO balances by aging buckets.", path: "/reports/aged-receivables", lastRun: "Today, 08:00 AM", status: "ready" },
        { name: "BIR Sales Journal", desc: "Official format export for BIR tax compliance and filing.", action: onBirExport, lastRun: "Yesterday", status: "ready" },
        { name: "HMO Revenue Share", desc: "Breakdown of revenue collected via HMOs vs out-of-pocket.", path: "#", lastRun: "Not generated", status: "pending" },
        { name: "Outstanding Balances", desc: "List of all patients with non-zero ledger balances.", path: "#", lastRun: "Today, 09:15 AM", status: "ready" }
      ]
    },
    {
      title: "Claims Management",
      icon: ShieldCheck,
      reports: [
        { name: "HMO Claims Status", desc: "Track pending, approved, and rejected claims by provider.", path: "/hmo-claims", lastRun: "Live", status: "active" },
        { name: "PhilHealth Transmittals", desc: "Generate electronic transmittal files for PHIC portal.", path: "/philhealth-claims", lastRun: "Live", status: "active" },
        { name: "Claim Turnaround Time", desc: "Analyze average days from submission to payout.", path: "#", lastRun: "Not generated", status: "pending" },
        { name: "Rejected Claims Analysis", desc: "Identify common reasons for HMO claim rejections.", path: "#", lastRun: "Last week", status: "ready" }
      ]
    },
    {
      title: "Clinical Operations",
      icon: Layout,
      reports: [
        { name: "Dashboard KPIs", desc: "Real-time clinical metrics, chair loads, and waiting room stats.", path: "/dashboard", lastRun: "Live", status: "active" },
        { name: "Appointment Utilization", desc: "Chair capacity utilization and no-show rate analysis.", path: "#", lastRun: "Yesterday", status: "ready" },
        { name: "Inventory Velocity", desc: "Track fast-moving consumables and supply burn rates.", path: "#", lastRun: "Not generated", status: "pending" },
        { name: "Low Stock & Expiry", desc: "Identify supplies needing reorder or nearing expiration.", path: "#", lastRun: "Today, 07:00 AM", status: "ready" }
      ]
    },
    {
      title: "Compliance & Audit",
      icon: FileText,
      reports: [
        { name: "OR Serial Gap Audit", desc: "Detect missing/skipped OR numbers for tax compliance.", action: onRunAudit, lastRun: auditResult ? "Just now" : "Not generated", status: "action", loading: auditLoading },
        { name: "Sterilization Logs", desc: "Audit trail of autoclave cycles and instrument sterilization.", path: "#", lastRun: "Yesterday", status: "ready" },
        { name: "Staff Activity Audit", desc: "System access logs and record modification history.", path: "#", lastRun: "Not generated", status: "pending" }
      ]
    }
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-24 sm:px-6 lg:px-8 space-y-6 pt-6">
      
      {/* Workbench Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end justify-between border-b border-brand-border pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">
              System Reports
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-text">
            Reports Workbench
          </h1>
          <p className="text-sm font-medium text-brand-muted">
            Financial, clinical, and operational reports for daily clinic decisions.
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-muted uppercase tracking-widest">
            <RefreshCw size={12} className="opacity-50" />
            Last synced: {format(now, "MMM d, yyyy HH:mm")}
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-secondary text-xs px-3 py-1.5 h-8">
              <Download size={14} /> Export All (CSV)
            </button>
            <button className="btn-primary text-xs px-3 py-1.5 h-8">
              <Zap size={14} /> Quick Generate
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left/Main Column: Builder & Library */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Report Builder Tool */}
          <section>
             <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-brand-text uppercase tracking-widest">Report Builder</h2>
             </div>
             <ReportBuilder />
          </section>

          {/* Report Library */}
          <section>
             <div className="mb-3 flex items-center justify-between mt-8">
                <h2 className="text-sm font-bold text-brand-text uppercase tracking-widest">Standard Reports Library</h2>
                <div className="relative">
                   <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-brand-muted" />
                   <input 
                     type="text" 
                     placeholder="Search reports..." 
                     className="h-8 w-64 rounded bg-white border border-brand-border pl-8 pr-3 text-xs font-medium text-brand-text outline-none focus:border-brand-primary"
                   />
                </div>
             </div>

             <div className="space-y-6">
                {reportCategories.map((category) => (
                   <div key={category.title} className="card border border-brand-border overflow-hidden">
                      <div className="px-4 py-3 border-b border-brand-border bg-brand-surface-soft flex items-center gap-2">
                         <category.icon size={16} className="text-brand-muted" />
                         <h3 className="text-xs font-black uppercase tracking-widest text-brand-text">{category.title}</h3>
                      </div>
                      <div className="divide-y divide-brand-border/50">
                         {category.reports.map((report) => (
                            <div key={report.name} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-brand-surface-soft/50 transition-colors">
                               <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                     <h4 className="text-sm font-bold text-brand-text">{report.name}</h4>
                                     {report.status === 'active' && <span className="flex h-1.5 w-1.5 rounded-full bg-teal-500" />}
                                     {report.status === 'pending' && <span className="flex h-1.5 w-1.5 rounded-full bg-slate-300" />}
                                  </div>
                                  <p className="text-xs text-brand-muted">{report.desc}</p>
                                  <div className="flex items-center gap-1.5 mt-1 text-[10px] font-bold text-brand-muted uppercase tracking-widest">
                                     <Clock size={10} /> {report.lastRun}
                                  </div>
                               </div>
                               <div className="shrink-0 flex items-center gap-2">
                                  {report.action ? (
                                    <button 
                                      onClick={report.action}
                                      disabled={(report as any).loading}
                                      className="btn-secondary text-[10px] px-3 py-1.5 h-7 bg-white"
                                    >
                                       {(report as any).loading ? <RefreshCw size={12} className="animate-spin" /> : (report.status === 'action' ? 'Run Audit' : 'Export')}
                                    </button>
                                  ) : (
                                    <Link 
                                      to={report.path}
                                      className="btn-secondary text-[10px] px-3 py-1.5 h-7 bg-white"
                                    >
                                       Open
                                    </Link>
                                  )}
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
                ))}
             </div>
          </section>
        </div>

        {/* Right Sidebar: Operations */}
        <div className="lg:col-span-4 space-y-6">
           <div className="card border border-brand-border overflow-hidden sticky top-6">
              <div className="px-4 py-3 border-b border-brand-border bg-brand-surface-soft flex items-center gap-2">
                 <Settings size={16} className="text-brand-muted" />
                 <h2 className="text-xs font-black uppercase tracking-widest text-brand-text">Report Operations</h2>
              </div>
              
              <div className="p-4 border-b border-brand-border bg-white">
                 <h3 className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">Scheduled Exports</h3>
                 <div className="space-y-3">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-brand-primary" />
                          <span className="text-xs font-bold text-brand-text">Daily End-of-Day Sales</span>
                       </div>
                       <span className="text-[10px] font-bold bg-brand-surface px-2 py-0.5 rounded text-brand-muted">8:00 PM</span>
                    </div>
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <Users size={14} className="text-brand-info" />
                          <span className="text-xs font-bold text-brand-text">Weekly Provider Payouts</span>
                       </div>
                       <span className="text-[10px] font-bold bg-brand-surface px-2 py-0.5 rounded text-brand-muted">Mon 9:00 AM</span>
                    </div>
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <Box size={14} className="text-brand-warning" />
                          <span className="text-xs font-bold text-brand-text">Monthly Inventory Check</span>
                       </div>
                       <span className="text-[10px] font-bold bg-brand-surface px-2 py-0.5 rounded text-brand-muted">1st of Month</span>
                    </div>
                 </div>
                 <button className="mt-4 w-full text-[10px] font-bold text-brand-primary uppercase tracking-widest hover:underline">
                    Manage Schedules
                 </button>
              </div>

              <div className="p-4 border-b border-brand-border bg-white">
                 <h3 className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">Recent Activity</h3>
                 <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-brand-border">
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                       <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white bg-teal-100 text-teal-600 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                          <CheckCircle2 size={10} />
                       </div>
                       <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] text-xs text-brand-text font-medium ml-2 md:ml-0 md:group-even:text-right md:group-even:pr-2 md:group-odd:pl-2">
                          <span className="block font-bold">Outstanding Balances</span>
                          <span className="text-[10px] text-brand-muted">Generated by Dr. Smith (10 mins ago)</span>
                       </div>
                    </div>
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                       <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white bg-rose-100 text-rose-600 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                          <AlertTriangle size={10} />
                       </div>
                       <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] text-xs text-brand-text font-medium ml-2 md:ml-0 md:group-even:text-right md:group-even:pr-2 md:group-odd:pl-2">
                          <span className="block font-bold text-rose-700">Daily Ledger (Failed)</span>
                          <span className="text-[10px] text-brand-muted">Database timeout (1 hr ago)</span>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="p-4 bg-brand-surface-soft">
                 <h3 className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">Access Notice</h3>
                 <p className="text-[10px] text-brand-text-soft leading-relaxed">
                    You are viewing this workbench with <strong className="text-brand-text font-bold">Administrator</strong> permissions. Financial and compliance reports are restricted to authorized roles only.
                 </p>
                 <div className="flex gap-2 mt-3">
                    <span className="px-2 py-1 rounded bg-white border border-brand-border text-[9px] font-black text-brand-muted uppercase">CSV</span>
                    <span className="px-2 py-1 rounded bg-white border border-brand-border text-[9px] font-black text-brand-muted uppercase">PDF</span>
                    <span className="px-2 py-1 rounded bg-white border border-brand-border text-[9px] font-black text-brand-muted uppercase">XLSX</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* OR Audit Modal */}
      {auditModalOpen && auditResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg card bg-white overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-brand-border p-4 bg-brand-surface-soft">
              <div className="flex items-center gap-2">
                <FileText className="text-brand-text" size={18} />
                <h3 className="text-sm font-bold text-brand-text uppercase tracking-widest">OR Serial Audit — {auditResult.year}</h3>
              </div>
              <button
                onClick={() => setAuditModalOpen(false)}
                className="text-[10px] font-black text-brand-muted hover:text-brand-text uppercase tracking-widest"
              >
                Close
              </button>
            </div>

            <div className="p-6 space-y-6">
               <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 rounded-[var(--radius-sm)] bg-brand-surface border border-brand-border text-center">
                   <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Total Issued</p>
                   <p className="text-xl font-mono font-black text-brand-text mt-1">{auditResult.totalIssued}</p>
                 </div>
                 <div className="p-4 rounded-[var(--radius-sm)] bg-brand-surface border border-brand-border text-center">
                   <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Max Sequence</p>
                   <p className="text-xl font-mono font-black text-brand-text mt-1">{auditResult.expectedCount}</p>
                 </div>
               </div>

               {auditResult.missingCount > 0 ? (
                 <div className="p-4 rounded-[var(--radius-md)] bg-rose-50 border border-rose-200 space-y-4">
                   <div className="flex items-center gap-2 text-rose-700">
                     <AlertTriangle size={16} />
                     <p className="text-xs font-bold uppercase tracking-widest">{auditResult.missingCount} Missing Sequence Gaps</p>
                   </div>
                   <div className="max-h-48 overflow-y-auto divide-y divide-rose-100 pr-2">
                     {auditResult.missingSequences.map((seq) => (
                       <div key={seq} className="py-2 flex items-center justify-between text-xs font-mono font-bold text-rose-700">
                         <span>{seq}</span>
                         <span className="text-[9px] uppercase font-black bg-rose-200 px-1.5 py-0.5 rounded text-rose-800">Gap Detected</span>
                       </div>
                     ))}
                   </div>
                 </div>
               ) : (
                 <div className="p-4 rounded-[var(--radius-md)] bg-teal-50 border border-teal-200 flex items-center gap-3">
                   <CheckCircle2 size={24} className="text-teal-600 shrink-0" />
                   <div>
                     <p className="text-xs font-bold text-teal-800 uppercase tracking-widest">Audit Passed</p>
                     <p className="text-xs text-teal-700 mt-1">No missing sequence gaps detected in issued Official Receipts for this year.</p>
                   </div>
                 </div>
               )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
