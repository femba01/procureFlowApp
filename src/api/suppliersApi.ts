import type {
  CreateSupplierInput,
  Supplier,
  SupplierOption,
} from "../types/suppliers";
import supabase from "./supabase";

const createSupplierNumber = () => {
  const year = new Date().getFullYear();
  const uniquePart = crypto.randomUUID().slice(0, 8).toUpperCase();
  return `SUP-${year}-${uniquePart}`;
};

export const getSuppliers = async (organizationId: string) => {
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .eq("organization_id", organizationId)
    .order("name");

  if (error) throw new Error(error.message);
  return data as Supplier[];
};

export const getSupplierOptions = async (organizationId: string) => {
  const { data, error } = await supabase
    .from("suppliers")
    .select("id, name")
    .eq("organization_id", organizationId)
    .order("name");

  if (error) throw new Error(error.message);
  return data as SupplierOption[];
};

export const getSupplierById = async (id: string) => {
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data as Supplier;
};

export const createSupplier = async (input: CreateSupplierInput) => {
  const { data, error } = await supabase
    .from("suppliers")
    .insert({
      ...input,
      supplier_number: createSupplierNumber(),
      status: "under_review",
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as Supplier;
};
