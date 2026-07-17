import { z } from "zod";

export const inventoryItemSchema = z
  .object({
    warehouseId: z.string().uuid("Select a warehouse"),
    sku: z.string().min(2, "SKU is required"),
    name: z.string().min(3, "Item name is required"),
    category: z.string().min(1, "Category is required"),
    quantity: z.number().int().min(0, "Quantity cannot be negative"),
    reservedQuantity: z.number().int().min(0, "Reserved quantity cannot be negative"),
    reorderLevel: z.number().int().min(0, "Reorder level cannot be negative"),
    unitCost: z.number().min(0, "Unit cost cannot be negative"),
  })
  .refine((values) => values.reservedQuantity <= values.quantity, {
    path: ["reservedQuantity"],
    message: "Reserved quantity cannot exceed quantity",
  });

export type InventoryItemFormValues = z.infer<typeof inventoryItemSchema>;

export const warehouseSchema = z.object({
  name: z.string().min(3, "Warehouse name is required"),
  code: z.string().min(2, "Warehouse code is required"),
  location: z.string().min(2, "Location is required"),
  managerProfileId: z.union([z.literal(""), z.string().uuid()]),
});

export type WarehouseFormValues = z.infer<typeof warehouseSchema>;
