import { z } from "zod";

export const supplierSchema = z.object({
  name: z.string().min(3, "Company name is required"),
  category: z.string().min(1, "Select a category"),
  contactName: z.string().min(3, "Contact name is required"),
  email: z.email("Enter a valid email"),
  phone: z.string().min(7, "Enter a valid phone number"),
  location: z.string().min(2, "Enter a location"),
  taxId: z.string().min(4, "Tax ID is required"),
  paymentTerms: z.string().min(1, "Select payment terms"),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;
