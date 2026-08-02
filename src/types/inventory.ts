import type { Actor } from "./auth";

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  manager: string;
}

export type StockStatus = "In stock" | "Low stock" | "Out of stock";

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  warehouseId: string;
  warehouseName: string;
  quantity: number;
  reserved: number;
  reorderLevel: number;
  unitCost: number;
  lastUpdated: string;
  status: StockStatus;
}

export type MovementType =
  | "Goods receipt"
  | "Issue"
  | "Positive adjustment"
  | "Negative adjustment"
  | "Transfer";


export interface StockMovement {
  id: string;
  itemId: string;
  movement_type: MovementType;
  quantity_change: number;
  balance_after: number;
  reference: string;
  warehouseName: string;
  performedBy: string;
  created_at: string;
  notes?: string;
  actor?: Actor;
}

export interface StockAdjustmentInput {
  itemId: string;
  type: "Positive adjustment" | "Negative adjustment";
  quantity: number;
  reason: string;
  reference: string;
}
