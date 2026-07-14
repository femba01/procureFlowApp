import type { Role } from "./types/types";
export type Permission =
  | "dashboard:view"
  | "requests:view"
  | "requests:create"
  | "requests:approve"
  | "suppliers:manage"
  | "orders:manage"
  | "inventory:manage"
  | "budgets:view"
  | "reports:view"
  | "settings:manage";
const matrix: Record<Role, Permission[]> = {
  Administrator: [
    "dashboard:view",
    "requests:view",
    "requests:create",
    "requests:approve",
    "suppliers:manage",
    "orders:manage",
    "inventory:manage",
    "budgets:view",
    "reports:view",
    "settings:manage",
  ],
  "Procurement Officer": [
    "dashboard:view",
    "requests:view",
    "requests:create",
    "requests:approve",
    "suppliers:manage",
    "orders:manage",
    "inventory:manage",
    "budgets:view",
    "reports:view",
  ],
  "Finance Officer": [
    "dashboard:view",
    "requests:view",
    "requests:approve",
    "budgets:view",
    "reports:view",
  ],
  "Department Manager": [
    "dashboard:view",
    "requests:view",
    "requests:create",
    "requests:approve",
    "budgets:view",
  ],
  Employee: ["dashboard:view", "requests:view", "requests:create"],
};
export const hasPermission = (role: Role | undefined, permission: Permission) =>
  Boolean(role && matrix[role].includes(permission));
