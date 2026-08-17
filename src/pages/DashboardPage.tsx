import { useQuery } from "@tanstack/react-query";
import StatusBadge from "../components/StatusBadge";
import { money } from "../utils/currency";
import { getPurchaseRequests } from "../api/requestsApi";
import { useAppStore } from "../store/store";
import { DateTimeFormat } from "../utils/datetimeFormat";
import {
  ArrowDownRight,
  ArrowUpRight,
  CircleDollarSign,
  Clock3,
  Plus,
  Search,
  Store,
  WalletCards,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getSuppliers } from "../api/suppliersApi";
import { getDepartmentBudgets } from "../api/budgetsApi";
import Table, { type TableColumn } from "../components/ui/Table";
import type { PurchaseRequest } from "../types/requests";
import { getSpendRecords } from "../api/reportsApi";
import DashboardSpendChart from "../components/dashboard/DashboardSpendChart";
import SpendByCategoryChart from "../components/dashboard/SpendByCategoryChart";

export default function DashboardPage() {
  const { user } = useAppStore();
  const navigate = useNavigate();
  const organizationId = user?.organization_id ?? "";
  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers", organizationId],
    queryFn: () => getSuppliers(organizationId),
    enabled: Boolean(organizationId),
  });

  const { data: purchaseRequests = [], isLoading } = useQuery({
    queryKey: ["purchaseRequests"],
    queryFn: () => getPurchaseRequests(user?.organization_id || ""),
  });

  const { data: budgets = [] } = useQuery({
    queryKey: ["budgets"],
    queryFn: () => getDepartmentBudgets(user?.organization_id || ""),
  });

  const { data: spendRecords = [] } = useQuery({
    queryKey: ["spend-records", organizationId],
    queryFn: () => getSpendRecords(organizationId),
    enabled: Boolean(organizationId),
  });

  if (isLoading) return <DashboardSkeleton />;

  const spentBudget = budgets.map((b) => b.spent).reduce((a, b) => a + b, 0);
  const availableBudget =
    budgets.map((b) => b.allocated).reduce((a, b) => a + b, 0) - spentBudget;

  const cards = [
    {
      label: "Total spend",
      value: money(budgets.map((b) => b.spent).reduce((a, b) => a + b, 0)),
      meta: "+8.2% from last month",
      icon: CircleDollarSign,
      tone: "blue",
      trend: "up",
    },
    {
      label: "Available budget",
      value: money(availableBudget),
      meta: "76.9% utilised",
      icon: WalletCards,
      tone: "purple",
      trend: "down",
    },
    {
      label: "Pending approvals",
      value: String(
        purchaseRequests?.filter((r) => r.status === "Pending approval").length,
      ),
      meta: "4 require your action",
      icon: Clock3,
      tone: "orange",
      trend: "up",
    },
    {
      label: "Active suppliers",
      value: String(suppliers?.filter((s) => s.status === "active").length),
      meta: "+3 added this month",
      icon: Store,
      tone: "green",
      trend: "up",
    },
  ];

  const columns: TableColumn<PurchaseRequest>[] = [
    {
      key: "id",
      header: "Request",
      render: (item) => <strong>{item.title}</strong>,
    },
    {
      key: "department",
      header: "Department",
      render: (item) => <span>{item.department}</span>,
    },
    {
      key: "estimated_total",
      header: "Amount",
      render: (item) => (
        <strong className="money">{money(item.estimated_total)}</strong>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: "priority",
      header: "Priority",
      render: (item) => (
        <span className={`priority ${item.priority.toLowerCase()}`}>
          {item.priority}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Date",
      render: (item) => DateTimeFormat(item.created_at, { dateStyle: "long" }),
    },
  ];

  return (
    <>
      <section className="welcome">
        <div>
          <h2>Good afternoon, {user?.name}</h2>
          <p>Here's what's happening with procurement today.</p>
        </div>
        <Link className="primary-button" to="/requests/new">
          <Plus size={18} />
          New request
        </Link>
      </section>
      <section className="stats-grid">
        {cards.map((c) => (
          <article className="stat-card" key={c.label}>
            <div className={`stat-icon ${c.tone}`}>
              <c.icon size={21} />
            </div>
            <p>{c.label}</p>
            <h3>{c.value}</h3>
            <small className={c.trend}>
              {c.trend === "up" ? (
                <ArrowUpRight size={14} />
              ) : (
                <ArrowDownRight size={14} />
              )}{" "}
              {c.meta}
            </small>
          </article>
        ))}
      </section>
      <section className="analytics-grid">
        <article className="panel spend-panel">
          <PanelTitle
            title="Spend overview"
            subtitle="Monthly spend vs allocated budget"
            action="Last 6 months"
          />
          <DashboardSpendChart budgets={budgets} spendRecords={spendRecords} />
        </article>
        <article className="panel">
          <PanelTitle
            title="Spend by category"
            subtitle="Current financial year"
          />
          <SpendByCategoryChart spendRecords={spendRecords} />
        </article>
      </section>
      <Table
        data={purchaseRequests.slice(0, 4)}
        columns={columns}
        rowKey={(row) => row.id}
        onRowClick={(row) => navigate(`/dashboard/request/${row.id}`)}
        panelTitle={true}
        panelContent={
          <div className="panel-title">
            <div>
              <h3>Recent requests</h3>
              <p>Latest purchase requests</p>
            </div>
            <Link to="/requests" className="secondary-button">
              View all
            </Link>
          </div>
        }
        emptyMessage={
          <div className="empty">
            <Search />
            <h3>No requests found</h3>
            <p>Try a different search term.</p>
          </div>
        }
      />
    </>
  );
}
function PanelTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: string;
}) {
  return (
    <div className="panel-title">
      <div>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
      {action && <button>{action}</button>}
    </div>
  );
}
function DashboardSkeleton() {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: 8 }, (_, i) => (
        <div className="skeleton" key={i} />
      ))}
    </div>
  );
}
