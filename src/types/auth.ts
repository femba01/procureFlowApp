export type Role =
  | "Administrator"
  | "Procurement Officer"
  | "Finance Officer"
  | "Department Manager"
  | "Employee";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department_id: string;
  organization_id: string;
  auth_user_id: string;
  initials: string;
}

export interface Actor {
  id: string;
  name: string;
}
