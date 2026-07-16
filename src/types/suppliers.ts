export type SupplierStatus = "active" | "under_review" | "suspended";

export interface Supplier {
  id: string;
  organization_id: string;
  supplier_number: string;
  name: string;
  category: string;
  contact_name: string;
  email: string;
  phone: string | null;
  location: string | null;
  tax_id: string | null;
  payment_terms: string | null;
  status: SupplierStatus;
  rating: number;
  on_time_delivery_pct: number;
  quality_score_pct: number;
  created_at: string;
}

export type CreateSupplierInput = Pick<
  Supplier,
  "organization_id" | "name" | "category" | "contact_name" | "email"
> &
  Partial<
    Pick<Supplier, "phone" | "location" | "tax_id" | "payment_terms">
  >;

export type SupplierOption = Pick<Supplier, "id" | "name">;
