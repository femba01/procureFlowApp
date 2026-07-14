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
  type: MovementType;
  quantity: number;
  balanceAfter: number;
  reference: string;
  warehouseName: string;
  performedBy: string;
  createdAt: string;
  notes?: string;
}

export interface StockAdjustmentInput {
  itemId: string;
  type: "Positive adjustment" | "Negative adjustment";
  quantity: number;
  reason: string;
  reference: string;
}
