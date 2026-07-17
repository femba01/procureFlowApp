import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  createSupplier,
  updateSupplier,
} from "../api/suppliersApi";
import { supplierSchema, type SupplierFormValues } from "../schemas/supplier";
import { useAppStore } from "../store/store";
import type { Supplier } from "../types/suppliers";

type Props = {
  supplier?: Supplier;
  onClose: () => void;
  onSaved?: (supplier: Supplier) => void;
};

export default function SupplierFormModal({
  supplier,
  onClose,
  onSaved,
}: Props) {
  const user = useAppStore((state) => state.user);
  const client = useQueryClient();
  const isEditing = Boolean(supplier);
  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: supplier?.name || "",
      category: supplier?.category || "",
      contactName: supplier?.contact_name || "",
      email: supplier?.email || "",
      phone: supplier?.phone || "",
      location: supplier?.location || "",
      taxId: supplier?.tax_id || "",
      paymentTerms: supplier?.payment_terms || "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: SupplierFormValues) => {
      if (!user) throw new Error("You must be signed in to save a supplier");

      const input = {
        name: values.name,
        category: values.category,
        contact_name: values.contactName,
        email: values.email,
        phone: values.phone || null,
        location: values.location || null,
        tax_id: values.taxId || null,
        payment_terms: values.paymentTerms || null,
      };

      if (supplier) {
        return updateSupplier({
          id: supplier.id,
          input,
          actorId: user.id,
        });
      }

      return createSupplier(
        { ...input, organization_id: user.organization_id },
        user.id,
      );
    },
    onSuccess: (savedSupplier) => {
      client.invalidateQueries({ queryKey: ["suppliers"] });
      client.invalidateQueries({ queryKey: ["supplier", savedSupplier.id] });
      onSaved?.(savedSupplier);
      onClose();
    },
  });

  return (
    <div className="modal-layer">
      <button className="modal-backdrop" onClick={onClose} />
      <form
        className="supplier-modal"
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      >
        <div className="modal-title">
          <div>
            <span>
              <Building2 />
            </span>
            <div>
              <h3>{isEditing ? "Edit supplier" : "Onboard new supplier"}</h3>
              <p>Add commercial and primary contact details.</p>
            </div>
          </div>
          <button type="button" onClick={onClose}>
            <X />
          </button>
        </div>
        <div className="modal-grid">
          <ModalField label="Company name" error={form.formState.errors.name?.message}>
            <input {...form.register("name")} placeholder="Registered company name" />
          </ModalField>
          <ModalField label="Category" error={form.formState.errors.category?.message}>
            <select {...form.register("category")}>
              <option value="">Select category</option>
              <option>IT equipment</option>
              <option>Office supplies</option>
              <option>Professional services</option>
              <option>Marketing</option>
              <option>Facilities</option>
            </select>
          </ModalField>
          <ModalField
            label="Primary contact"
            error={form.formState.errors.contactName?.message}
          >
            <input {...form.register("contactName")} placeholder="Full name" />
          </ModalField>
          <ModalField label="Email address" error={form.formState.errors.email?.message}>
            <input
              {...form.register("email")}
              type="email"
              placeholder="contact@company.com"
            />
          </ModalField>
          <ModalField label="Phone number" error={form.formState.errors.phone?.message}>
            <input {...form.register("phone")} placeholder="+234..." />
          </ModalField>
          <ModalField label="Location" error={form.formState.errors.location?.message}>
            <input {...form.register("location")} placeholder="City, country" />
          </ModalField>
          <ModalField
            label="Tax identification number"
            error={form.formState.errors.taxId?.message}
          >
            <input {...form.register("taxId")} placeholder="Tax ID" />
          </ModalField>
          <ModalField
            label="Payment terms"
            error={form.formState.errors.paymentTerms?.message}
          >
            <select {...form.register("paymentTerms")}>
              <option value="">Select terms</option>
              <option>Due on receipt</option>
              <option>14 days</option>
              <option>30 days</option>
              <option>60 days</option>
            </select>
          </ModalField>
        </div>
        {mutation.isError && (
          <p className="mutation-error">{mutation.error.message}</p>
        )}
        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-button" disabled={mutation.isPending}>
            {mutation.isPending
              ? "Saving..."
              : isEditing
                ? "Save changes"
                : "Add supplier"}
          </button>
        </div>
      </form>
    </div>
  );
}

function ModalField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="form-field">
      <span>{label}</span>
      {children}
      {error && <small>{error}</small>}
    </label>
  );
}
