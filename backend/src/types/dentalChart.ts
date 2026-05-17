import { ToothCondition } from "@prisma/client";

export { ToothCondition };

export interface Tooth {
  id: string;
  patientId: string;
  toothNumber: number;
  surfaces: string[];
  condition: ToothCondition;
  notes?: string | null;
  updatedAt: Date;
}
