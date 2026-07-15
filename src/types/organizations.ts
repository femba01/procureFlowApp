export interface Organization {
  id: string;
  name: string;
  legalName: string | null;
  email: string | null;
  currency: string;
  timezone: string;
  createdAt: string;
}
