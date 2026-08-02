import type { SupplierQuotationFormValues } from "../schemas/quotation";
import type {
  QuotationInvitationRecord,
  QuotationRecord,
} from "../types/quotations";
import { createAuditLog } from "./auditLogsApi";
import supabase from "./supabase";

const quotationSelect = `
  *,
  supplier:suppliers(id, name, supplier_number),
  purchase_request:purchase_requests!inner(id, request_number, title, organization_id),
  quotation_items(*)
`;

const createQuotationNumber = () =>
  `QT-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

const hashToken = async (token: string) => {
  const bytes = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
};

export const getQuotations = async (
  organizationId: string,
  requestId?: string,
) => {
  let query = supabase
    .from("quotations")
    .select(quotationSelect)
    .eq("purchase_request.organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (requestId) query = query.eq("request_id", requestId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as unknown as QuotationRecord[];
};

export const getQuotationById = async (
  id: string,
  organizationId: string,
) => {
  const { data, error } = await supabase
    .from("quotations")
    .select(quotationSelect)
    .eq("id", id)
    .eq("purchase_request.organization_id", organizationId)
    .single();
  if (error) throw new Error(error.message);
  return data as unknown as QuotationRecord;
};

export const getQuotationInvitations = async (
  organizationId: string,
  requestId: string,
) => {
  const { data, error } = await supabase
    .from("quotation_invitations")
    .select(
      "*, supplier:suppliers(id, name, email), purchase_request:purchase_requests!inner(organization_id)",
    )
    .eq("request_id", requestId)
    .eq("purchase_request.organization_id", organizationId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as unknown as QuotationInvitationRecord[];
};

export const createQuotationInvitation = async ({
  requestId,
  supplierId,
  expiresAt,
  organizationId,
  actorId,
}: {
  requestId: string;
  supplierId: string;
  expiresAt: string;
  organizationId: string;
  actorId: string;
}) => {
  const [{ data: request, error: requestError }, { data: supplier, error: supplierError }] =
    await Promise.all([
      supabase
        .from("purchase_requests")
        .select("id, request_number, title")
        .eq("id", requestId)
        .eq("organization_id", organizationId)
        .single(),
      supabase
        .from("suppliers")
        .select("id, name")
        .eq("id", supplierId)
        .eq("organization_id", organizationId)
        .single(),
    ]);
  if (requestError) throw new Error(requestError.message);
  if (supplierError) throw new Error(supplierError.message);

  const { data: existing, error: existingError } = await supabase
    .from("quotation_invitations")
    .select("*")
    .eq("request_id", requestId)
    .eq("supplier_id", supplierId)
    .maybeSingle();
  if (existingError) throw new Error(existingError.message);

  const token = `${crypto.randomUUID()}${crypto.randomUUID()}`.replaceAll("-", "");
  const tokenHash = await hashToken(token);
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("quotation_invitations")
    .upsert(
      {
        request_id: requestId,
        supplier_id: supplierId,
        token_hash: tokenHash,
        status: "pending",
        expires_at: expiresAt,
        opened_at: null,
        submitted_at: null,
        quotation_id: null,
        created_by: actorId,
        updated_at: now,
      },
      { onConflict: "request_id,supplier_id" },
    )
    .select("id, request_id, supplier_id, status, expires_at")
    .single();
  if (error) throw new Error(error.message);

  try {
    await createAuditLog({
      organization_id: organizationId,
      actor_id: actorId,
      action: existing ? "Updated" : "Created",
      entity_type: "Quotation invitation",
      entity_id: data.id,
      description: `${supplier.name} was invited to quote for ${request.request_number}.`,
      metadata: {
        request_id: requestId,
        supplier_id: supplierId,
        expires_at: expiresAt,
      },
    });
  } catch (auditError) {
    if (existing) {
      await supabase
        .from("quotation_invitations")
        .update({
          token_hash: existing.token_hash,
          status: existing.status,
          expires_at: existing.expires_at,
          opened_at: existing.opened_at,
          submitted_at: existing.submitted_at,
          quotation_id: existing.quotation_id,
          created_by: existing.created_by,
          updated_at: existing.updated_at,
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("quotation_invitations").delete().eq("id", data.id);
    }
    throw auditError;
  }

  return { invitation: data, token };
};

export interface PublicQuotationInvitation {
  invitationId: string;
  requestId: string;
  requestNumber: string;
  requestTitle: string;
  supplierId: string;
  supplierName: string;
  supplierEmail: string;
  organisationName: string;
  expiresAt: string;
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unit: string;
  }>;
}

const getInvitationForToken = async (token: string) => {
  if (!token) throw new Error("The invitation link is incomplete.");
  const tokenHash = await hashToken(token);
  const { data, error } = await supabase
    .from("quotation_invitations")
    .select(`
      *,
      supplier:suppliers(id, name, email),
      purchase_request:purchase_requests(
        id, request_number, title, organization_id,
        organization:organizations(legal_name),
        request_items(id, description, quantity)
      )
    `)
    .eq("token_hash", tokenHash)
    .single();
  if (error) throw new Error("This quotation invitation is unavailable.");
  if (["submitted", "revoked", "expired"].includes(data.status)) {
    throw new Error(`This invitation is ${data.status}.`);
  }
  if (new Date(data.expires_at).getTime() <= Date.now()) {
    await supabase
      .from("quotation_invitations")
      .update({ status: "expired", updated_at: new Date().toISOString() })
      .eq("id", data.id);
    throw new Error("This quotation invitation has expired.");
  }
  return data;
};

export const getPublicQuotationInvitation = async (token: string) => {
  const data = await getInvitationForToken(token);
  if (data.status === "pending") {
    const now = new Date().toISOString();
    await supabase
      .from("quotation_invitations")
      .update({ status: "opened", opened_at: now, updated_at: now })
      .eq("id", data.id);
  }
  const request = data.purchase_request;
  return {
    invitationId: data.id,
    requestId: request.id,
    requestNumber: request.request_number,
    requestTitle: request.title,
    supplierId: data.supplier.id,
    supplierName: data.supplier.name,
    supplierEmail: data.supplier.email,
    organisationName: request.organization?.legal_name || "the buyer",
    expiresAt: data.expires_at,
    items: request.request_items.map(
      (item: { id: string; description: string; quantity: number }) => ({
        ...item,
        unit: "unit",
      }),
    ),
  } as PublicQuotationInvitation;
};

export const submitPublicQuotation = async ({
  token,
  ...input
}: SupplierQuotationFormValues & { token: string }) => {
  const invitation = await getInvitationForToken(token);
  const request = invitation.purchase_request;
  const requestItemIds = new Set(
    request.request_items.map((item: { id: string }) => item.id),
  );
  if (input.items.some((item) => !requestItemIds.has(item.requestItemId))) {
    throw new Error("One or more quotation items do not belong to this request.");
  }

  const lines = input.items.map((item) => {
    const lineBeforeTax = Math.max(
      0,
      item.availableQuantity * item.unitPrice - item.discount,
    );
    const taxAmount = lineBeforeTax * (item.taxRate / 100);
    return { item, lineBeforeTax, taxAmount };
  });
  const subtotal = lines.reduce((sum, line) => sum + line.lineBeforeTax, 0);
  const tax = lines.reduce((sum, line) => sum + line.taxAmount, 0);
  const total = subtotal + tax + input.deliveryFee;
  const submittedAt = new Date().toISOString();

  const { data: quotation, error: quotationError } = await supabase
    .from("quotations")
    .insert({
      quotation_number: createQuotationNumber(),
      request_id: request.id,
      supplier_id: invitation.supplier.id,
      subtotal,
      delivery_fee: input.deliveryFee,
      tax,
      total,
      delivery_days: Math.max(...input.items.map((item) => item.leadTimeDays)),
      payment_terms: input.paymentTerms.trim(),
      warranty: input.warranty?.trim() || null,
      valid_until: input.validUntil,
      technical_score: 0,
      status: "received",
      supplier_reference: input.reference.trim(),
      currency: input.currency.toUpperCase(),
      contact_name: input.contactName.trim(),
      contact_email: input.contactEmail.trim(),
      contact_phone: input.contactPhone.trim(),
      supplier_notes: input.notes?.trim() || null,
      submitted_at: submittedAt,
    })
    .select("*")
    .single();
  if (quotationError) throw new Error(quotationError.message);

  const rollback = async () => {
    await supabase.from("quotation_items").delete().eq("quotation_id", quotation.id);
    await supabase.from("quotations").delete().eq("id", quotation.id);
    await supabase
      .from("quotation_invitations")
      .update({ quotation_id: null, submitted_at: null, status: "opened" })
      .eq("id", invitation.id);
  };

  const { error: itemError } = await supabase.from("quotation_items").insert(
    lines.map(({ item, lineBeforeTax, taxAmount }) => ({
      quotation_id: quotation.id,
      request_item_id: item.requestItemId,
      quantity: item.availableQuantity,
      unit_price: item.unitPrice,
      line_total: lineBeforeTax + taxAmount,
      requested_quantity: item.requestedQuantity,
      available_quantity: item.availableQuantity,
      unit: item.unit,
      tax_rate: item.taxRate,
      discount: item.discount,
      tax_amount: taxAmount,
      lead_time_days: item.leadTimeDays,
      alternative: item.alternative?.trim() || null,
      supplier_notes: item.notes?.trim() || null,
    })),
  );
  if (itemError) {
    await rollback();
    throw new Error(itemError.message);
  }

  const { error: invitationError } = await supabase
    .from("quotation_invitations")
    .update({
      quotation_id: quotation.id,
      submitted_at: submittedAt,
      status: "submitted",
      updated_at: submittedAt,
    })
    .eq("id", invitation.id);
  if (invitationError) {
    await rollback();
    throw new Error(invitationError.message);
  }

  try {
    await createAuditLog({
      organization_id: request.organization_id,
      actor_id: null,
      action: "Created",
      entity_type: "Quotation",
      entity_id: quotation.id,
      description: `${invitation.supplier.name} submitted quotation ${quotation.quotation_number}.`,
      metadata: {
        request_id: request.id,
        supplier_id: invitation.supplier.id,
        invitation_id: invitation.id,
        total,
        currency: quotation.currency,
      },
    });
  } catch (auditError) {
    await rollback();
    throw auditError;
  }

  return quotation as QuotationRecord;
};

export const selectQuotation = async ({
  quotationId,
  organizationId,
  actorId,
}: {
  quotationId: string;
  organizationId: string;
  actorId: string;
}) => {
  const selected = await getQuotationById(quotationId, organizationId);
  const { data: originals, error: originalsError } = await supabase
    .from("quotations")
    .select("id, status")
    .eq("request_id", selected.request_id);
  if (originalsError) throw new Error(originalsError.message);

  const { error: declineError } = await supabase
    .from("quotations")
    .update({ status: "declined" })
    .eq("request_id", selected.request_id)
    .neq("id", quotationId);
  if (declineError) throw new Error(declineError.message);
  const { data, error } = await supabase
    .from("quotations")
    .update({ status: "selected" })
    .eq("id", quotationId)
    .select("*")
    .single();
  if (error) {
    await Promise.all(
      originals.map((original) =>
        supabase
          .from("quotations")
          .update({ status: original.status })
          .eq("id", original.id),
      ),
    );
    throw new Error(error.message);
  }

  try {
    await createAuditLog({
      organization_id: organizationId,
      actor_id: actorId,
      action: "Selected",
      entity_type: "Quotation",
      entity_id: quotationId,
      description: `Quotation ${selected.quotation_number} from ${selected.supplier?.name || "supplier"} was selected.`,
      metadata: {
        request_id: selected.request_id,
        supplier_id: selected.supplier_id,
        total: selected.total,
        currency: selected.currency,
      },
    });
  } catch (auditError) {
    await Promise.all(
      originals.map((original) =>
        supabase
          .from("quotations")
          .update({ status: original.status })
          .eq("id", original.id),
      ),
    );
    throw auditError;
  }
  return data as QuotationRecord;
};
