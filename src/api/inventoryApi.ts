import type {
  InventoryItemFormValues,
  WarehouseFormValues,
} from "../schemas/inventory";
import { createAuditLog } from "./auditLogsApi";
import supabase from "./supabase";

export interface WarehouseRecord {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  location: string;
  manager_profile_id: string | null;
  created_at: string;
}

export interface InventoryItemRecord {
  id: string;
  organization_id: string;
  warehouse_id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  reserved_quantity: number;
  reorder_level: number;
  unit_cost: number;
  status: "in_stock" | "low_stock" | "out_of_stock";
  updated_at: string;
  warehouse: Pick<WarehouseRecord, "id" | "name" | "code" | "location"> | null;
}

export const getWarehouses = async (organizationId: string) => {
  const { data, error } = await supabase
    .from("warehouses")
    .select("*")
    .eq("organization_id", organizationId)
    .order("name");

  if (error) throw new Error(error.message);
  return data as WarehouseRecord[];
};

export const getInventoryItems = async (organizationId: string) => {
  const { data, error } = await supabase
    .from("inventory_items")
    .select("*, warehouse:warehouses(id, name, code, location)")
    .eq("organization_id", organizationId)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as unknown as InventoryItemRecord[];
};

export const getInventoryItemById = async (
  id: string,
  organizationId: string,
) => {
  const { data, error } = await supabase
    .from("inventory_items")
    .select("*, warehouse:warehouses(id, name, code, location)")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .single();

  if (error) throw new Error(error.message);
  return data as unknown as InventoryItemRecord;
};

const stockStatus = (
  quantity: number,
  reorderLevel: number,
): InventoryItemRecord["status"] =>
  quantity === 0
    ? "out_of_stock"
    : quantity <= reorderLevel
      ? "low_stock"
      : "in_stock";

export const createInventoryItem = async ({
  input,
  organizationId,
  actorId,
}: {
  input: InventoryItemFormValues;
  organizationId: string;
  actorId: string;
}) => {
  const { data, error } = await supabase
    .from("inventory_items")
    .insert({
      organization_id: organizationId,
      warehouse_id: input.warehouseId,
      sku: input.sku.trim().toUpperCase(),
      name: input.name.trim(),
      category: input.category.trim(),
      quantity: input.quantity,
      reserved_quantity: input.reservedQuantity,
      reorder_level: input.reorderLevel,
      unit_cost: input.unitCost,
      status: stockStatus(input.quantity, input.reorderLevel),
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  try {
    await createAuditLog({
      organization_id: organizationId,
      actor_id: actorId,
      action: "Created",
      entity_type: "Inventory",
      entity_id: data.id,
      description: `Inventory item ${data.name} (${data.sku}) was created.`,
      metadata: {
        sku: data.sku,
        warehouse_id: data.warehouse_id,
        quantity: data.quantity,
        unit_cost: data.unit_cost,
        status: data.status,
      },
    });
  } catch (auditError) {
    await supabase.from("inventory_items").delete().eq("id", data.id);
    throw auditError;
  }

  return data as InventoryItemRecord;
};

export const createWarehouse = async ({
  input,
  organizationId,
  actorId,
}: {
  input: WarehouseFormValues;
  organizationId: string;
  actorId: string;
}) => {
  const { data, error } = await supabase
    .from("warehouses")
    .insert({
      organization_id: organizationId,
      name: input.name.trim(),
      code: input.code.trim().toUpperCase(),
      location: input.location.trim(),
      manager_profile_id: input.managerProfileId || null,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  try {
    await createAuditLog({
      organization_id: organizationId,
      actor_id: actorId,
      action: "Created",
      entity_type: "Warehouse",
      entity_id: data.id,
      description: `Warehouse ${data.name} (${data.code}) was created.`,
      metadata: {
        code: data.code,
        name: data.name,
        location: data.location,
        manager_profile_id: data.manager_profile_id,
      },
    });
  } catch (auditError) {
    await supabase.from("warehouses").delete().eq("id", data.id);
    throw auditError;
  }

  return data as WarehouseRecord;
};
