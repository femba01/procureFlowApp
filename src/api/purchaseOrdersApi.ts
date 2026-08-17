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
    department_id: string;
  } | null;
  purchase_order_items: PurchaseOrderItemRecord[];
}

const orderSelect = `
  *,
  supplier:suppliers(name, supplier_number),
  purchase_request:purchase_requests!inner(id, request_number, title, organization_id, department_id),
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

  const requestItemIds = quotation.quotation_items.map(
    (item) => item.request_item_id,
  );
  const { data: requestItems, error: requestItemsError } = await supabase
    .from("request_items")
    .select("id, description")
    .in("id", requestItemIds);
  if (requestItemsError) throw new Error(requestItemsError.message);
  const descriptions = new Map(
    requestItems.map((item) => [item.id, item.description]),
  );

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
    await supabase
      .from("purchase_order_items")
      .delete()
      .eq("purchase_order_id", order.id);
    await supabase.from("purchase_orders").delete().eq("id", order.id);
  };
  const { error: itemsError } = await supabase
    .from("purchase_order_items")
    .insert(
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

export const updateOrderReceipt = async (input: {
  orderId: string;
  organizationId: string;
  actorId: string;
  status:
    "issued" | "acknowledged" | "partially_received" | "received" | "cancelled";
  items: Array<{ id: string; receivedQuantity: number }>;
}) => {
  const { orderId, organizationId, actorId, status, items } = input;

  const order = await getPurchaseOrderById(orderId, organizationId);
  if (order.status.toLowerCase() === "received") {
    throw new Error("This purchase order has already been fully received.");
  }
  if (items.length === 0) {
    throw new Error("This order has no item quantities to update.");
  }

  const orderItems = new Map(
    order.purchase_order_items.map((item) => [item.id, item]),
  );
  const updatedItemIds = new Set<string>();

  for (const item of items) {
    const orderItem = orderItems.get(item.id);
    if (!orderItem) {
      throw new Error(
        "One of the submitted items does not belong to this order.",
      );
    }
    if (
      !Number.isInteger(item.receivedQuantity) ||
      item.receivedQuantity < 0 ||
      item.receivedQuantity > orderItem.ordered_quantity
    ) {
      throw new Error(
        `Received quantity for ${orderItem.description} must be between 0 and ${orderItem.ordered_quantity}.`,
      );
    }
    updatedItemIds.add(item.id);
  }

  if (updatedItemIds.size !== order.purchase_order_items.length) {
    throw new Error("A received quantity is required for every order item.");
  }

  if (
    status === "received" &&
    items.some(
      (item) =>
        item.receivedQuantity !== orderItems.get(item.id)?.ordered_quantity,
    )
  ) {
    throw new Error(
      "Every received quantity must match the ordered quantity before marking the order as received.",
    );
  }

  let budget: { id: string; spent: number } | null = null;
  if (status === "received") {
    const departmentId = order.purchase_request?.department_id;
    if (!departmentId) {
      throw new Error(
        "The linked purchase request does not have a department.",
      );
    }

    const { data: existingSpend, error: existingSpendError } = await supabase
      .from("spend_records")
      .select("id")
      .eq("spend_type", "purchase_order")
      .eq("reference", order.po_number)
      .maybeSingle();
    if (existingSpendError) throw new Error(existingSpendError.message);
    if (existingSpend) {
      throw new Error(
        "Spending has already been posted for this purchase order.",
      );
    }

    const { data: departmentBudget, error: budgetLoadError } = await supabase
      .from("department_budgets")
      .select("id, spent")
      .eq("department_id", departmentId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (budgetLoadError) throw new Error(budgetLoadError.message);
    if (!departmentBudget) {
      throw new Error(
        "No department budget exists for this order's department.",
      );
    }
    budget = departmentBudget;
  }

  const restoreItems = async () => {
    await Promise.all(
      order.purchase_order_items.map((item) =>
        supabase
          .from("purchase_order_items")
          .update({ received_quantity: item.received_quantity })
          .eq("id", item.id)
          .eq("purchase_order_id", orderId),
      ),
    );
  };

  const restoreOrder = async () => {
    await supabase
      .from("purchase_orders")
      .update({ status: order.status })
      .eq("id", orderId);
  };

  const itemResults = await Promise.all(
    items.map((item) =>
      supabase
        .from("purchase_order_items")
        .update({ received_quantity: item.receivedQuantity })
        .eq("id", item.id)
        .eq("purchase_order_id", orderId)
        .select("id, received_quantity")
        .single(),
    ),
  );
  const itemUpdateError = itemResults.find((result) => result.error)?.error;
  if (itemUpdateError) {
    await restoreItems();
    throw new Error(itemUpdateError.message);
  }

  const { error: statusError } = await supabase
    .from("purchase_orders")
    .update({ status })
    .eq("id", orderId)
    .select("id")
    .single();
  if (statusError) {
    await restoreItems();
    throw new Error(statusError.message);
  }

  let spendRecordId: string | null = null;
  if (budget && order.purchase_request) {
    const { error: budgetUpdateError } = await supabase
      .from("department_budgets")
      .update({ spent: budget.spent + order.total })
      .eq("id", budget.id)
      .eq("spent", budget.spent)
      .select("id")
      .single();
    if (budgetUpdateError) {
      await restoreOrder();
      await restoreItems();
      throw new Error(
        `Department budget could not be updated: ${budgetUpdateError.message}`,
      );
    }

    const { data: spendRecord, error: spendRecordError } = await supabase
      .from("spend_records")
      .insert({
        department_id: order.purchase_request.department_id,
        supplier_id: order.supplier_id,
        description: `Purchase order ${order.po_number}`,
        category: "Purchase order",
        amount: order.total,
        currency: order.currency.trim(),
        spend_type: "purchase_order",
        reference: order.po_number,
        spent_on: new Date().toISOString().slice(0, 10),
      })
      .select("id")
      .single();
    if (spendRecordError) {
      await supabase
        .from("department_budgets")
        .update({ spent: budget.spent })
        .eq("id", budget.id)
        .eq("spent", budget.spent + order.total);
      await restoreOrder();
      await restoreItems();
      throw new Error(
        `Spending record could not be created: ${spendRecordError.message}`,
      );
    }
    spendRecordId = spendRecord.id;
  }

  try {
    await createAuditLog({
      organization_id: organizationId,
      actor_id: actorId,
      action: status === "received" ? "Received" : "Updated",
      entity_type: "Purchase order",
      entity_id: orderId,
      description:
        status === "received"
          ? `Purchase order ${order.po_number} was fully received and posted to spending.`
          : `Purchase order ${order.po_number} status updated to ${status}.`,
      metadata: {
        order_id: orderId,
        previous_status: order.status,
        new_status: status,
        budget_id: budget?.id ?? null,
        spend_record_id: spendRecordId,
        posted_amount: budget ? order.total : 0,
      },
    });
  } catch (auditError) {
    if (spendRecordId) {
      await supabase.from("spend_records").delete().eq("id", spendRecordId);
    }
    if (budget) {
      await supabase
        .from("department_budgets")
        .update({ spent: budget.spent })
        .eq("id", budget.id)
        .eq("spent", budget.spent + order.total);
    }
    await restoreOrder();
    await restoreItems();
    throw auditError;
  }

  return { orderId, status, spendRecordId };
};
