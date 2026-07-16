import type { PurchaseRequest, RequestItem } from "../types/requests";
import type { RequestFormValues } from "../schemas/request";
import supabase from "./supabase";

export interface CreatePurchaseRequestInput extends RequestFormValues {
  organizationId: string;
  requesterId: string;
}

const createRequestNumber = () => {
  const year = new Date().getFullYear();
  const uniquePart = crypto.randomUUID().slice(0, 8).toUpperCase();
  return `PR-${year}-${uniquePart}`;
};

export const getPurchaseRequests = async (organizationId: string) => {
    const { data, error } = await supabase.from('purchase_requests').select('*').eq('organization_id', organizationId);
    if (error) {
        throw new Error(error.message);
    }
    return data as PurchaseRequest[];
}

export const getPurchaseRequestsById = async (id: string) => {
    const { data, error } = await supabase.from('purchase_requests').select('*').eq('id', id).single();
    if (error) {
        throw new Error(error.message);
    }
    return data as PurchaseRequest;
}

export const getRequestItems = async (request_id: string) => {
    const { data, error } = await supabase.from('request_items').select('*').eq('request_id', request_id);
    if (error) {
        throw new Error(error.message);
    }
    return data as RequestItem[];
}

export const createPurchaseRequest = async ({
  organizationId,
  requesterId,
  departmentId,
  department,
  requester,
  title,
  businessReason,
  priority,
  neededBy,
  costCentre,
  preferredSupplierId,
  lineItems,
}: CreatePurchaseRequestInput) => {
  const estimatedTotal = lineItems.reduce(
    (total, item) => total + item.quantity * item.unitPrice,
    0,
  );

  const { data: request, error: requestError } = await supabase
    .from("purchase_requests")
    .insert({
      organization_id: organizationId,
      request_number: createRequestNumber(),
      requester_id: requesterId,
      department_id: departmentId,
      department: department,
      requester: requester,
      title,
      business_reason: businessReason,
      priority,
      status: "Draft",
      needed_by: neededBy,
      cost_centre: costCentre,
      preferred_supplier_id: preferredSupplierId || null,
      estimated_total: estimatedTotal,
      currency: "NGN",
    })
    .select("*")
    .single();

  if (requestError) throw new Error(requestError.message);

  const { data: items, error: itemsError } = await supabase
    .from("request_items")
    .insert(
      lineItems.map((item) => ({
        request_id: request.id,
        description: item.description,
        category: item.category,
        quantity: item.quantity,
        unit_price: item.unitPrice,
      })),
    )
    .select("*");

  if (itemsError) {
    // Avoid leaving an incomplete request if the second insert fails.
    await supabase.from("purchase_requests").delete().eq("id", request.id);
    throw new Error(itemsError.message);
  }

  return { ...request, items };
};
