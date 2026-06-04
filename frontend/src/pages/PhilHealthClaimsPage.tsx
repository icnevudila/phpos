import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ShieldCheck,
  Search,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileJson,
  Fingerprint,
} from "lucide-react";

interface Claim {
  id: string;
  patientName: string;
  admissionDate: string;
  amount: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";
  eClaimId?: string;
}

function mockClaims(t: (key: string, options?: any) => string): Claim[] {
  return [
    {
      id: "1",
      patientName: t("pages.philHealth.mockPatient1", { defaultValue: "Mock Patient1" }),
      admissionDate: "2026-05-10",
      amount: "₱12,500.00",
      status: "APPROVED",
      eClaimId: "PH-2026-001",
    },
    {
      id: "2",
      patientName: t("pages.philHealth.mockPatient2", { defaultValue: "Mock Patient2" }),
      admissionDate: "2026-05-12",
      amount: "₱8,200.00",
      status: "SUBMITTED",
      eClaimId: "PH-2026-002",
    },
    {
      id: "3",
      patientName: t("pages.philHealth.mockPatient3", { defaultValue: "Mock Patient3" }),
      admissionDate: "2026-05-14",
      amount: "₱15,000.00",
      status: "DRAFT",
    },
  ];
}

const STATUS_I18N: Record<Claim["status"], string> = {
  DRAFT: "pages.philHealth.statusDraft",
  SUBMITTED: "pages.philHealth.statusSubmitted",
  APPROVED: "pages.philHealth.statusApproved",
  REJECTED: "pages.philHealth.statusRejected",
};

function statusBadge(status: Claim["status"]): string {
  switch (status) {
    case "APPROVED": return "badge badge-teal";
    case "SUBMITTED": return "badge badge-amber";
    case "REJECTED": return "badge badge-rose";
    default: return "badge badge-slate";
  }
}

