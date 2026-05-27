import { Suspense, useState, useMemo, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  Settings, 
  Activity, 
  Clipboard, 
  Layout, 
  Clock, 
  FileText, 
  FlaskConical, 
  Image as ImageIcon,
  ShieldCheck,
  Stethoscope,
  Scissors,
  Users,
  Share2,
} from "lucide-react";

import { RouteFallback } from "../components/LazyRoute";
import {
  LazyAdvancedPerioVisualizer,
  LazyConsentsTab,
  LazyDentalChart,
  LazyEnhancedBeforeAfterSlider,
  LazyFamilyNetworkTab,
  LazyLabOrdersTab,
  LazyMedicalHistoryForm,
  LazyPatientForm,
  LazyPatientHmoPanel,
  LazyPerioExamWorkspace,
  LazyPrescriptionsTab,
  LazyDocumentsTab,
  LazyIntraoralPhotosTab,
  LazyProgressNotesTab,
  LazyReferralTab,
  LazyTMJFaceAnatomy,
  LazyTreatmentPlanTab,
  LazyXrayWorkspace,
} from "./patientDetail/lazyPatientTabs";
import { PatientHeader } from "../components/patient/PatientHeader";
import { OverviewTab } from "../components/patient/OverviewTab";
import { AppointmentsTab } from "../components/patient/AppointmentsTab";
import { TreatmentsTab, type PatientTreatmentRow } from "../components/patient/TreatmentsTab";
import { InvoicesTab } from "../components/patient/InvoicesTab";

import { useAuth } from "../hooks/useAuth";
import api from "../services/api";
import { listPerioExams, getPerioExam } from "../services/perio";
import type { Tooth } from "../types/dentalChart";

type TabKey =
  | "overview"
  | "medical"
  | "chart"
  | "perio"
  | "advanced-perio"
  | "tmj"
  | "treatment-timeline"
  | "before-after"
  | "hmo"
  | "appointments"
  | "treatments"
  | "invoices"
  | "documents"
  | "prescriptions"
  | "xray"
  | "lab"
  | "family"
  | "consents"
  | "soap"
  | "referral"
  | "intraoral";

const TAB_KEYS: TabKey[] = [
  "overview",
  "medical",
  "chart",
  "perio",
  "advanced-perio",
  "tmj",
  "treatment-timeline",
  "before-after",
  "hmo",
  "appointments",
  "treatments",
  "invoices",
  "documents",
  "prescriptions",
  "xray",
  "lab",
  "family",
  "consents",
  "soap",
  "referral",
  "intraoral",
];

function parseTabParam(value: string | null): TabKey {
  if (value && TAB_KEYS.includes(value as TabKey)) return value as TabKey;
  return "overview";
}

interface PatientFull {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  nickname: string | null;
  phone: string;
  email: string | null;
  birthDate: string | null;
  gender: string | null;
  civilStatus: string | null;
  occupation: string | null;
  religion: string | null;
  nationality: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  bloodType: string | null;
  allergies: string[];
  philhealthNo: string | null;
  philhealthType: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  referralSource: string | null;
  previousDentist: string | null;
  lastDentalVisit: string | null;
  reasonForVisit: string | null;
  bloodPressureSystolic: number | null;
  bloodPressureDiastolic: number | null;
  pulseRate: number | null;
  medicalHistoryText: string | null;
  appointments: Array<{
    id: string;
    scheduledAt: string;
    duration: number;
    status: string;
    type: string | null;
    notes: string | null;
    dentist: { id: string; firstName: string; lastName: string };
  }>;
  invoices: Array<{
    id: string;
    orNumber: string | null;
    subtotal: string;
    discount: string;
    total: string;
    status: string;
    dueDate: string | null;
    paidAt: string | null;
    createdAt: string;
  }>;
}

interface Treatment {
  id: string;
  appointmentId: string;
  procedure: string;
  quantity: number;
  unitPrice: string;
  toothIds: string[];
  phase: string | null;
  notes: string | null;
  createdAt: string;
  dentist: { firstName: string; lastName: string };
}

function pickLocale(lang: string): string {
  return lang === "tr" ? "tr-TR" : "en-PH";
}

