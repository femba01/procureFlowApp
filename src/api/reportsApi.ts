import supabase from "./supabase";

export interface SpendRecordReport {
  id: string;
  department_id: string;
  supplier_id: string | null;
  description: string;
  category: string;
  amount: number;
  currency: string;
  spend_type: "purchase_order" | "direct_expense";
  reference: string;
  spent_on: string;
  created_at: string;
  department: {
    id: string;
    name: string;
    organization_id: string;
  } | null;
  supplier: {
    id: string;
    name: string;
    supplier_number: string;
  } | null;
}

export const getSpendRecords = async (organizationId: string) => {
  const { data, error } = await supabase
    .from("spend_records")
    .select(
      "*, department:departments!inner(id, name, organization_id), supplier:suppliers(id, name, supplier_number)",
    )
    .eq("department.organization_id", organizationId)
    .order("spent_on", { ascending: false });

  if (error) throw new Error(error.message);
  return data as unknown as SpendRecordReport[];
};
