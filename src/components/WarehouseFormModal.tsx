import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Warehouse, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { createWarehouse, type WarehouseRecord } from "../api/inventoryApi";
import { getOrganizationProfileOptions } from "../api/profilesApi";
import { warehouseSchema, type WarehouseFormValues } from "../schemas/inventory";
import { useAppStore } from "../store/store";

export default function WarehouseFormModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated?: (warehouse: WarehouseRecord) => void;
}) {
  const user = useAppStore((state) => state.user);
  const organizationId = user?.organization_id ?? "";
  const client = useQueryClient();
  const { data: managers = [] } = useQuery({
    queryKey: ["profile-options", organizationId],
    queryFn: () => getOrganizationProfileOptions(organizationId),
    enabled: Boolean(organizationId),
  });
  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      name: "",
      code: "",
      location: "",
      managerProfileId: "",
    },
  });
  const mutation = useMutation({
    mutationFn: (input: WarehouseFormValues) => {
      if (!user) throw new Error("You must be signed in to add a warehouse");
      return createWarehouse({
        input,
        organizationId: user.organization_id,
        actorId: user.id,
      });
    },
    onSuccess: (warehouse) => {
      client.invalidateQueries({ queryKey: ["warehouses"] });
      onCreated?.(warehouse);
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
              <Warehouse />
            </span>
            <div>
              <h3>Add warehouse</h3>
              <p>Create a stock location for this organization.</p>
            </div>
          </div>
          <button type="button" onClick={onClose}>
            <X />
          </button>
        </div>
        <div className="modal-grid">
          <ModalField label="Warehouse name" error={form.formState.errors.name?.message}>
            <input {...form.register("name")} placeholder="Lagos Main Warehouse" />
          </ModalField>
          <ModalField label="Warehouse code" error={form.formState.errors.code?.message}>
            <input {...form.register("code")} placeholder="WH-LAG-01" />
          </ModalField>
          <ModalField label="Location" error={form.formState.errors.location?.message}>
            <input {...form.register("location")} placeholder="Ikeja, Lagos" />
          </ModalField>
          <ModalField
            label="Warehouse manager (optional)"
            error={form.formState.errors.managerProfileId?.message}
          >
            <select {...form.register("managerProfileId")}>
              <option value="">No manager assigned</option>
              {managers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.name}
                </option>
              ))}
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
            {mutation.isPending ? "Adding warehouse..." : "Add warehouse"}
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
