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
  department_id: string;
  requester: string;
  requester_id: string;
  request_number: string;
  needed_by: Date | null;
  cost_centre: string;
  estimated_total: number;
  status: RequestStatus;
  items: RequestItem[];
  priority: "Low" | "Medium" | "High";
  created_at: string;
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
