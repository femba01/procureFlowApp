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
  department: string;
  organization: string;
  user_id: string;
  initials: string;
}
