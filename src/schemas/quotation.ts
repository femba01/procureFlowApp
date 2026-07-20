import { z } from "zod";

export const supplierQuotationItemSchema = z.object({
  requestItemId: z.string().uuid(),
  description: z.string(),
  requestedQuantity: z.number().int().positive(),
  unit: z.string().min(1),
  availableQuantity: z.coerce.number().int().min(1, "At least one unit is required"),
  unitPrice: z.coerce.number().min(0, "Cannot be negative"),
  taxRate: z.coerce.number().min(0).max(100),
  discount: z.coerce.number().min(0),
  leadTimeDays: z.coerce.number().int().min(0, "Cannot be negative"),
  alternative: z.string().optional(),
  notes: z.string().optional(),
});

export const supplierQuotationSchema = z.object({
  reference: z.string().trim().min(2, "Quotation reference is required"),
  currency: z.string().length(3, "Use a three-letter currency code"),
  paymentTerms: z.string().trim().min(2, "Payment terms are required"),
  warranty: z.string().optional(),
  validUntil: z.string().min(1, "Validity date is required"),
  deliveryFee: z.coerce.number().min(0),
  contactName: z.string().trim().min(2, "Contact name is required"),
  contactEmail: z.email("Enter a valid email address"),
  contactPhone: z.string().trim().min(7, "Enter a valid phone number"),
  notes: z.string().optional(),
  confirmation: z.literal(true, {
    error: "Confirm that the quotation information is accurate",
  }),
  items: z.array(supplierQuotationItemSchema).min(1),
});

export type SupplierQuotationFormInput = z.input<typeof supplierQuotationSchema>;
export type SupplierQuotationFormValues = z.output<typeof supplierQuotationSchema>;
