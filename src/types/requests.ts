export type RequestStatus =
  | "Draft"
  | "Pending approval"
  | "Approved"
  | "In procurement"
  | "Completed"
  | "Rejected";

export interface PurchaseRequest {
  id: string;
  title: string;
  department: string;
  requester: string;
  amount: number;
  status: RequestStatus;
  priority: "Low" | "Medium" | "High";
  createdAt: string;
  items: number;
}

export interface RequestItem {
  id: string;
  description: string;
  category: string;
  quantity: number;
  unitPrice: number;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  actor: string;
  createdAt: string;
  type: "created" | "submitted" | "approved" | "commented" | "rejected";
}

export interface PurchaseRequestDetails extends PurchaseRequest {
  businessReason: string;
  neededBy: string;
  costCentre: string;
  vendorPreference?: string;
  lineItems: RequestItem[];
  timeline: TimelineEvent[];
}

export interface CreateRequestInput {
  title: string;
  department: string;
  priority: "Low" | "Medium" | "High";
  businessReason: string;
  neededBy: string;
  costCentre: string;
  vendorPreference?: string;
  lineItems: Omit<RequestItem, "id">[];
}
