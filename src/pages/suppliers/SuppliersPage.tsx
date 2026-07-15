import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Plus, Search, Star, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { createSupplier, getSuppliers } from "../../api/api";
import { supplierSchema, type SupplierFormValues } from "../../schemas/supplier";
import { compactMoney as money } from "../../utils/currency";
export default function SuppliersPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const client = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: getSuppliers,
  });
  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      category: "",
      contactName: "",
      email: "",
      phone: "",
      location: "",
      taxId: "",
      paymentTerms: "",
    },
  });
  const mutation = useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["suppliers"] });
      setOpen(false);
      form.reset();
    },
  });
  const rows = useMemo(
    () =>
      data.filter(
        (s) =>
          (status === "All" || s.status === status) &&
          `${s.name} ${s.category} ${s.contactName}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [data, query, status],
  );
  return (
    <>
      <section className="welcome">
        <div>
          <h2>Supplier network</h2>
          <p>Manage compliance, performance and commercial relationships.</p>
        </div>
        <div className="button-row">
          <Link className="secondary-button" to="/quotations">
            Compare quotations
          </Link>
          <button className="primary-button" onClick={() => setOpen(true)}>
            <Plus size={18} />
            Onboard supplier
          </button>
        </div>
      </section>
      <section className="supplier-stats">
        <article>
          <span>Active suppliers</span>
          <strong>{data.filter((s) => s.status === "Active").length}</strong>
          <small>Across 4 categories</small>
        </article>
        <article>
          <span>Average rating</span>
          <strong>
            4.5 <Star size={16} />
          </strong>
          <small>Top 20% performance</small>
        </article>
        <article>
          <span>Under review</span>
          <strong>
            {data.filter((s) => s.status === "Under review").length}
          </strong>
          <small>Awaiting compliance checks</small>
        </article>
        <article>
          <span>Total supplier spend</span>
          <strong>{money(data.reduce((a, s) => a + s.totalSpend, 0))}</strong>
          <small>Current financial year</small>
        </article>
      </section>
      <div className="request-toolbar supplier-toolbar">
        <label className="search wide">
          <Search size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search suppliers..."
          />
        </label>
        <div className="segment">
          {["All", "Active", "Under review", "Suspended"].map((value) => (
            <button
              className={status === value ? "selected" : ""}
              onClick={() => setStatus(value)}
              key={value}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      <article className="panel supplier-table">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Category</th>
                <th>Status</th>
                <th>Performance</th>
                <th>Orders</th>
                <th>Total spend</th>
                <th>Compliance</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr
                  key={s.id}
                  className="clickable-row"
                  onClick={() => navigate(`/suppliers/${s.id}`)}
                >
                  <td>
                    <div className="supplier-name">
                      <span>{s.initials}</span>
                      <div>
                        <strong>{s.name}</strong>
                        <small>
                          {s.contactName} · {s.location}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>{s.category}</td>
                  <td>
                    <span
                      className={`supplier-status ${s.status.toLowerCase().replace(" ", "-")}`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td>
                    <div className="rating">
                      <Star size={13} />
                      <strong>{s.rating || "—"}</strong>
                      <small>{s.onTimeDelivery}% on time</small>
                    </div>
                  </td>
                  <td>{s.totalOrders}</td>
                  <td className="amount">{money(s.totalSpend)}</td>
                  <td>{s.complianceExpiry}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
      {open && (
        <div className="modal-layer">
          <button className="modal-backdrop" onClick={() => setOpen(false)} />
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
                  <h3>Onboard new supplier</h3>
                  <p>Add commercial and primary contact details.</p>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)}>
                <X />
              </button>
            </div>
            <div className="modal-grid">
              <ModalField
                label="Company name"
                error={form.formState.errors.name?.message}
              >
                <input
                  {...form.register("name")}
                  placeholder="Registered company name"
                />
              </ModalField>
              <ModalField
                label="Category"
                error={form.formState.errors.category?.message}
              >
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
                <input
                  {...form.register("contactName")}
                  placeholder="Full name"
                />
              </ModalField>
              <ModalField
                label="Email address"
                error={form.formState.errors.email?.message}
              >
                <input
                  {...form.register("email")}
                  type="email"
                  placeholder="contact@company.com"
                />
              </ModalField>
              <ModalField
                label="Phone number"
                error={form.formState.errors.phone?.message}
              >
                <input {...form.register("phone")} placeholder="+234..." />
              </ModalField>
              <ModalField
                label="Location"
                error={form.formState.errors.location?.message}
              >
                <input
                  {...form.register("location")}
                  placeholder="City, country"
                />
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
            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button className="primary-button" disabled={mutation.isPending}>
                {mutation.isPending ? "Adding supplier..." : "Add supplier"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
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
