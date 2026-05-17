import api from "./api";
import type { InventoryAlerts, InventoryCategory, InventoryDto } from "../types/inventory";

interface ApiEnvelope<T> {
  success: true;
  data: T;
}

export interface ListInventoryParams {
  category?: InventoryCategory;
  lowStock?: boolean;
  q?: string;
}

export async function fetchInventory(params: ListInventoryParams = {}): Promise<InventoryDto[]> {
  const res = await api.get<ApiEnvelope<InventoryDto[]>>("/inventory", { params }) as any;
  return res.data;
}

export async function fetchInventoryAlerts(): Promise<InventoryAlerts> {
  const res = await api.get<ApiEnvelope<InventoryAlerts>>(`/inventory/alerts`) as any;
  return res.data;
}

export interface InventoryUpsertBody {
  itemName: string;
  category: InventoryCategory;
  unit: string;
  quantity: number;
  minimumStock: number;
  unitCost: number;
  supplier?: string | null;
  expiryDate?: string | null;
}

export async function createInventoryItem(body: InventoryUpsertBody): Promise<InventoryDto> {
  const res = await api.post<ApiEnvelope<InventoryDto>>(`/inventory`, body) as any;
  return res.data;
}

export async function updateInventoryItem(
  id: string,
  body: Partial<InventoryUpsertBody>,
): Promise<InventoryDto> {
  const res = await api.put<ApiEnvelope<InventoryDto>>(`/inventory/${id}`, body) as any;
  return res.data;
}

export async function deleteInventoryItem(id: string): Promise<void> {
  await api.delete(`/inventory/${id}`);
}

export async function adjustInventoryItem(
  id: string,
  change: number,
  reason: string,
): Promise<InventoryDto> {
  const res = await api.post<ApiEnvelope<InventoryDto>>(`/inventory/${id}/adjust`, { change, reason }) as any;
  return res.data;
}
