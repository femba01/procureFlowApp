import supabase from "./supabase";

export interface PurchaseOrderItemRecord {
  id: string;
  purchase_order_id: string;
  request_item_id: string | null;
  description: string;
  ordered_quantity: number;
  received_quantity: number;
  unit_price: number;
}

export interface PurchaseOrderRecord {
  id: string;
  po_number: string;
  request_id: string;
  quotation_id: string;
  supplier_id: string;
  status: string;
  issued_at: string;
  expected_delivery: string;
  total: number;
  currency: string;
  payment_terms: string | null;
  delivery_address: string;
  notes: string | null;
  supplier: {
    name: string;
    supplier_number: string;
  } | null;
  purchase_request: {
    id: string;
    request_number: string;
    title: string;
    organization_id: string;
  } | null;
  purchase_order_items: PurchaseOrderItemRecord[];
}

const orderSelect = `
  *,
  supplier:suppliers(name, supplier_number),
  purchase_request:purchase_requests!inner(id, request_number, title, organization_id),
  purchase_order_items(*)
`;

export const getPurchaseOrders = async (organizationId: string) => {
  const { data, error } = await supabase
    .from("purchase_orders")
    .select(orderSelect)
    .eq("purchase_request.organization_id", organizationId)
    .order("issued_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as unknown as PurchaseOrderRecord[];
};

export const getPurchaseOrderById = async (
  id: string,
  organizationId: string,
) => {
  const { data, error } = await supabase
    .from("purchase_orders")
    .select(orderSelect)
    .eq("id", id)
    .eq("purchase_request.organization_id", organizationId)
    .single();

  if (error) throw new Error(error.message);
  return data as unknown as PurchaseOrderRecord;
};
