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

function mockClaims(t: (key: string) => string): Claim[] {
  return [
    {
      id: "1",
      patientName: t("pages.philHealth.mockPatient1"),
      admissionDate: "2026-05-10",
      amount: "₱12,500.00",
      status: "APPROVED",
      eClaimId: "PH-2026-001",
    },
    {
      id: "2",
      patientName: t("pages.philHealth.mockPatient2"),
      admissionDate: "2026-05-12",
      amount: "₱8,200.00",
      status: "SUBMITTED",
      eClaimId: "PH-2026-002",
    },
    {
      id: "3",
      patientName: t("pages.philHealth.mockPatient3"),
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

export function PhilHealthClaimsPage(): JSX.Element {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const claims = useMemo(() => mockClaims(t), [t]);

  const stats = useMemo(
    () => [
      { label: t("pages.philHealth.statPending"), value: "12", icon: <Fingerprint className="text-blue-500" /> },
      { label: t("pages.philHealth.statSubmitted"), value: "45", icon: <UploadCloud className="text-emerald-500" /> },
      { label: t("pages.philHealth.statApprovedYtd"), value: "₱450k", icon: <CheckCircle2 className="text-indigo-500" /> },
      { label: t("pages.philHealth.statRejected"), value: "3", icon: <AlertCircle className="text-rose-500" /> },
    ],
    [t],
  );

  return (
    <div className="min-h-screen bg-[#fafbfc] px-4 py-10 dark:bg-slate-950 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1400px] space-y-10">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-blue-100 p-1.5 text-blue-600 dark:bg-blue-900/30">
                <ShieldCheck size={18} aria-hidden />
              </span>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                {t("pages.philHealth.kicker")}
              </span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white lg:text-5xl">
              {t("pages.philHealth.title")}
            </h1>
            <p className="text-lg font-medium text-slate-500">{t("pages.philHealth.subtitle")}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-white px-6 py-4 font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              <Download size={18} aria-hidden />
              {t("pages.philHealth.exportBatch")}
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white shadow-xl shadow-blue-200/50 transition-all hover:bg-blue-700 dark:shadow-none"
            >
              <UploadCloud size={18} aria-hidden />
              {t("pages.philHealth.syncPecws")}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-slate-50 p-2 dark:bg-slate-800">{stat.icon}</div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
          <div className="flex flex-col gap-4 border-b border-slate-50 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-800/50 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex gap-4" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "active"}
                onClick={() => setActiveTab("active")}
                className={`rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-all ${activeTab === "active" ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-600"}`}
              >
                {t("pages.philHealth.tabActive")}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "history"}
                onClick={() => setActiveTab("history")}
                className={`rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-all ${activeTab === "history" ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-600"}`}
              >
                {t("pages.philHealth.tabHistory")}
              </button>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} aria-hidden />
              <input
                type="search"
                placeholder={t("pages.philHealth.searchPlaceholder")}
                className="w-full rounded-xl border border-slate-100 bg-white py-3 pl-12 pr-6 text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:border-slate-800">
                  <th className="px-6 py-6 sm:px-8">{t("pages.philHealth.colPatient")}</th>
                  <th className="px-6 py-6 sm:px-8">{t("pages.philHealth.colAdmission")}</th>
                  <th className="px-6 py-6 sm:px-8">{t("pages.philHealth.colAmount")}</th>
                  <th className="px-6 py-6 sm:px-8">{t("pages.philHealth.colEclaimId")}</th>
                  <th className="px-6 py-6 sm:px-8">{t("pages.philHealth.colStatus")}</th>
                  <th className="px-6 py-6 text-right sm:px-8">{t("pages.philHealth.colActions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {claims.map((claim) => (
                  <tr key={claim.id} className="group transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-6 sm:px-8">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-400 dark:bg-slate-800">
                          {claim.patientName.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">{claim.patientName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-sm font-medium text-slate-500 sm:px-8">{claim.admissionDate}</td>
                    <td className="px-6 py-6 font-bold text-slate-900 dark:text-white sm:px-8">{claim.amount}</td>
                    <td className="px-6 py-6 font-mono text-xs text-slate-400 sm:px-8">{claim.eClaimId ?? "---"}</td>
                    <td className="px-6 py-6 sm:px-8">
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                          claim.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-600"
                            : claim.status === "SUBMITTED"
                              ? "bg-blue-100 text-blue-600"
                              : claim.status === "REJECTED"
                                ? "bg-rose-100 text-rose-600"
                                : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {t(STATUS_I18N[claim.status])}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-right sm:px-8">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="rounded-lg p-2 text-slate-400 transition-all hover:bg-white hover:text-blue-500 dark:hover:bg-slate-800"
                          aria-label={t("pages.philHealth.colActions")}
                        >
                          <FileJson size={18} />
                        </button>
                        <button
                          type="button"
                          className="rounded-lg p-2 text-slate-400 transition-all hover:bg-white hover:text-emerald-500 dark:hover:bg-slate-800"
                          aria-label={t("pages.philHealth.exportBatch")}
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex gap-4 rounded-3xl border border-amber-100 bg-amber-50 p-6 dark:border-amber-900/20 dark:bg-amber-900/10">
          <AlertCircle className="shrink-0 text-amber-600" size={24} aria-hidden />
          <div>
            <p className="text-sm font-bold text-amber-900 dark:text-amber-100">
              {t("pages.philHealth.complianceTitle")}
            </p>
            <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">{t("pages.philHealth.complianceBody")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
