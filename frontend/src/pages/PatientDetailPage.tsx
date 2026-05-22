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

import { getUser } from "../hooks/authTokens";
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

  const user = getUser();
  const canWriteDental = user?.role === "ADMIN" || user?.role === "DENTIST";
  const canExportDpa = user?.role === "ADMIN";

  const { data, isLoading: loading } = useQuery({
    queryKey: ["patient", id],
    queryFn: async () => {
      const res = await api.get<{ data: PatientFull }>(`/patients/${id}`);
      return res.data.data;
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
      const res = await api.get<{ data: Tooth[] }>(`/patients/${id}/teeth`);
      return res.data.data;
    },
    enabled: !!id && tab === "chart",
  });

  const { data: treatments = [] } = useQuery({
    queryKey: ["patientTreatments", id],
    queryFn: async () => {
      const res = await api.get<{ data: PatientTreatmentRow[] }>(`/patients/${id}/treatments`);
      return res.data.data;
    },
    enabled: !!id && tab === "treatments",
  });

  const tabDefs = useMemo(
    () => [
      { key: "overview" as const, label: t("pages.patientDetail.tabs.overview"), icon: <Layout size={16} /> },
      { key: "medical" as const, label: t("pages.patientDetail.tabs.medical"), icon: <Activity size={16} /> },
      { key: "soap" as const, label: t("pages.patientDetail.tabs.soap"), icon: <FileText size={16} /> },
      { key: "chart" as const, label: t("pages.patientDetail.tabs.chart"), icon: <Stethoscope size={16} /> },
      { key: "perio" as const, label: t("pages.patientDetail.tabs.perio"), icon: <Scissors size={16} /> },
      { key: "advanced-perio" as const, label: t("pages.patientDetail.tabs.advancedPerio"), icon: <FlaskConical size={16} /> },
      { key: "tmj" as const, label: t("pages.patientDetail.tabs.tmj"), icon: <Settings size={16} /> },
      { key: "treatment-timeline" as const, label: t("pages.patientDetail.tabs.timeline"), icon: <Clock size={16} /> },
      { key: "before-after" as const, label: t("pages.patientDetail.tabs.progress"), icon: <ImageIcon size={16} /> },
      { key: "hmo" as const, label: t("pages.patientDetail.tabs.hmo"), icon: <ShieldCheck size={16} /> },
      { key: "appointments" as const, label: t("pages.patientDetail.tabs.appointments"), icon: <Clock size={16} /> },
      { key: "treatments" as const, label: t("pages.patientDetail.tabs.treatments"), icon: <Clipboard size={16} /> },
      { key: "invoices" as const, label: t("pages.patientDetail.tabs.invoices"), icon: <FileText size={16} /> },
      { key: "documents" as const, label: t("pages.patientDetail.tabs.documents"), icon: <FileText size={16} /> },
      { key: "prescriptions" as const, label: t("pages.patientDetail.tabs.prescriptions"), icon: <FlaskConical size={16} /> },
      { key: "xray" as const, label: t("pages.patientDetail.tabs.xray"), icon: <ImageIcon size={16} /> },
      { key: "intraoral" as const, label: t("pages.patientDetail.tabs.intraoral"), icon: <ImageIcon size={16} /> },
      { key: "lab" as const, label: t("pages.patientDetail.tabs.lab"), icon: <FlaskConical size={16} /> },
      { key: "family" as const, label: t("pages.patientDetail.tabs.family"), icon: <Users size={16} /> },
      { key: "consents" as const, label: t("pages.patientDetail.tabs.consents"), icon: <ShieldCheck size={16} /> },
    ],
    [t]
  );

  if (!id) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">{t("pages.patientDetail.invalid")}</p>
        <Link to="/patients" className="inline-flex items-center gap-2 text-teal-600 hover:underline">
          <ChevronLeft size={16} /> {t("pages.patientDetail.back")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 px-4 pb-20 sm:px-6 lg:px-8">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Link 
          to="/patients" 
          className="group inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold uppercase tracking-widest text-slate-500 shadow-sm ring-1 ring-slate-100 transition-all hover:bg-slate-50 hover:text-teal-600"
        >
          <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          {t("pages.patientDetail.back")}
        </Link>

        {data && (
          <div className="flex items-center gap-3">
             <span className="hidden text-xs font-medium text-slate-400 sm:block">
               {t("pages.patientDetail.lastUpdated")}: {new Intl.DateTimeFormat(dateLocale).format(new Date())}
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
            <p className="text-base font-semibold tracking-tight text-slate-800">{t("pages.patientDetail.loading")}</p>
            <p className="mt-1 text-sm font-medium text-slate-400">{t("pages.patientDetail.syncingRecords")}</p>
          </div>
        </div>
      ) : !data ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-8 py-16 text-center">
          <p className="text-base font-semibold tracking-tight text-rose-900">{t("pages.patientDetail.notFound")}</p>
          <Link to="/patients" className="mt-4 inline-block text-sm font-semibold text-rose-600 hover:underline">
             {t("pages.patientDetail.returnToDirectory")}
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
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            {/* Tab Navigation */}
            <div className="flex items-center overflow-x-auto border-b border-slate-100 bg-slate-50/50 px-4">
              <div className="flex gap-1 py-2">
                {tabDefs.map((def) => {
                  const isActive = tab === def.key;
                  return (
                    <button
                      key={def.key}
                      type="button"
                      role="tab"
                      data-testid={`patient-tab-${def.key}`}
                      aria-selected={isActive}
                      onClick={() => selectTab(def.key)}
                      className={`relative flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-all ${isActive ? "bg-white text-teal-600 shadow-sm" : "text-slate-400 hover:bg-white/70 hover:text-slate-600"}`}
                    >
                      <span className={isActive ? "text-teal-500" : "text-slate-300"}>{def.icon}</span>
                      {def.label}
                      {isActive && (
                        <motion.div 
                          layoutId="activeTab"
                          className="absolute -bottom-[9px] left-1/2 h-1 w-6 -translate-x-1/2 rounded-t-full bg-teal-500"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content Area */}
            <div className="min-h-[600px] p-4 sm:p-6 lg:p-8">
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
