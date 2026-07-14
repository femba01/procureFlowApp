export type Role =
  | "Administrator"
  | "Procurement Officer"
  | "Finance Officer"
  | "Department Manager"
  | "Employee";
export type RequestStatus =
  | "Draft"
  | "Pending approval"
  | "Approved"
  | "In procurement"
  | "Completed"
  | "Rejected";
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  organization: string;
  initials: string;
}
export interface PurchaseRequest {
  id: string;
  title: string;
  department: string;
  requester: string;
  amount: number;
  status: RequestStatus;
  priority: "Low" | "Medium" | "High";
  createdAt: string;
  items: number;
}
export interface RequestItem {
  id: string;
  description: string;
  category: string;
  quantity: number;
  unitPrice: number;
}
export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  actor: string;
  createdAt: string;
  type: "created" | "submitted" | "approved" | "commented" | "rejected";
}
export interface PurchaseRequestDetails extends PurchaseRequest {
  businessReason: string;
  neededBy: string;
  costCentre: string;
  vendorPreference?: string;
  lineItems: RequestItem[];
  timeline: TimelineEvent[];
}
export interface CreateRequestInput {
  title: string;
  department: string;
  priority: "Low" | "Medium" | "High";
  businessReason: string;
  neededBy: string;
  costCentre: string;
  vendorPreference?: string;
  lineItems: Omit<RequestItem, "id">[];
}
export type SupplierStatus = "Active" | "Under review" | "Suspended";
export interface Supplier {
  id: string;
  name: string;
  category: string;
  contactName: string;
  email: string;
  phone: string;
  location: string;
  status: SupplierStatus;
  rating: number;
  onTimeDelivery: number;
  qualityScore: number;
  totalOrders: number;
  totalSpend: number;
  complianceExpiry: string;
  initials: string;
}
export interface CreateSupplierInput {
  name: string;
  category: string;
  contactName: string;
  email: string;
  phone: string;
  location: string;
  taxId: string;
  paymentTerms: string;
}
export interface Quotation {
  id: string;
  supplierId: string;
  supplierName: string;
  requestId: string;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  deliveryDays: number;
  paymentTerms: string;
  warranty: string;
  validUntil: string;
  technicalScore: number;
  status: "Received" | "Selected" | "Declined";
}
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
export interface DepartmentBudget {
  id: string;
  department: string;
  owner: string;
  allocated: number;
  committed: number;
  spent: number;
  period: string;
  status: "Healthy" | "Watch" | "Critical";
  monthly: { month: string; actual: number; plan: number }[];
}
export interface SpendRecord {
  id: string;
  date: string;
  department: string;
  category: string;
  supplier: string;
  description: string;
  amount: number;
  type: "Purchase order" | "Direct expense";
  reference: string;
}
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
export interface OrganisationSettings {
  id: string;
  companyName: string;
  legalName: string;
  email: string;
  phone: string;
  website: string;
  taxId: string;
  address: string;
  country: string;
  currency: string;
  timezone: string;
  financialYearStart: string;
  purchaseOrderPrefix: string;
  requestPrefix: string;
  defaultPaymentTerms: string;
  defaultWarehouseId: string;
  requireThreeQuotes: boolean;
  allowEmergencyPurchases: boolean;
  autoCreateInventory: boolean;
  managerApprovalThreshold: number;
  financeApprovalThreshold: number;
  executiveApprovalThreshold: number;
  emailApprovals: boolean;
  emailOrders: boolean;
  emailReceipts: boolean;
  emailLowStock: boolean;
  dailyDigest: boolean;
  lowStockDigestTime: string;
}
export interface DashboardData {
  spend: number;
  budget: number;
  pending: number;
  suppliers: number;
  monthly: { month: string; spend: number; budget: number }[];
  categories: { name: string; value: number; color: string }[];
  requests: PurchaseRequest[];
}
