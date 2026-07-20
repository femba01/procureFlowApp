import { createAuditLog } from "./auditLogsApi";
import { getQuotationById } from "./quotationsApi";
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

const createPurchaseOrderNumber = () =>
  `PO-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

export const createPurchaseOrder = async ({
  quotationId,
  deliveryAddress,
  expectedDelivery,
  notes,
  organizationId,
  actorId,
}: {
  quotationId: string;
  deliveryAddress: string;
  expectedDelivery: string;
  notes?: string;
  organizationId: string;
  actorId: string;
}) => {
  const quotation = await getQuotationById(quotationId, organizationId);
  if (quotation.status !== "selected") {
    throw new Error("Select the quotation before generating a purchase order");
  }

  const requestItemIds = quotation.quotation_items.map((item) => item.request_item_id);
  const { data: requestItems, error: requestItemsError } = await supabase
    .from("request_items")
    .select("id, description")
    .in("id", requestItemIds);
  if (requestItemsError) throw new Error(requestItemsError.message);
  const descriptions = new Map(requestItems.map((item) => [item.id, item.description]));

  const { data: order, error: orderError } = await supabase
    .from("purchase_orders")
    .insert({
      po_number: createPurchaseOrderNumber(),
      request_id: quotation.request_id,
      quotation_id: quotation.id,
      supplier_id: quotation.supplier_id,
      status: "issued",
      expected_delivery: expectedDelivery,
      total: quotation.total,
      currency: quotation.currency,
      payment_terms: quotation.payment_terms,
      delivery_address: deliveryAddress.trim(),
      notes: notes?.trim() || null,
    })
    .select("*")
    .single();
  if (orderError) throw new Error(orderError.message);

  const rollback = async () => {
    await supabase.from("purchase_order_items").delete().eq("purchase_order_id", order.id);
    await supabase.from("purchase_orders").delete().eq("id", order.id);
  };
  const { error: itemsError } = await supabase.from("purchase_order_items").insert(
    quotation.quotation_items.map((item) => ({
      purchase_order_id: order.id,
      request_item_id: item.request_item_id,
      description: descriptions.get(item.request_item_id) || "Quoted item",
      ordered_quantity: item.quantity,
      received_quantity: 0,
      unit_price: item.unit_price,
    })),
  );
  if (itemsError) {
    await rollback();
    throw new Error(itemsError.message);
  }

  try {
    await createAuditLog({
      organization_id: organizationId,
      actor_id: actorId,
      action: "Issued",
      entity_type: "Purchase order",
      entity_id: order.id,
      description: `Purchase order ${order.po_number} was issued to ${quotation.supplier?.name || "supplier"}.`,
      metadata: {
        quotation_id: quotation.id,
        request_id: quotation.request_id,
        supplier_id: quotation.supplier_id,
        total: quotation.total,
        currency: quotation.currency,
      },
    });
  } catch (auditError) {
    await rollback();
    throw auditError;
  }
  return order as PurchaseOrderRecord;
};