export function PhilHealthClaimsPage(): JSX.Element {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const claims = useMemo(() => mockClaims(t), [t]);

  const stats = useMemo(
    () => [
      { label: t("pages.philHealth.statPending", { defaultValue: "Stat Pending" }), value: "12", icon: <Fingerprint className="text-teal-500" />, bg: "bg-teal-50" },
      { label: t("pages.philHealth.statSubmitted", { defaultValue: "Stat Submitted" }), value: "45", icon: <UploadCloud className="text-teal-500" />, bg: "bg-teal-50" },
      { label: t("pages.philHealth.statApprovedYtd", { defaultValue: "Stat Approved Ytd" }), value: "₱450k", icon: <CheckCircle2 className="text-teal-600" />, bg: "bg-teal-50" },
      { label: t("pages.philHealth.statRejected", { defaultValue: "Stat Rejected" }), value: "3", icon: <AlertCircle className="text-rose-500" />, bg: "bg-rose-50" },
    ],
    [t],
  );
  const [lookupQ, setLookupQ] = useState("");
  const caseRates = useMemo(() => [
    { code: "K02.9", description: "Dental caries, unspecified (Restorations / Fillings)", amount: "₱9,000.00", type: "ICD-10" },
    { code: "K05.3", description: "Chronic periodontitis (Root Planing / Scaling)", amount: "₱12,000.00", type: "ICD-10" },
    { code: "K04.0", description: "Pulpitis (Root Canal Therapy / Pulpectomy)", amount: "₱7,500.00", type: "ICD-10" },
    { code: "K08.8", description: "Other specified disorders of teeth (Surgical Extraction)", amount: "₱6,000.00", type: "ICD-10" },
    { code: "K03.6", description: "Deposits [accretions] on teeth (Prophylaxis / Cleaning)", amount: "₱3,500.00", type: "ICD-10" },
  ], []);

  const filteredRates = useMemo(() => {
    const q = lookupQ.trim().toLowerCase();
    if (!q) return caseRates;
    return caseRates.filter(r => r.code.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
  }, [lookupQ, caseRates]);

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-lg bg-teal-50 p-1.5 text-teal-600">
              <ShieldCheck size={16} aria-hidden />
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              {t("pages.philHealth.kicker", { defaultValue: "Claims Desk" })}
            </span>
          </div>
          <h1 className="page-header-title">{t("pages.philHealth.title", { defaultValue: "PhilHealth Claims" })}</h1>
          <p className="page-header-sub">{t("pages.philHealth.subtitle", { defaultValue: "Manage PhilHealth claims, PECWS worksheets, and transmissions." })}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-secondary flex items-center gap-2"
          >
            <Download size={16} aria-hidden />
            {t("pages.philHealth.exportBatch", { defaultValue: "Export Batch" })}
          </button>
          <button
            type="button"
            className="btn-primary flex items-center gap-2"
          >
            <UploadCloud size={16} aria-hidden />
            {t("pages.philHealth.syncPecws", { defaultValue: "Sync PECWS" })}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="mb-3 flex items-center gap-3">
              <div className={`rounded-xl p-2 ${stat.bg}`}>{stat.icon}</div>
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">{stat.label}</span>
            </div>
            <p className="stat-card-value">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Case Rate Lookup */}
      <section className="card border border-brand-border bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-brand-text">
              {t("pages.philHealth.lookupTitle", { defaultValue: "Case Rate Lookup Directory" })}
            </h2>
            <p className="text-xs text-brand-muted mt-1">
              {t("pages.philHealth.lookupSubtitle", { defaultValue: "Quick lookup for PhilHealth ICD-10 diagnosis codes and claim amounts." })}
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder={t("pages.philHealth.lookupPlaceholder", { defaultValue: "Search code or procedure..." })}
              value={lookupQ}
              onChange={(e) => setLookupQ(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-xs font-medium outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRates.map((rate) => (
            <div key={rate.code} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-teal-50/10 hover:border-teal-100 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-teal-600">{rate.code}</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest">{rate.type}</span>
                </div>
                <p className="text-xs font-semibold text-slate-700 mt-2 leading-relaxed">{rate.description}</p>
              </div>
              <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Reimbursement</span>
                <span className="text-xs font-black text-teal-600 font-mono">{rate.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Table Card */}
      <div className="card p-0 overflow-hidden">
        {/* Tabs + Search */}
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-0 -mb-4 sm:-mb-5">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "active"}
              onClick={() => setActiveTab("active")}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${ activeTab === "active" ? "border-teal-500 text-teal-600" : "border-transparent text-slate-500 hover:text-slate-700" }`}
            >
              {t("pages.philHealth.tabActive", { defaultValue: "Tab Active" })}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "history"}
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${ activeTab === "history" ? "border-teal-500 text-teal-600" : "border-transparent text-slate-500 hover:text-slate-700" }`}
            >
              {t("pages.philHealth.tabHistory", { defaultValue: "Tab History" })}
            </button>
          </div>
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} aria-hidden />
            <input
              type="search"
              placeholder={t("pages.philHealth.searchPlaceholder", { defaultValue: "Search Placeholder" })}
              className="w-full rounded-xl border border-slate-100 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("pages.philHealth.colPatient", { defaultValue: "Col Patient" })}</th>
                <th>{t("pages.philHealth.colAdmission", { defaultValue: "Col Admission" })}</th>
                <th>{t("pages.philHealth.colAmount", { defaultValue: "Col Amount" })}</th>
                <th>{t("pages.philHealth.colEclaimId", { defaultValue: "Col Eclaim Id" })}</th>
                <th>{t("pages.philHealth.colStatus", { defaultValue: "Col Status" })}</th>
                <th className="text-right">{t("pages.philHealth.colActions", { defaultValue: "Col Actions" })}</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr key={claim.id} className="group cursor-pointer transition-colors hover:bg-teal-50/30">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-500">
                        {claim.patientName.charAt(0)}
                      </div>
                      <span className="font-semibold text-slate-800">{claim.patientName}</span>
                    </div>
                  </td>
                  <td className="text-sm font-medium text-slate-500">{claim.admissionDate}</td>
                  <td className="font-semibold text-slate-800">{claim.amount}</td>
                  <td className="font-mono text-xs text-slate-400">{claim.eClaimId ?? "---"}</td>
                  <td>
                    <span className={statusBadge(claim.status)}>
                      {t(STATUS_I18N[claim.status])}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="rounded-lg p-2 text-slate-400 transition-all hover:bg-slate-50 hover:text-teal-500"
                        aria-label={t("pages.philHealth.colActions", { defaultValue: "Col Actions" })}
                      >
                        <FileJson size={16} />
                      </button>
                      <button
                        type="button"
                        className="rounded-lg p-2 text-slate-400 transition-all hover:bg-slate-50 hover:text-teal-500"
                        aria-label={t("pages.philHealth.exportBatch", { defaultValue: "Export Batch" })}
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance Notice */}
      <div className="flex gap-4 rounded-2xl border border-amber-100 bg-amber-50 p-5">
        <AlertCircle className="shrink-0 text-amber-600 mt-0.5" size={20} aria-hidden />
        <div>
          <p className="text-sm font-semibold text-amber-900">
            {t("pages.philHealth.complianceTitle", { defaultValue: "Compliance Title" })}
          </p>
          <p className="mt-1 text-xs text-amber-700">{t("pages.philHealth.complianceBody", { defaultValue: "Compliance Body" })}</p>
        </div>
      </div>
    </div>
  );
}
