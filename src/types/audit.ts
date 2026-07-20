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
    | "Inventory"
    | "Warehouse"
    | "Department budget"
    | "Quotation invitation";
  entityId: string;
  description: string;
  actor: string;
  role: string;
  createdAt: string;
  metadata?: string;
}

export interface AuditLogRecord {
  id: string;
  organization_id: string;
  actor_id: string | null;
  action: AuditAction;
  entity_type: 
    | "Purchase request"
    | "Supplier"
    | "Quotation"
    | "Purchase order"
    | "Goods receipt"
    | "Inventory"
    | "Warehouse"
    | "Department budget"
    | "Quotation invitation";
  entity_id: string | null;
  description: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  actor: {
    name: string;
    email: string | null;
    role: string | null;
  } | null;
}

export type CreateAuditLogInput = Omit<
  AuditLogRecord,
  "id" | "created_at" | "actor"
>;
