export type AuditAction =
  | "Created"
  | "Approved"
  | "Rejected"
  | "Updated"
  | "Issued"
  | "Received"
  | "Adjusted"
  | "Selected";

export interface AuditLog {
  id: string;
  action: AuditAction;
  entityType:
    | "Purchase request"
    | "Supplier"
    | "Quotation"
    | "Purchase order"
    | "Goods receipt"
    | "Inventory";
  entityId: string;
  description: string;
  actor: string;
  role: string;
  createdAt: string;
  metadata?: string;
}
