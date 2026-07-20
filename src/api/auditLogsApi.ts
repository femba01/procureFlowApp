import type { AuditLogRecord, CreateAuditLogInput } from "../types/audit";
import supabase from "./supabase";

export interface GetAuditLogsInput {
  organizationId: string;
  entityType?: string;
  entityId?: string;
}

export const getAuditLogs = async ({
  organizationId,
  entityType,
  entityId,
}: GetAuditLogsInput) => {
  let query = supabase
    .from("audit_logs")
    .select("*, actor:profiles(name, email, role)")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (entityType?.trim()) query = query.eq("entity_type", entityType.trim());
  if (entityId?.trim()) query = query.eq("entity_id", entityId.trim());

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as unknown as AuditLogRecord[];
};

export const createAuditLog = async (input: CreateAuditLogInput) => {
  const { data, error } = await supabase
    .from("audit_logs")
    .insert(input)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as AuditLogRecord;
};
