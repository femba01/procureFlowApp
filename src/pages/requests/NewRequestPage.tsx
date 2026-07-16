import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, Plus, Save, Trash2 } from "lucide-react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { getDepartments } from "../../api/departmentsApi";
import { createPurchaseRequest } from "../../api/requestsApi";
import { getSupplierOptions } from "../../api/suppliersApi";
import FormField from "../../components/FormField";
import { requestSchema, type RequestFormValues } from "../../schemas/request";
import { money } from "../../utils/currency";
import { useAppStore } from "../../store/store";
import { useEffect } from "react";

export default function NewRequestPage() {
  const navigate = useNavigate();
  const client = useQueryClient();
  const user = useAppStore((state) => state.user);
  const organizationId = user?.organization_id ?? "";
  const { data: departments = [] } = useQuery({
    queryKey: ["departments", organizationId],
    queryFn: () => getDepartments(organizationId),
    enabled: Boolean(organizationId),
  });
  const { data: suppliers = [] } = useQuery({
    queryKey: ["request-suppliers", organizationId],
    queryFn: () => getSupplierOptions(organizationId),
    enabled: Boolean(organizationId),
  });
  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      title: "",
      departmentId: user?.department_id ?? "",
      department: "",
      requester: user?.name ?? "None",
      priority: "medium",
      neededBy: "",
      costCentre: "",
      preferredSupplierId: "",
      businessReason: "",
      lineItems: [{ description: "", category: "", quantity: 1, unitPrice: 0 }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems",
  });
  const items = useWatch({ control, name: "lineItems" });
  const departmentId = useWatch({ control, name: "departmentId" });

  useEffect(() => {
    if(departmentId && departments.length > 0) {
      const selectedDepartment = departments.find(d => d.id === departmentId);
      if(selectedDepartment) {
        setValue("department", selectedDepartment.name);
      }
    }
  }, [departmentId, departments, control]);

  const total = items.reduce(
    (sum, item) =>
      sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
    0,
  );
  const mutation = useMutation({
    mutationFn: (values: RequestFormValues) => {
      if (!user) throw new Error("You must be signed in to create a request");
      return createPurchaseRequest({
        ...values,
        organizationId: user.organization_id,
        requesterId: user.id,
      });
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["purchaseRequests"] });
      client.invalidateQueries({ queryKey: ["dashboard"] });
      navigate("/requests");
    },
  });
  
  return (
    <div className="form-page">
      <div className="back-row">
        <Link to="/requests">
          <ArrowLeft size={17} />
          Back to requests
        </Link>
        <span>Draft saved automatically</span>
      </div>
      <section className="welcome">
        <div>
          <h2>Create purchase request</h2>
          <p>Provide the business need and add every item required.</p>
        </div>
      </section>
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
        <div className="form-layout">
          <div className="form-main col-span-2 md:col-span-1">
            <section className="panel form-section">
              <div className="section-heading">
                <span>1</span>
                <div>
                  <h3>Request information</h3>
                  <p>Basic details used to identify and route this request.</p>
                </div>
              </div>
              <div className="form-grid">
                <FormField
                  label="Request title"
                  error={errors.title?.message}
                  wide
                >
                  <input
                    {...register("title")}
                    placeholder="e.g. New laptops for engineering team"
                  />
                </FormField>
                <FormField
                  label="Department"
                  error={errors.departmentId?.message}
                >
                  <select {...register("departmentId")}>
                    <option value="">Select department</option>
                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Priority" error={errors.priority?.message}>
                  <select {...register("priority")}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </FormField>
                <FormField label="Needed by" error={errors.neededBy?.message}>
                  <div className="input-icon">
                    <CalendarDays size={16} />
                    <input type="date" {...register("neededBy")} />
                  </div>
                </FormField>
                <FormField
                  label="Cost centre"
                  error={errors.costCentre?.message}
                >
                  <input
                    {...register("costCentre")}
                    placeholder="e.g. TECH-2026"
                  />
                </FormField>
                <FormField
                  label="Preferred vendor (optional)"
                  error={errors.preferredSupplierId?.message}
                  wide
                >
                  <select {...register("preferredSupplierId")}>
                    <option value="">No preferred supplier</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField
                  label="Business justification"
                  error={errors.businessReason?.message}
                  wide
                >
                  <textarea
                    {...register("businessReason")}
                    rows={4}
                    placeholder="Explain why this purchase is needed and the business impact..."
                  />
                </FormField>
              </div>
            </section>
            <section className="panel form-section">
              <div className="section-heading">
                <span>2</span>
                <div>
                  <h3>Line items</h3>
                  <p>Add products or services with their estimated costs.</p>
                </div>
              </div>
              <div className="line-items">
                <div className="line-header">
                  <span>Item description</span>
                  <span>Category</span>
                  <span>Qty</span>
                  <span>Unit price</span>
                  <span>Total</span>
                  <span />
                </div>
                {fields.map((field, index) => (
                  <div className="line-row" key={field.id}>
                    <div>
                      <input
                        {...register(`lineItems.${index}.description`)}
                        placeholder="Item name"
                      />
                      {errors.lineItems?.[index]?.description && (
                        <small>
                          {errors.lineItems[index]?.description?.message}
                        </small>
                      )}
                    </div>
                    <div>
                      <select {...register(`lineItems.${index}.category`)}>
                        <option value="">Category</option>
                        <option>IT equipment</option>
                        <option>Office supplies</option>
                        <option>Professional services</option>
                        <option>Marketing</option>
                        <option>Facilities</option>
                      </select>
                      {errors.lineItems?.[index]?.category && (
                        <small>
                          {errors.lineItems[index]?.category?.message}
                        </small>
                      )}
                    </div>
                    <input
                      type="number"
                      min="1"
                      {...register(`lineItems.${index}.quantity`, {
                        valueAsNumber: true,
                      })}
                    />
                    <input
                      type="number"
                      min="0"
                      {...register(`lineItems.${index}.unitPrice`, {
                        valueAsNumber: true,
                      })}
                    />
                    <strong>
                      {money(
                        (Number(items[index]?.quantity) || 0) *
                          (Number(items[index]?.unitPrice) || 0),
                      )}
                    </strong>
                    <button
                      type="button"
                      aria-label="Remove item"
                      disabled={fields.length === 1}
                      onClick={() => remove(index)}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                className="add-line"
                type="button"
                onClick={() =>
                  append({
                    description: "",
                    category: "",
                    quantity: 1,
                    unitPrice: 0,
                  })
                }
              >
                <Plus size={16} />
                Add another item
              </button>
            </section>
          </div>
          <aside className="form-summary panel">
            <h3>Request summary</h3>
            <div>
              <span>Items</span>
              <strong>{fields.length}</strong>
            </div>
            <div>
              <span>Subtotal</span>
              <strong>{money(total)}</strong>
            </div>
            <div>
              <span>Estimated tax</span>
              <strong>Calculated by Finance</strong>
            </div>
            <hr />
            <div className="summary-total">
              <span>Estimated total</span>
              <strong>{money(total)}</strong>
            </div>
            <div
              className={`approval-rule ${total > 1000000 ? "finance" : ""}`}
            >
              <strong>Approval route</strong>
              <p>
                {total > 1000000
                  ? "Department Manager → Finance Officer → Procurement"
                  : "Department Manager → Procurement"}
              </p>
            </div>
            <button
              className="primary-button full"
              disabled={mutation.isPending}
            >
              <Save size={17} />
              {mutation.isPending ? "Submitting..." : "Submit for approval"}
            </button>
            {mutation.isError && (
              <p className="mutation-error">
                {mutation.error.message}
              </p>
            )}
            <button type="button" className="draft-button">
              Save as draft
            </button>
          </aside>
        </div>
      </form>
    </div>
  );
}
