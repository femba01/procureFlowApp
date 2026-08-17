export type PurchaseOrderStatus =
  | "Draft"
  | "Issued"
  | "Acknowledged"
  | "Partially received"
  | "Received"
  | "Cancelled";

export interface PurchaseOrderItem {
  id: string;
  description: string;
  orderedQuantity: number;
  receivedQuantity: number;
  unitPrice: number;
}

export interface GoodsReceipt {
  id: string;
  orderId: string;
  receivedAt: string;
  receivedBy: string;
  deliveryNote: string;
  condition: "Accepted" | "Accepted with issues";
  notes?: string;
  items: { itemId: string; quantity: number }[];
}

export interface PurchaseOrder {
  id: string;
  requestId: string;
  quotationId: string;
  supplierId: string;
  supplierName: string;
  status: PurchaseOrderStatus;
  issuedAt: string;
  expectedDelivery: string;
  total: number;
  currency: string;
  paymentTerms: string;
  deliveryAddress: string;
  items: PurchaseOrderItem[];
  receipts: GoodsReceipt[];
}

export interface CreateOrderInput {
  quotationId: string;
  deliveryAddress: string;
  expectedDelivery: string;
  notes?: string;
}

export interface CreateReceiptInput {
  orderId: string;
  deliveryNote: string;
  condition: "Accepted" | "Accepted with issues";
  notes?: string;
  items: { itemId: string; quantity: number }[];
}

export interface UpdateOrderReceiptInput {
  orderId: string;
  organizationId: string;
  actorId: string;
  status:
    "issued" | "acknowledged" | "partially_received" | "received" | "cancelled";
  items: Array<{ id: string; receivedQuantity: number }>;
}