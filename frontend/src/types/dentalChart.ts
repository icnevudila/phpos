/** Backend ToothCondition ile uyumlu */
export type ToothCondition =
  | "HEALTHY"
  | "DECAY"
  | "FILLED"
  | "EXTRACTED"
  | "CROWN"
  | "MISSING"
  | "ROOT_CANAL";

export type ToothSurface = "MESIAL" | "DISTAL" | "BUCCAL" | "LINGUAL" | "OCCLUSAL";

export interface Tooth {
  id?: string;
  toothNumber: number;
  condition: ToothCondition;
  surfaces: ToothSurface[];
  notes?: string | null;
  updatedAt?: string;
}

export interface DentalChartProps {
  patientId: string;
  teeth: Tooth[];
  onUpdate: () => void;
  readOnly?: boolean;
}
