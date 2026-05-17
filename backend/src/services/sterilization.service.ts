import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import type { CreateSterilizationLogInput } from "../validation/sterilization.schemas.js";

export async function listSterilizationLogs(clinicId: string) {
  return prisma.sterilizationLog.findMany({
    where: { clinicId },
    orderBy: { createdAt: "desc" },
    include: { operator: { select: { id: true, firstName: true, lastName: true } } },
  });
}

export async function createSterilizationLog(clinicId: string, data: CreateSterilizationLogInput) {
  return prisma.sterilizationLog.create({
    data: {
      clinicId,
      autoclaveName: data.autoclaveName,
      cycleNumber: data.cycleNumber,
      temperature: new Prisma.Decimal(data.temperature.toFixed(1)),
      pressure: new Prisma.Decimal(data.pressure.toFixed(2)),
      durationMinutes: data.durationMinutes,
      operatorId: data.operatorId,
      status: data.status,
      biologicalIndicator: data.biologicalIndicator,
      notes: data.notes,
      startedAt: new Date(data.startedAt),
      completedAt: data.completedAt ? new Date(data.completedAt) : null,
    },
    include: { operator: { select: { id: true, firstName: true, lastName: true } } },
  });
}
