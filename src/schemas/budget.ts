import { z } from "zod";

export const departmentBudgetSchema = z.object({
  departmentId: z.string().uuid("Select a department"),
  period: z.string().trim().min(1, "Budget period is required"),
  allocated: z.number().min(0, "Allocated amount cannot be negative"),
  committed: z.number().min(0, "Committed amount cannot be negative"),
  spent: z.number().min(0, "Spent amount cannot be negative"),
  status: z.enum(["healthy", "watch", "critical"]),
});

export type DepartmentBudgetFormValues = z.infer<
  typeof departmentBudgetSchema
>;
