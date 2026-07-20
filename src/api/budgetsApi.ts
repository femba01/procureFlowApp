import type { DepartmentBudgetFormValues } from "../schemas/budget";
import { createAuditLog } from "./auditLogsApi";
import supabase from "./supabase";

export interface DepartmentBudgetRecord {
  id: string;
  department_id: string;
  period: string;
  allocated: number;
  committed: number;
  spent: number;
  status: "healthy" | "watch" | "critical";
  created_at: string;
  department: {
    id: string;
    name: string;
    code: string;
    organization_id: string;
  } | null;
}

export const getDepartmentBudgets = async (organizationId: string) => {
  const { data, error } = await supabase
    .from("department_budgets")
    .select("*, department:departments!inner(id, name, code, organization_id)")
    .eq("department.organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as unknown as DepartmentBudgetRecord[];
};

export const createDepartmentBudget = async ({
  input,
  organizationId,
  actorId,
}: {
  input: DepartmentBudgetFormValues;
  organizationId: string;
  actorId: string;
}) => {
  const { data: department, error: departmentError } = await supabase
    .from("departments")
    .select("id, name, code, organization_id")
    .eq("id", input.departmentId)
    .eq("organization_id", organizationId)
    .single();

  if (departmentError) throw new Error(departmentError.message);

  const { data, error } = await supabase
    .from("department_budgets")
    .insert({
      department_id: input.departmentId,
      period: input.period.trim(),
      allocated: input.allocated,
      committed: input.committed,
      spent: input.spent,
      status: input.status,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  try {
    await createAuditLog({
      organization_id: organizationId,
      actor_id: actorId,
      action: "Created",
      entity_type: "Department budget",
      entity_id: data.id,
      description: `${department.name} budget for ${data.period} was created.`,
      metadata: {
        department_id: data.department_id,
        period: data.period,
        allocated: data.allocated,
        committed: data.committed,
        spent: data.spent,
        status: data.status,
      },
    });
  } catch (auditError) {
    await supabase.from("department_budgets").delete().eq("id", data.id);
    throw auditError;
  }

  return {
    ...data,
    department,
  } as DepartmentBudgetRecord;
};