export function PatientDetailPage(): JSX.Element {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const dateLocale = pickLocale(i18n.language);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [editOpen, setEditOpen] = useState(false);
  const [tab, setTab] = useState<TabKey>(() => parseTabParam(searchParams.get("tab")));

  useEffect(() => {
    setTab(parseTabParam(searchParams.get("tab")));
  }, [searchParams]);

  const selectTab = useCallback(
    (key: TabKey) => {
      setTab(key);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (key === "overview") next.delete("tab");
          else next.set("tab", key);
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const { user } = useAuth();
  const role = user?.user_metadata?.role;
  const canWriteDental = role === "ADMIN" || role === "DENTIST";
  const canExportDpa = role === "ADMIN";

  const { data, isLoading: loading } = useQuery({
    queryKey: ["patient", id],
    queryFn: async () => {
      const res = await api.get<any, { data: PatientFull }>(`/patients/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const { data: latestPerioExam } = useQuery({
    queryKey: ["latestPerioExam", id],
    queryFn: async () => {
      const exams = await listPerioExams(id!);
      if (exams.length > 0) {
        return getPerioExam(exams[0].id);
      }
      return null;
    },
    enabled: !!id && tab === "advanced-perio",
  });

  const { data: teeth = [], isLoading: teethLoading } = useQuery({
    queryKey: ["patientTeeth", id],
    queryFn: async () => {
      const res = await api.get<any, { data: Tooth[] }>(`/patients/${id}/teeth`);
      return res.data;
    },
    enabled: !!id && tab === "chart",
  });

  const { data: treatments = [] } = useQuery({
    queryKey: ["patientTreatments", id],
    queryFn: async () => {
      const res = await api.get<any, { data: PatientTreatmentRow[] }>(`/patients/${id}/treatments`);
      return res.data;
    },
    enabled: !!id && tab === "treatments",
  });

  const tabDefs = useMemo(
    () => [
      { key: "overview" as const, label: t("pages.patientDetail.tabs.overview", { defaultValue: "Overview" }), icon: <Layout size={16} /> },
      { key: "medical" as const, label: t("pages.patientDetail.tabs.medical", { defaultValue: "Medical" }), icon: <Activity size={16} /> },
      { key: "soap" as const, label: t("pages.patientDetail.tabs.soap", { defaultValue: "Soap" }), icon: <FileText size={16} /> },
      { key: "chart" as const, label: t("pages.patientDetail.tabs.chart", { defaultValue: "Chart" }), icon: <Stethoscope size={16} /> },
      { key: "perio" as const, label: t("pages.patientDetail.tabs.perio", { defaultValue: "Perio" }), icon: <Scissors size={16} /> },
      { key: "advanced-perio" as const, label: t("pages.patientDetail.tabs.advancedPerio", { defaultValue: "Advanced Perio" }), icon: <FlaskConical size={16} /> },
      { key: "tmj" as const, label: t("pages.patientDetail.tabs.tmj", { defaultValue: "Tmj" }), icon: <Settings size={16} /> },
      { key: "treatment-timeline" as const, label: t("pages.patientDetail.tabs.timeline", { defaultValue: "Timeline" }), icon: <Clock size={16} /> },
      { key: "before-after" as const, label: t("pages.patientDetail.tabs.progress", { defaultValue: "Progress" }), icon: <ImageIcon size={16} /> },
      { key: "hmo" as const, label: t("pages.patientDetail.tabs.hmo", { defaultValue: "Hmo" }), icon: <ShieldCheck size={16} /> },
      { key: "appointments" as const, label: t("pages.patientDetail.tabs.appointments", { defaultValue: "Appointments" }), icon: <Clock size={16} /> },
      { key: "treatments" as const, label: t("pages.patientDetail.tabs.treatments", { defaultValue: "Treatments" }), icon: <Clipboard size={16} /> },
      { key: "invoices" as const, label: t("pages.patientDetail.tabs.invoices", { defaultValue: "Invoices" }), icon: <FileText size={16} /> },
      { key: "documents" as const, label: t("pages.patientDetail.tabs.documents", { defaultValue: "Documents" }), icon: <FileText size={16} /> },
      { key: "prescriptions" as const, label: t("pages.patientDetail.tabs.prescriptions", { defaultValue: "Prescriptions" }), icon: <FlaskConical size={16} /> },
      { key: "xray" as const, label: t("pages.patientDetail.tabs.xray", { defaultValue: "Xray" }), icon: <ImageIcon size={16} /> },
      { key: "intraoral" as const, label: t("pages.patientDetail.tabs.intraoral", { defaultValue: "Intraoral" }), icon: <ImageIcon size={16} /> },
      { key: "lab" as const, label: t("pages.patientDetail.tabs.lab", { defaultValue: "Lab" }), icon: <FlaskConical size={16} /> },
      { key: "family" as const, label: t("pages.patientDetail.tabs.family", { defaultValue: "Family" }), icon: <Users size={16} /> },
      { key: "consents" as const, label: t("pages.patientDetail.tabs.consents", { defaultValue: "Consents" }), icon: <ShieldCheck size={16} /> },
    ],
    [t]
  );

  const navGroups = useMemo(() => [
    { title: "Overview", items: ["overview"] },
    { title: "Clinical", items: ["medical", "soap", "chart", "perio", "advanced-perio", "tmj", "xray", "intraoral", "prescriptions", "lab"] },
    { title: "Treatment", items: ["treatments", "appointments"] },
    { title: "Money", items: ["invoices", "hmo"] },
    { title: "History", items: ["treatment-timeline", "documents", "before-after", "referral", "family", "consents"] }
  ], []);

  if (!id) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">{t("pages.patientDetail.invalid", { defaultValue: "Invalid" })}</p>
        <Link to="/patients" className="inline-flex items-center gap-2 text-teal-600 hover:underline">
          <ChevronLeft size={16} /> {t("pages.patientDetail.back", { defaultValue: "Back" })}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1360px] space-y-6 px-4 pb-20 sm:px-6 lg:px-8">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Link 
          to="/patients" 
          className="group inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold uppercase tracking-widest text-slate-500 shadow-sm ring-1 ring-slate-100 transition-all hover:bg-slate-50 hover:text-teal-600"
        >
          <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          {t("pages.patientDetail.back", { defaultValue: "Back" })}
        </Link>

        {data && (
          <div className="flex items-center gap-3">
             <span className="hidden text-xs font-medium text-slate-400 sm:block">
               {t("pages.patientDetail.lastUpdated", { defaultValue: "Last Updated" })}: {new Intl.DateTimeFormat(dateLocale).format(new Date())}
             </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-slate-100 bg-white px-6 py-24 text-center shadow-sm">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-teal-500/20 border-t-teal-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 animate-pulse rounded-full bg-teal-500/10" />
            </div>
          </div>
          <div>
            <p className="text-base font-semibold tracking-tight text-slate-800">{t("pages.patientDetail.loading", { defaultValue: "Loading" })}</p>
            <p className="mt-1 text-sm font-medium text-slate-400">{t("pages.patientDetail.syncingRecords", { defaultValue: "Syncing Records" })}</p>
          </div>
        </div>
      ) : !data ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-8 py-16 text-center">
          <p className="text-base font-semibold tracking-tight text-rose-900">{t("pages.patientDetail.notFound", { defaultValue: "Not Found" })}</p>
          <Link to="/patients" className="mt-4 inline-block text-sm font-semibold text-rose-600 hover:underline">
             {t("pages.patientDetail.returnToDirectory", { defaultValue: "Return To Directory" })}
          </Link>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <PatientHeader
            data={data}
            onEdit={() => setEditOpen(true)}
            onErased={() => navigate("/patients")}
            dateLocale={dateLocale}
            canEditAvatar={canWriteDental}
            canExportDpa={canExportDpa}
          />

          {/* Main Workspace Area */}
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 items-start">
            
            {/* Mobile Navigation */}
            <div className="block md:hidden card p-2">
              <select 
                className="w-full bg-brand-surface text-brand-text text-sm font-bold p-3 rounded-lg border border-brand-border outline-none focus:ring-2 focus:ring-brand-primary"
                value={tab}
                onChange={(e) => selectTab(e.target.value as TabKey)}
              >
                {navGroups.map((group) => (
                  <optgroup key={group.title} label={group.title}>
                    {group.items.map((key) => {
                      const def = tabDefs.find(t => t.key === key);
                      if (!def) return null;
                      return <option key={key} value={key}>{def.label}</option>;
                    })}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Desktop Vertical Navigation */}
            <nav className="hidden md:flex flex-col gap-6 sticky top-24">
              {navGroups.map((group) => (
                <div key={group.title} className="flex flex-col gap-1">
                  <h3 className="px-3 text-[10px] font-black uppercase tracking-widest text-brand-muted mb-1">
                    {group.title}
                  </h3>
                  {group.items.map((key) => {
                    const def = tabDefs.find(t => t.key === key);
                    if (!def) return null;
                    const isActive = tab === key;
                    return (
                      <button
                        key={key}
                        onClick={() => selectTab(key as TabKey)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-all ${isActive ? "bg-brand-surface text-brand-primary shadow-sm border border-brand-border" : "text-brand-muted hover:bg-brand-surface hover:text-brand-text border border-transparent"}`}
                      >
                        <span className={isActive ? "text-brand-primary" : "opacity-70"}>{def.icon}</span>
                        {def.label}
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>

            {/* Tab Content Area */}
            <div className="card min-h-[600px] p-4 sm:p-6 lg:p-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Suspense fallback={<RouteFallback />}>
                  {tab === "overview" && <OverviewTab data={data} dateLocale={dateLocale} />}
                  {tab === "medical" && (
                    <LazyMedicalHistoryForm
                      patientId={id}
                      patientGender={data.gender}
                      canEdit={canWriteDental}
                    />
                  )}
                  {tab === "chart" && (
                    teethLoading ? (
                      <div className="flex h-[400px] items-center justify-center rounded-2xl bg-slate-50">
                         <div className="h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      <LazyDentalChart
                        patientId={id}
                        teeth={teeth}
                        onUpdate={() => queryClient.invalidateQueries({ queryKey: ["patientTeeth", id] })}
                        readOnly={!canWriteDental}
                      />
                    )
                  )}
                  {tab === "perio" && <LazyPerioExamWorkspace patientId={id} />}
                  {tab === "hmo" && <LazyPatientHmoPanel patientId={id} />}
                  {tab === "appointments" && (
                    <AppointmentsTab items={data.appointments} dateLocale={dateLocale} />
                  )}
                  {tab === "treatments" && (
                    <TreatmentsTab
                      patientId={id}
                      items={treatments}
                      canWrite={canWriteDental}
                      appointments={data.appointments}
                      dateLocale={dateLocale}
                      onAdded={() => queryClient.invalidateQueries({ queryKey: ["patientTreatments", id] })}
                    />
                  )}
                  {tab === "invoices" && <InvoicesTab items={data.invoices} dateLocale={dateLocale} />}
                  {tab === "documents" && (
                    <LazyDocumentsTab
                      patientId={id}
                      patientName={`${data.firstName ?? ""} ${data.lastName ?? ""}`.trim()}
                    />
                  )}
                  {tab === "prescriptions" && (
                    <LazyPrescriptionsTab
                      patientId={id}
                      dateLocale={dateLocale}
                      canWrite={canWriteDental}
                      appointments={data.appointments}
                      patientName={`${data.firstName ?? ""} ${data.lastName ?? ""}`.trim()}
                    />
                  )}
                  {tab === "xray" && <LazyXrayWorkspace patientId={id} />}
                  {tab === "intraoral" && id && <LazyIntraoralPhotosTab patientId={id} />}
                  {tab === "advanced-perio" && (
                    <LazyAdvancedPerioVisualizer teeth={latestPerioExam?.teeth || []} />
                  )}
                  {tab === "tmj" && <LazyTMJFaceAnatomy selectedPoints={[]} />}
                  {tab === "treatment-timeline" && data && (
                    <LazyTreatmentPlanTab
                      appointments={data.appointments}
                      treatments={treatments}
                      dateLocale={dateLocale}
                    />
                  )}
                  {tab === "lab" && <LazyLabOrdersTab patientId={id!} canWrite={canWriteDental} />}
                  {tab === "family" && <LazyFamilyNetworkTab patientId={id!} />}
                  {tab === "consents" && <LazyConsentsTab patientId={id!} canWrite={canWriteDental} />}
                  {tab === "soap" && id && <LazyProgressNotesTab patientId={id} />}
                  {tab === "referral" && id && <LazyReferralTab patientId={id} />}
                  {tab === "before-after" && (
                    <LazyEnhancedBeforeAfterSlider
                      beforeImage="https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&q=80&w=1200"
                      afterImage="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=1200"
                    />
                  )}
                  </Suspense>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}

      {editOpen ? (
        <LazyPatientForm
          open={editOpen}
          patientId={id}
          onClose={() => setEditOpen(false)}
          onSaved={() => queryClient.invalidateQueries({ queryKey: ["patient", id] })}
        />
      ) : null}
    </div>
  );
}
