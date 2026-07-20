export type QuotationStatus = "received" | "selected" | "declined";
export type QuotationInvitationStatus =
  | "pending"
  | "opened"
  | "submitted"
  | "expired"
  | "revoked";

export interface QuotationItemRecord {
  id: string;
  quotation_id: string;
  request_item_id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  created_at: string;
  requested_quantity: number | null;
  available_quantity: number | null;
  unit: string;
  tax_rate: number;
  discount: number;
  tax_amount: number;
  lead_time_days: number | null;
  alternative: string | null;
  supplier_notes: string | null;
}

export interface QuotationRecord {
  id: string;
  quotation_number: string;
  request_id: string;
  supplier_id: string;
  subtotal: number;
  delivery_fee: number;
  tax: number;
  total: number;
  delivery_days: number;
  payment_terms: string;
  warranty: string | null;
  valid_until: string;
  technical_score: number;
  status: QuotationStatus;
  created_at: string;
  supplier_reference: string | null;
  currency: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  supplier_notes: string | null;
  submitted_at: string | null;
  supplier: { id: string; name: string; supplier_number: string } | null;
  purchase_request: {
    id: string;
    request_number: string;
    title: string;
    organization_id: string;
  } | null;
  quotation_items: QuotationItemRecord[];
}

export interface QuotationInvitationRecord {
  id: string;
  request_id: string;
  supplier_id: string;
  status: QuotationInvitationStatus;
  expires_at: string;
  opened_at: string | null;
  submitted_at: string | null;
  quotation_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  supplier: { id: string; name: string; email: string } | null;
}
