import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Save } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { createInventoryItem, getWarehouses } from "../../api/inventoryApi";
import FormField from "../../components/FormField";
import WarehouseFormModal from "../../components/WarehouseFormModal";
import {
  inventoryItemSchema,
  type InventoryItemFormValues,
} from "../../schemas/inventory";
import { useAppStore } from "../../store/store";

export default function NewInventoryPage() {
  const [warehouseModalOpen, setWarehouseModalOpen] = useState(false);
  const navigate = useNavigate();
  const client = useQueryClient();
  const user = useAppStore((state) => state.user);
  const organizationId = user?.organization_id ?? "";
  const { data: warehouses = [] } = useQuery({
    queryKey: ["warehouses", organizationId],
    queryFn: () => getWarehouses(organizationId),
    enabled: Boolean(organizationId),
  });
  const form = useForm<InventoryItemFormValues>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: {
      warehouseId: "",
      sku: "",
      name: "",
      category: "",
      quantity: 0,
      reservedQuantity: 0,
      reorderLevel: 0,
      unitCost: 0,
    },
  });
  const mutation = useMutation({
    mutationFn: (input: InventoryItemFormValues) => {
      if (!user) throw new Error("You must be signed in to add inventory");
      return createInventoryItem({
        input,
        organizationId: user.organization_id,
        actorId: user.id,
      });
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["inventory"] });
      navigate("/inventory");
    },
  });

  return (
    <div className="form-page">
      <div className="back-row">
        <Link to="/inventory">
          <ArrowLeft size={17} />
          Back to inventory
        </Link>
      </div>
      <section className="welcome">
        <div>
          <h2>Add inventory item</h2>
          <p>Create a catalogue item and assign its opening stock balance.</p>
        </div>
      </section>
      <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <div className="form-layout">
          <div className="form-main">
            <section className="panel form-section">
              <div className="section-heading">
                <span>1</span>
                <div>
                  <h3>Item information</h3>
                  <p>Identify the item and its storage location.</p>
                </div>
              </div>
              <div className="form-grid">
                <FormField label="Item name" error={form.formState.errors.name?.message} wide>
                  <input {...form.register("name")} placeholder="Dell Latitude 5540 Laptop" />
                </FormField>
                <FormField label="SKU" error={form.formState.errors.sku?.message}>
                  <input {...form.register("sku")} placeholder="IT-LAP-014" />
                </FormField>
                <FormField label="Category" error={form.formState.errors.category?.message}>
                  <input {...form.register("category")} placeholder="IT equipment" />
                </FormField>
                <FormField
                  label="Warehouse"
                  error={form.formState.errors.warehouseId?.message}
                  wide
                >
                  <div className="button-row">
                    <select {...form.register("warehouseId")}>
                      <option value="">Select warehouse</option>
                      {warehouses.map((warehouse) => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name} ({warehouse.code})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => setWarehouseModalOpen(true)}
                    >
                      <Plus size={16} />
                      Add warehouse
                    </button>
                  </div>
                </FormField>
              </div>
            </section>
            <section className="panel form-section">
              <div className="section-heading">
                <span>2</span>
                <div>
                  <h3>Stock information</h3>
                  <p>Set opening quantities, reorder threshold and valuation.</p>
                </div>
              </div>
              <div className="form-grid">
                <FormField label="Quantity on hand" error={form.formState.errors.quantity?.message}>
                  <input
                    type="number"
                    min="0"
                    {...form.register("quantity", { valueAsNumber: true })}
                  />
                </FormField>
                <FormField
                  label="Reserved quantity"
                  error={form.formState.errors.reservedQuantity?.message}
                >
                  <input
                    type="number"
                    min="0"
                    {...form.register("reservedQuantity", { valueAsNumber: true })}
                  />
                </FormField>
                <FormField
                  label="Reorder level"
                  error={form.formState.errors.reorderLevel?.message}
                >
                  <input
                    type="number"
                    min="0"
                    {...form.register("reorderLevel", { valueAsNumber: true })}
                  />
                </FormField>
                <FormField label="Unit cost" error={form.formState.errors.unitCost?.message}>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    {...form.register("unitCost", { valueAsNumber: true })}
                  />
                </FormField>
              </div>
            </section>
          </div>
          <aside className="form-summary panel">
            <h3>Inventory item</h3>
            <p>The stock status is calculated automatically from quantity and reorder level.</p>
            <button className="primary-button full" disabled={mutation.isPending}>
              <Save size={17} />
              {mutation.isPending ? "Adding item..." : "Add inventory item"}
            </button>
            {mutation.isError && (
              <p className="mutation-error">{mutation.error.message}</p>
            )}
          </aside>
        </div>
      </form>
      {warehouseModalOpen && (
        <WarehouseFormModal
          onClose={() => setWarehouseModalOpen(false)}
          onCreated={(warehouse) =>
            form.setValue("warehouseId", warehouse.id, { shouldValidate: true })
          }
        />
      )}
    </div>
  );
}
