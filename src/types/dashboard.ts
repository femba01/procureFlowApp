import type { PurchaseRequest } from "./requests";

export interface DashboardData {
  spend: number;
  budget: number;
  pending: number;
  suppliers: number;
  monthly: { month: string; spend: number; budget: number }[];
  categories: { name: string; value: number; color: string }[];
  requests: PurchaseRequest[];
}
