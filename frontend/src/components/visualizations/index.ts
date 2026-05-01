// DentEase PH — Advanced Visualization Modules
// All 6 visualization components exported from a single barrel

export { default as AdvancedPerioChart } from '../perio/AdvancedPerioChart';
export type { AdvancedPerioChartProps } from '../perio/AdvancedPerioChart';

export { default as XRayCanvas } from '../xray/XRayCanvas';
export type { XRayCanvasProps, XRayTool, XRayAnnotation } from '../xray/XRayCanvas';

export { default as TreatmentTimeline } from '../treatment/TreatmentTimeline';
export type { TreatmentTimelineProps, TimelinePhase, TimelineStatus } from '../treatment/TreatmentTimeline';

export { default as ClinicFloorPlan } from '../clinic/ClinicFloorPlan';
export type { ClinicFloorPlanProps, Chair, ChairStatus, WaitingPatient } from '../clinic/ClinicFloorPlan';

export { default as BeforeAfterSlider } from '../patient/BeforeAfterSlider';
export type { BeforeAfterSliderProps, BeforeAfterPair, ComparisonType } from '../patient/BeforeAfterSlider';

export { default as TmjAnatomy } from '../anatomy/TmjAnatomy';
export type { TmjAnatomyProps, PainPoint, BruxismMarker, BotoxPoint, PainPointType, BotoxZone } from '../anatomy/TmjAnatomy';

