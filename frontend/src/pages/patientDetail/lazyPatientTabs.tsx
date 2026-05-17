import { lazy } from "react";

export const LazyDentalChart = lazy(() =>
  import("../../components/dental/DentalChart").then((m) => ({ default: m.DentalChart })),
);
export const LazyXrayWorkspace = lazy(() =>
  import("../../components/patient/XrayWorkspace").then((m) => ({ default: m.XrayWorkspace })),
);
export const LazyPerioExamWorkspace = lazy(() =>
  import("../../components/perio/PerioExamWorkspace").then((m) => ({ default: m.PerioExamWorkspace })),
);
export const LazyAdvancedPerioVisualizer = lazy(() =>
  import("../../components/perio/AdvancedPerioVisualizer").then((m) => ({
    default: m.AdvancedPerioVisualizer,
  })),
);
export const LazyTMJFaceAnatomy = lazy(() =>
  import("../../components/anatomy/TMJFaceAnatomy").then((m) => ({ default: m.TMJFaceAnatomy })),
);
export const LazyEnhancedBeforeAfterSlider = lazy(() =>
  import("../../components/slider/EnhancedBeforeAfterSlider").then((m) => ({
    default: m.EnhancedBeforeAfterSlider,
  })),
);
export const LazyPrescriptionsTab = lazy(() =>
  import("../../components/patient/PrescriptionsTab").then((m) => ({ default: m.PrescriptionsTab })),
);
export const LazyDocumentsTab = lazy(() =>
  import("../../components/patient/DocumentsTab").then((m) => ({ default: m.DocumentsTab })),
);
export const LazyIntraoralPhotosTab = lazy(() =>
  import("../../components/patient/IntraoralPhotosTab").then((m) => ({ default: m.IntraoralPhotosTab })),
);
export const LazyLabOrdersTab = lazy(() =>
  import("../../components/patient/LabOrdersTab").then((m) => ({ default: m.LabOrdersTab })),
);
export const LazyMedicalHistoryForm = lazy(() =>
  import("../../components/patient/MedicalHistoryForm").then((m) => ({ default: m.MedicalHistoryForm })),
);
export const LazyPatientHmoPanel = lazy(() =>
  import("../../components/patient/PatientHmoPanel").then((m) => ({ default: m.PatientHmoPanel })),
);
export const LazyTreatmentPlanTab = lazy(() =>
  import("../../components/patient/TreatmentPlanTab").then((m) => ({ default: m.TreatmentPlanTab })),
);
export const LazyFamilyNetworkTab = lazy(() =>
  import("../../components/patient/FamilyNetworkTab").then((m) => ({ default: m.FamilyNetworkTab })),
);
export const LazyConsentsTab = lazy(() =>
  import("../../components/patient/ConsentsTab").then((m) => ({ default: m.ConsentsTab })),
);
export const LazyProgressNotesTab = lazy(() =>
  import("../../components/patient/ProgressNotesTab").then((m) => ({ default: m.ProgressNotesTab })),
);
export const LazyReferralTab = lazy(() =>
  import("../../components/patient/ReferralTab").then((m) => ({ default: m.ReferralTab })),
);
export const LazyPatientForm = lazy(() =>
  import("../../components/PatientForm").then((m) => ({ default: m.PatientForm })),
);
