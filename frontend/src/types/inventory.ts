export const INVENTORY_CATEGORIES = [
  "Anesthetics",
  "Filling Materials",
  "Disposables",
  "Instruments",
  "Medications",
  "Other",
] as const;

export type InventoryCategory = (typeof INVENTORY_CATEGORIES)[number];

/** `pages.inventory.categories.*` i18n suffixes */
export const INVENTORY_CATEGORY_I18N_KEY: Record<InventoryCategory, string> = {
  Anesthetics: "anesthetics",
  "Filling Materials": "fillingMaterials",
  Disposables: "disposables",
  Instruments: "instruments",
  Medications: "medications",
  Other: "other",
};
export type InventoryStatus = "OK" | "LOW" | "CRITICAL";

export interface InventoryDto {
  id: string;
  clinicId: string;
  itemName: string;
  category: InventoryCategory;
  unit: string;
  quantity: number;
  minimumStock: number;
  unitCost: string;
  supplier: string | null;
  expiryDate: string | null;
  updatedAt: string;
  status: InventoryStatus;
  daysUntilExpiry: number | null;
}

export interface InventoryAlerts {
  lowStock: InventoryDto[];
  expiringSoon: InventoryDto[];
  counts: {
    low: number;
    critical: number;
    expiring: number;
  };
}

export const INVENTORY_STATUS_STYLES: Record<
  InventoryStatus,
  { pillBg: string; pillText: string; ring: string; dot: string; label: string }
> = {
  OK: {
    pillBg: "bg-teal-100",
    pillText: "text-teal-800",
    ring: "ring-teal-200",
    dot: "bg-teal-500",
    label: "OK",
  },
  LOW: {
    pillBg: "bg-amber-100",
    pillText: "text-amber-800",
    ring: "ring-amber-200",
    dot: "bg-amber-500",
    label: "Low",
  },
  CRITICAL: {
    pillBg: "bg-rose-100",
    pillText: "text-rose-700",
    ring: "ring-rose-200",
    dot: "bg-rose-500",
    label: "Critical",
  },
};
