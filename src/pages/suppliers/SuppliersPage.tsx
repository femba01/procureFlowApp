import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getSuppliers } from "../../api/suppliersApi";
import SupplierFormModal from "../../components/SupplierFormModal";
import { useAppStore } from "../../store/store";
import type { Supplier } from "../../types/suppliers";
import type { TableColumn } from "../../components/ui/Table";
import Table from "../../components/ui/Table";

export default function SuppliersPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const organizationId = user?.organization_id ?? "";
  const { data = [] } = useQuery({
    queryKey: ["suppliers", organizationId],
    queryFn: () => getSuppliers(organizationId),
    enabled: Boolean(organizationId),
  });
  const rows = useMemo(
    () =>
      data.filter(
        (s) =>
          (status === "All" || s.status === status) &&
          `${s.name} ${s.category} ${s.contact_name}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [data, query, status],
  );

  const columns: TableColumn<Supplier>[] = [
    {
      key: "id",
      header: "Supplier",
      render: (s) => (
        <div className="supplier-name">
          <span>{initials(s.name)}</span>
          <div>
            <strong>{s.name}</strong>
            <small>
              {s.contact_name} · {s.location || "No location"}
            </small>
          </div>
        </div>
      ),
    },
    {
      key: "requester",
      header: "Category",
      render: (s) => (
        <span>{ s.category }</span>
      )
    },
    {
      key: "department",
      header: "Status",
      render: (s) => (
        <span
          className={`supplier-status ${s.status.replaceAll("_", "-")}`}
        >
          {displayStatus(s.status)}
        </span>
      )
    },
    {
      key: "estimated_total",
      header: "Performance",
      render: (s) => (
        <div className="rating">
          <Star size={13} />
          <strong>{s.rating || "—"}</strong>
          <small>{s.on_time_delivery_pct}% on time</small>
        </div>
      ),
    },
    {
      key: "status",
      header: "Contact",
      render: (s) => (
        <span>{ s.email }</span>
      ),
    },
    {
      key: "priority",
      header: "Location",
      render: (s) => (
        <span>{ s.location || "—" }</span>
      ),
    },
    {
      key: "created_at",
      header: "Quality",
      render: (s) => (
        <span>{ s.quality_score_pct } %</span>
      ),
    },
  ];

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
          <strong>{data.filter((s) => s.status === "active").length}</strong>
          <small>Across 4 categories</small>
        </article>
        <article>
          <span>Average rating</span>
          <strong>
            {(data.reduce((sum, s) => sum + s.rating, 0) / data.length || 0).toFixed(2)}{" "}
            <Star size={16} />
          </strong>
          <small>Top 20% performance</small>
        </article>
        <article>
          <span>Under review</span>
          <strong>
            {data.filter((s) => s.status === "under_review").length}
          </strong>
          <small>Awaiting compliance checks</small>
        </article>
        <article>
          <span>Average quality score</span>
          <strong>
            {(data.reduce((sum, s) => sum + s.quality_score_pct, 0) /
              data.length || 0).toFixed(1)}%
          </strong>
          <small>Across all suppliers</small>
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
      </div>
      <Table
        data={rows}
        columns={columns}
        rowKey={(row) => row.id}
        onRowClick={(row) => navigate(`/suppliers/${row.id}`)}
        panelTitle={true}
        panelContent={
          <div className="tabs text-nowrap">
            {[
              ["All", "All"],
              ["active", "Active"],
              ["under_review", "Under review"],
              ["suspended", "Suspended"],
            ].map(([value, label]) => (
              <button
              className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${status === value ? "border-blue-600 text-blue-600!"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800"
                    }`}
                onClick={() => setStatus(value)}
                key={value}
              >
                {label}
              </button>
            ))}
          </div>
        }
        emptyMessage={
          <div className="empty">
            <Search />
            <h3>No suppliers found</h3>
            <p>Try a different search term.</p>
          </div>
        }
      />
      {open && <SupplierFormModal onClose={() => setOpen(false)} />}
    </>
  );
}
const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

const displayStatus = (status: string) =>
  status
    .replaceAll("_", " ")
    .replace(/^./, (letter) => letter.toUpperCase());
