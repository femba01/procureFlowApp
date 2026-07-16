import supabase from "./supabase";

export interface DepartmentOption {
  id: string;
  name: string;
}

export const getDepartments = async (organizationId: string) => {
  const { data, error } = await supabase
    .from("departments")
    .select("id, name")
    .eq("organization_id", organizationId)
    .order("name");

  if (error) throw new Error(error.message);
  return data as DepartmentOption[];
};
