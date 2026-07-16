import type { PurchaseRequest, RequestItem } from "../types/requests";
import type { RequestFormValues } from "../schemas/request";
import { createAuditLog } from "./auditLogsApi";
import supabase from "./supabase";

export interface CreatePurchaseRequestInput extends RequestFormValues {
  organizationId: string;
  requesterId: string;
}

export interface RequestItemRecord {
  id: string;
  request_id: string;
  description: string;
  category: string;
  quantity: number;
  unit_price: number;
  created_at: string;
}

export interface PurchaseRequestDetailsRecord {
  id: string;
  organization_id: string;
  request_number: string;
  requester_id: string;
  department_id: string;
  title: string;
  business_reason: string;
  priority: string;
  status: string;
  needed_by: string;
  cost_centre: string;
  preferred_supplier_id: string | null;
  estimated_total: number;
  currency: string;
  created_at: string;
  department: string | null;
  requester: string | null;
  preferred_supplier: { name: string } | null;
  department_record: { name: string } | null;
  requester_profile: { name: string } | null;
  request_items: RequestItemRecord[];
}

const createRequestNumber = () => {
  const year = new Date().getFullYear();
  const uniquePart = crypto.randomUUID().slice(0, 8).toUpperCase();
  return `PR-${year}-${uniquePart}`;
};

export const getPurchaseRequests = async (organizationId: string, departmentId?: string, requesterId?: string) => {
  let query = supabase
    .from('purchase_requests')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (departmentId?.trim()) {
    query = query.eq('department_id', departmentId.trim());
  }
  if (requesterId?.trim()) {
    query = query.eq('requester_id', requesterId.trim());
  }
    const { data, error } = await query;
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

export const getPurchaseRequestDetails = async (id: string) => {
  const { data: request, error: requestError } = await supabase
    .from("purchase_requests")
    .select(
      "*, preferred_supplier:suppliers(name), department_record:departments(name), requester_profile:profiles(name)",
    )
    .eq("id", id)
    .single();

  if (requestError) throw new Error(requestError.message);

  const { data: items, error: itemsError } = await supabase
    .from("request_items")
    .select("*")
    .eq("request_id", id)
    .order("created_at");

  if (itemsError) throw new Error(itemsError.message);

  return {
    ...request,
    request_items: items,
  } as PurchaseRequestDetailsRecord;
};

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

  try {
    await createAuditLog({
      organization_id: organizationId,
      actor_id: requesterId,
      action: "Created",
      entity_type: "Purchase request",
      entity_id: request.id,
      description: `Purchase request ${request.request_number} was created.`,
      metadata: {
        request_number: request.request_number,
        title,
        item_count: lineItems.length,
        estimated_total: estimatedTotal,
        currency: "NGN",
        priority,
        status: request.status,
      },
    });
  } catch (auditError) {
    // request_items are removed by the purchase_requests ON DELETE CASCADE rule.
    await supabase.from("purchase_requests").delete().eq("id", request.id);
    throw auditError;
  }

  return { ...request, items };
};
