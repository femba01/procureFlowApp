export interface Quotation {
  id: string;
  supplierId: string;
  supplierName: string;
  requestId: string;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  deliveryDays: number;
  paymentTerms: string;
  warranty: string;
  validUntil: string;
  technicalScore: number;
  status: "Received" | "Selected" | "Declined";
}
