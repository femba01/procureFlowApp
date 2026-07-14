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
