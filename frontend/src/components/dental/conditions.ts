import type { ToothCondition } from "../../types/dentalChart";

export interface ConditionMeta {
  label: string;
  fill: string;
  stroke?: string;
  strokePattern?: "solid" | "dashed" | "cross";
  textColor?: string;
}

export const CONDITION_META: Record<ToothCondition, ConditionMeta> = {
  HEALTHY: { label: "Healthy", fill: "#ffffff", stroke: "#94a3b8" },
  DECAY: { label: "Decay", fill: "#ef4444", textColor: "#ffffff" },
  FILLED: { label: "Filled", fill: "#3b82f6", textColor: "#ffffff" },
  CROWN: { label: "Crown", fill: "#eab308", textColor: "#1f2937" },
  EXTRACTED: { label: "Extracted", fill: "#9ca3af", strokePattern: "cross", textColor: "#1f2937" },
  MISSING: { label: "Missing", fill: "#f3f4f6", stroke: "#cbd5e1", strokePattern: "dashed" },
  ROOT_CANAL: { label: "Root canal", fill: "#8b5cf6", textColor: "#ffffff" },
};

export const CONDITION_ORDER: ToothCondition[] = [
  "HEALTHY",
  "DECAY",
  "FILLED",
  "CROWN",
  "ROOT_CANAL",
  "EXTRACTED",
  "MISSING",
];
