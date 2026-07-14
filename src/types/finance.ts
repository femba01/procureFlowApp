export interface DepartmentBudget {
  id: string;
  department: string;
  owner: string;
  allocated: number;
  committed: number;
  spent: number;
  period: string;
  status: "Healthy" | "Watch" | "Critical";
  monthly: { month: string; actual: number; plan: number }[];
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
