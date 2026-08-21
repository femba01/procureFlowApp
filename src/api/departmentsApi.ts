import type { Department } from "../types/departments";
import supabase from "./supabase";


export const getDepartments = async (organizationId: string) => {
  const { data, error } = await supabase
    .from("departments")
    .select("id, name, code, created_at")
    .eq("organization_id", organizationId)
    .order("name");

  if (error) throw new Error(error.message);
  return data as Department[];
};

export const createDepartment = async (input: {
  organizationId: string;
  name: string;
  code: string;
}) => {
  const { data, error } = await supabase
    .from("departments")
    .insert({
      organization_id: input.organizationId,
      name: input.name.trim(),
      code: input.code.trim().toUpperCase(),
    })
    .select("id, name, code")
    .single();

  if (error) throw new Error(error.message);
  return data as Department;
};

export const updateDepartment = async (input: {
  id: string;
  organizationId: string;
  name: string;
  code: string;
}) => {
  const { data, error } = await supabase
    .from("departments")
    .update({ name: input.name.trim(), code: input.code.trim().toUpperCase() })
    .eq("id", input.id)
    .eq("organization_id", input.organizationId)
    .select("id, name, code")
    .single();

  if (error) throw new Error(error.message);
  return data as Department;
};

export const deleteDepartment = async (input: {
  id: string;
  organizationId: string;
}) => {
  const { error } = await supabase
    .from("departments")
    .delete()
    .eq("id", input.id)
    .eq("organization_id", input.organizationId);

  if (error) throw new Error(error.message);
};
