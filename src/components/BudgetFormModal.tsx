import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Landmark, X } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  createDepartmentBudget,
  type DepartmentBudgetRecord,
} from "../api/budgetsApi";
import { getDepartments } from "../api/departmentsApi";
import {
  departmentBudgetSchema,
  type DepartmentBudgetFormValues,
} from "../schemas/budget";
import { useAppStore } from "../store/store";

export default function BudgetFormModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated?: (budget: DepartmentBudgetRecord) => void;
}) {
  const user = useAppStore((state) => state.user);
  const organizationId = user?.organization_id ?? "";
  const queryClient = useQueryClient();
  const { data: departments = [], isLoading: departmentsLoading } = useQuery({
    queryKey: ["departments", organizationId],
    queryFn: () => getDepartments(organizationId),
    enabled: Boolean(organizationId),
  });
  const form = useForm<DepartmentBudgetFormValues>({
    resolver: zodResolver(departmentBudgetSchema),
    defaultValues: {
      departmentId: "",
      period: `FY ${new Date().getFullYear()}`,
      allocated: 0,
      committed: 0,
      spent: 0,
      status: "healthy",
    },
  });
  const mutation = useMutation({
    mutationFn: (input: DepartmentBudgetFormValues) => {
      if (!user) throw new Error("You must be signed in to add a budget");
      return createDepartmentBudget({
        input,
        organizationId: user.organization_id,
        actorId: user.id,
      });
    },
    onSuccess: (budget) => {
      queryClient.invalidateQueries({ queryKey: ["budgets", organizationId] });
      queryClient.invalidateQueries({ queryKey: ["auditLogs", organizationId] });
      onCreated?.(budget);
      onClose();
    },
  });

  return (
    <div className="modal-layer">
      <button
        type="button"
        className="modal-backdrop"
        aria-label="Close budget form"
        onClick={onClose}
      />
      <form
        className="supplier-modal"
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      >
        <div className="modal-title">
          <div>
            <span><Landmark /></span>
            <div>
              <h3>Add departmental budget</h3>
              <p>Set an allocation and current utilisation for a period.</p>
            </div>
          </div>
          <button type="button" aria-label="Close" onClick={onClose}><X /></button>
        </div>
        <div className="modal-grid">
          <ModalField
            label="Department"
            error={form.formState.errors.departmentId?.message}
          >
            <select {...form.register("departmentId")} disabled={departmentsLoading}>
              <option value="">
                {departmentsLoading ? "Loading departments..." : "Select department"}
              </option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </ModalField>
          <ModalField label="Budget period" error={form.formState.errors.period?.message}>
            <input {...form.register("period")} placeholder="FY 2026" />
          </ModalField>
          <ModalField
            label="Allocated amount (NGN)"
            error={form.formState.errors.allocated?.message}
          >
            <input
              {...form.register("allocated", { valueAsNumber: true })}
              type="number"
              min="0"
              step="0.01"
            />
          </ModalField>
          <ModalField
            label="Committed amount (NGN)"
            error={form.formState.errors.committed?.message}
          >
            <input
              {...form.register("committed", { valueAsNumber: true })}
              type="number"
              min="0"
              step="0.01"
            />
          </ModalField>
          <ModalField label="Spent amount (NGN)" error={form.formState.errors.spent?.message}>
            <input
              {...form.register("spent", { valueAsNumber: true })}
              type="number"
              min="0"
              step="0.01"
            />
          </ModalField>
          <ModalField label="Status" error={form.formState.errors.status?.message}>
            <select {...form.register("status")}>
              <option value="healthy">Healthy</option>
              <option value="watch">Watch</option>
              <option value="critical">Critical</option>
            </select>
          </ModalField>
        </div>
        {departments.length === 0 && !departmentsLoading && (
          <p className="mutation-error">Add a department before creating a budget.</p>
        )}
        {mutation.isError && <p className="mutation-error">{mutation.error.message}</p>}
        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="primary-button"
            disabled={mutation.isPending || departments.length === 0}
          >
            {mutation.isPending ? "Adding budget..." : "Add budget"}
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
