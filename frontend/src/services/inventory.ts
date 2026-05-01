import { apiFetch } from "./api";

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
  const qs = new URLSearchParams();
  if (params.category) qs.set("category", params.category);
  if (params.lowStock) qs.set("lowStock", "true");
  if (params.q) qs.set("q", params.q);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  const res = await apiFetch<ApiEnvelope<InventoryDto[]>>(`/inventory${suffix}`);
  return res.data;
}

export async function fetchInventoryAlerts(): Promise<InventoryAlerts> {
  const res = await apiFetch<ApiEnvelope<InventoryAlerts>>(`/inventory/alerts`);
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
  const res = await apiFetch<ApiEnvelope<InventoryDto>>(`/inventory`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return res.data;
}

export async function updateInventoryItem(
  id: string,
  body: Partial<InventoryUpsertBody>,
): Promise<InventoryDto> {
  const res = await apiFetch<ApiEnvelope<InventoryDto>>(`/inventory/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return res.data;
}

export async function deleteInventoryItem(id: string): Promise<void> {
  await apiFetch<ApiEnvelope<{ id: string }>>(`/inventory/${id}`, { method: "DELETE" });
}

export async function adjustInventoryItem(
  id: string,
  change: number,
  reason: string,
): Promise<InventoryDto> {
  const res = await apiFetch<ApiEnvelope<InventoryDto>>(`/inventory/${id}/adjust`, {
    method: "POST",
    body: JSON.stringify({ change, reason }),
  });
  return res.data;
}
