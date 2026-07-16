import { z } from "zod";

const requestItemSchema = z.object({
  description: z.string().min(3, "Describe the item"),
  category: z.string().min(1, "Select a category"),
  quantity: z.number().int().min(1, "Minimum quantity is 1"),
  unitPrice: z.number().min(1, "Enter a valid price"),
});

export const requestSchema = z.object({
  title: z.string().min(5, "Use at least 5 characters"),
  department: z.string().min(1, "Select a department"),
  requester: z.string().min(1, "Select a requester"),
  departmentId: z.string().uuid("Select a department"),
  priority: z.enum(["low", "medium", "high"]),
  neededBy: z.string().min(1, "Select the required date"),
  costCentre: z.string().min(3, "Enter a cost centre"),
  preferredSupplierId: z.union([z.literal(""), z.string().uuid()]),
  businessReason: z.string().min(20, "Provide at least 20 characters"),
  lineItems: z.array(requestItemSchema).min(1),
});

export type RequestFormValues = z.infer<typeof requestSchema>;
