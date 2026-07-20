export interface DepartmentBudget {
  id: string;
  department_id: string;
  period: string;
  allocated: number;
  committed: number;
  spent: number;
  status: "healthy" | "watch" | "critical";
  created_at: string;
}

export interface SpendRecord {
  id: string;
  date: string;
  department: string;
  category: string;
  supplier: string;
  description: string;
  amount: number;
  type: "Purchase order" | "Direct expense";
  reference: string;
}
