import { prisma } from "../lib/prisma.js";
import { NotFoundError } from "../utils/errors.js";

export async function createLabOrder(clinicId: string, dentistId: string, data: any) {
  return prisma.labOrder.create({
    data: {
      clinicId,
      dentistId,
      patientId: data.patientId,
      labName: data.labName,
      itemDescription: data.itemDescription,
      shade: data.shade,
      mould: data.mould,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      cost: data.cost,
      notes: data.notes,
    },
    include: {
      patient: true,
      dentist: true,
    },
  });
}

export async function getLabOrdersByPatient(clinicId: string, patientId: string) {
  return prisma.labOrder.findMany({
    where: { clinicId, patientId },
    include: {
      dentist: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getLabOrderById(clinicId: string, id: string) {
  const order = await prisma.labOrder.findFirst({
    where: { id, clinicId },
    include: {
      patient: true,
      dentist: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
  });

  if (!order) throw new NotFoundError("Lab order not found");
  return order;
}

export async function updateLabOrder(clinicId: string, id: string, data: any) {
  const order = await prisma.labOrder.findFirst({
    where: { id, clinicId },
  });

  if (!order) throw new NotFoundError("Lab order not found");

  return prisma.labOrder.update({
    where: { id },
    data: {
      status: data.status,
      notes: data.notes !== undefined ? data.notes : order.notes,
      receivedDate: data.receivedDate ? new Date(data.receivedDate) : order.receivedDate,
    },
  });
}

export async function deleteLabOrder(clinicId: string, id: string) {
  const order = await prisma.labOrder.findFirst({
    where: { id, clinicId },
  });

  if (!order) throw new NotFoundError("Lab order not found");

  return prisma.labOrder.delete({
    where: { id },
  });
}
