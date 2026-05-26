import { supabase } from "../lib/supabase";
import type { InventoryAlerts, InventoryCategory, InventoryDto } from "../types/inventory";

export interface ListInventoryParams {
  category?: InventoryCategory;
  lowStock?: boolean;
  q?: string;
}

export async function fetchInventory(params: ListInventoryParams = {}): Promise<InventoryDto[]> {
  let query = supabase.from("inventory_items").select("*");

  if (params.q) {
    query = query.ilike("name", `%${params.q}%`);
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  let results = (data || []).map((row: any) => ({
    id: row.id,
    itemName: row.name,
    skuCode: row.sku || "",
    category: "SUPPLIES" as InventoryCategory, // mocked missing field
    quantity: row.stock_qty,
    unit: "pcs", // mocked missing field
    minimumStock: row.low_stock_threshold,
    unitCost: 0, // mocked missing field
    totalValue: 0,
    status: row.stock_qty <= 0 ? "OUT_OF_STOCK" : row.stock_qty <= row.low_stock_threshold ? "LOW_STOCK" : "IN_STOCK",
    lastRestockedAt: row.created_at,
    supplier: null,
    expiryDate: null,
    createdAt: row.created_at,
    updatedAt: row.created_at,
  }));

  if (params.category) {
    results = results.filter((r) => r.category === params.category);
  }
  if (params.lowStock) {
    results = results.filter((r) => r.status === "LOW_STOCK" || r.status === "OUT_OF_STOCK");
  }

  return results as InventoryDto[];
}

export async function fetchInventoryAlerts(): Promise<InventoryAlerts> {
  const items = await fetchInventory();
  const lowStockItems = items.filter((i) => i.status === "LOW_STOCK");
  const outOfStockItems = items.filter((i) => i.status === "OUT_OF_STOCK");
  // Demo data for expiring items
  return {
    lowStockItems,
    outOfStockItems,
    expiringItems: [],
  };
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("clinic_id")
    .eq("id", user.id)
    .single();

  if (!profile?.clinic_id) throw new Error("No clinic assigned");

  const { data, error } = await supabase
    .from("inventory_items")
    .insert({
      clinic_id: profile.clinic_id,
      name: body.itemName,
      sku: null,
      stock_qty: body.quantity,
      low_stock_threshold: body.minimumStock
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return {
    id: data.id,
    itemName: data.name,
    skuCode: data.sku || "",
    category: body.category,
    quantity: data.stock_qty,
    unit: body.unit,
    minimumStock: data.low_stock_threshold,
    unitCost: body.unitCost,
    totalValue: body.unitCost * data.stock_qty,
    status: data.stock_qty <= 0 ? "OUT_OF_STOCK" : data.stock_qty <= data.low_stock_threshold ? "LOW_STOCK" : "IN_STOCK",
    lastRestockedAt: data.created_at,
    supplier: body.supplier || null,
    expiryDate: body.expiryDate || null,
    createdAt: data.created_at,
    updatedAt: data.created_at,
  } as InventoryDto;
}

export async function updateInventoryItem(
  id: string,
  body: Partial<InventoryUpsertBody>,
): Promise<InventoryDto> {
  const updates: any = {};
  if (body.itemName) updates.name = body.itemName;
  if (body.quantity !== undefined) updates.stock_qty = body.quantity;
  if (body.minimumStock !== undefined) updates.low_stock_threshold = body.minimumStock;

  const { data, error } = await supabase
    .from("inventory_items")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return {
    id: data.id,
    itemName: data.name,
    skuCode: data.sku || "",
    category: body.category || "SUPPLIES",
    quantity: data.stock_qty,
    unit: body.unit || "pcs",
    minimumStock: data.low_stock_threshold,
    unitCost: body.unitCost || 0,
    totalValue: 0,
    status: data.stock_qty <= 0 ? "OUT_OF_STOCK" : data.stock_qty <= data.low_stock_threshold ? "LOW_STOCK" : "IN_STOCK",
    lastRestockedAt: data.created_at,
    supplier: body.supplier || null,
    expiryDate: body.expiryDate || null,
    createdAt: data.created_at,
    updatedAt: data.created_at,
  } as InventoryDto;
}

export async function deleteInventoryItem(id: string): Promise<void> {
  const { error } = await supabase.from("inventory_items").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function adjustInventoryItem(
  id: string,
  change: number,
  reason: string,
): Promise<InventoryDto> {
  // First fetch the current item
  const { data: current, error: fetchErr } = await supabase
    .from("inventory_items")
    .select("stock_qty")
    .eq("id", id)
    .single();
  
  if (fetchErr) throw new Error(fetchErr.message);

  const newQty = Math.max(0, current.stock_qty + change);

  const { data, error } = await supabase
    .from("inventory_items")
    .update({ stock_qty: newQty })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return {
    id: data.id,
    itemName: data.name,
    skuCode: data.sku || "",
    category: "SUPPLIES" as InventoryCategory,
    quantity: data.stock_qty,
    unit: "pcs",
    minimumStock: data.low_stock_threshold,
    unitCost: 0,
    totalValue: 0,
    status: data.stock_qty <= 0 ? "OUT_OF_STOCK" : data.stock_qty <= data.low_stock_threshold ? "LOW_STOCK" : "IN_STOCK",
    lastRestockedAt: data.created_at,
    supplier: null,
    expiryDate: null,
    createdAt: data.created_at,
    updatedAt: data.created_at,
  } as InventoryDto;
}
