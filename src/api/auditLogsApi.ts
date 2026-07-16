import type {
  AuditLogRecord,
  CreateAuditLogInput,
} from "../types/audit";
import supabase from "./supabase";

// export const getAuditLogs = async (entityType?: string) => {
//   const { data, error } = await supabase
//     .from("audit_logs")
//     .select("*")
//     .eq("entity_type", entityType)
//     .order("created_at", { ascending: false });

//   if (error) throw new Error(error.message);
//   return data as AuditLogRecord[];
// };

export const getAuditLogs = async (entityType?: string) => {
  let query = supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false });

  if (entityType?.trim()) {
    query = query.eq("entity_type", entityType.trim());
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data as AuditLogRecord[];
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
