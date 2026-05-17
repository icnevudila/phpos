import api from "./api";
import { unpackApiData } from "../utils/unpackApiData";

export interface LabOrder {
  id: string;
  labName: string | null;
  itemDescription: string;
  shade: string | null;
  mould: string | null;
  orderDate: string;
  dueDate: string | null;
  receivedDate: string | null;
  status: "ORDERED" | "SENT_TO_LAB" | "RECEIVED" | "COMPLETED" | "CANCELLED";
  notes: string | null;
  dentist: { id: string; firstName: string; lastName: string };
}

export async function listLabOrders(patientId: string): Promise<LabOrder[]> {
  const res = await api.get(`/lab-orders/patient/${patientId}`);
  return unpackApiData<LabOrder[]>(res);
}

export async function createLabOrder(data: any): Promise<LabOrder> {
  const res = await api.post("/lab-orders", data);
  return unpackApiData<LabOrder>(res);
}

export async function updateLabOrder(id: string, data: any): Promise<LabOrder> {
  const res = await api.put(`/lab-orders/${id}`, data);
  return unpackApiData<LabOrder>(res);
}

export async function deleteLabOrder(id: string): Promise<void> {
  await api.delete(`/lab-orders/${id}`);
}
