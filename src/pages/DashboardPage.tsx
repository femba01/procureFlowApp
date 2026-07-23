import { useQuery } from "@tanstack/react-query";
import StatusBadge from "../components/StatusBadge";
import { money } from "../utils/currency";
import { getPurchaseRequests } from "../api/requestsApi";
import { useAppStore } from "../store/store";
import { DateTimeFormat } from "../utils/datetimeFormat";
import { ArrowDownRight, ArrowUpRight, CircleDollarSign, Clock3, Plus, Store, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";
import { getSuppliers } from "../api/suppliersApi";
import { getDepartmentBudgets } from "../api/budgetsApi";
import { getDepartments } from "../api/departmentsApi";

export default function DashboardPage() {
  const { user } = useAppStore();

  const organizationId = user?.organization_id ?? "";
  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers", organizationId],
    queryFn: () => getSuppliers(organizationId),
    enabled: Boolean(organizationId),
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments", organizationId],
    queryFn: () => getDepartments(organizationId),
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

  if (isLoading) return <DashboardSkeleton />;

  const spentBudget = budgets.map(b => b.spent).reduce((a, b) => a + b, 0);
  const availableBudget = budgets.map(b => b.allocated).reduce((a, b) => a + b, 0) - spentBudget;

  const cards = [
    {
      label: "Total spend",
      value: money(budgets.map(b => b.spent).reduce((a, b) => a + b, 0)),
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
      value: String(purchaseRequests?.filter(r => r.status === "Pending approval").length),
      meta: "4 require your action",
      icon: Clock3,
      tone: "orange",
      trend: "up",
    },
    {
      label: "Active suppliers",
      value: String(suppliers?.filter(s => s.status === "active").length),
      meta: "+3 added this month",
      icon: Store,
      tone: "green",
      trend: "up",
    },
  ];

  const getDepartmentName = (id: string) => {
    const department = departments.find((d) => d.id === id);
    return department ? department.name : "Unknown";
  }

  const pieChartColors = [
  "#3B82F6", // Vibrant Blue
  "#10B981", // Emerald Green
  "#F59E0B", // Amber Yellow
  "#EF4444", // Coral Red
  "#8B5CF6", // Royal Purple
  "#06B6D4", // Bright Teal
  "#EC4899", // Pink Rose
  "#F97316", // Bright Orange
  "#6366F1", // Indigo Blue
  "#14B8A6"  // Mint Teal
];

  return (
    <>
      <section className="welcome">
        <div>
          <h2>Good afternoon, {user?.name}</h2>
          <p>Here's what's happening with procurement today.</p>
        </div>
        <Link className="primary-button" to="/requests">
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
          {/* <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthly} barGap={8}>
                <CartesianGrid vertical={false} stroke="#edf0f5" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#7c8597", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₦${v}m`}
                  tick={{ fill: "#7c8597", fontSize: 12 }}
                />
                <Tooltip cursor={{ fill: "#f6f7fb" }} />
                <Bar dataKey="budget" fill="#e0e7ff" radius={[5, 5, 0, 0]} />
                <Bar dataKey="spend" fill="#3c6df0" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div> */}
          <div className="legend">
            <span>
              <i className="spent" />
              Actual spend
            </span>
            <span>
              <i />
              Allocated budget
            </span>
          </div>
        </article>
        <article className="panel">
          <PanelTitle
            title="Spend by category"
            subtitle="Current financial year"
          />
          <div className="category-chart">
            <div
              className="donut"
              // style={{
              //   background: `conic-gradient(${data.categories.map((c, i) => `${c.color} ${data.categories.slice(0, i).reduce((a, x) => a + x.value, 0)}% ${data.categories.slice(0, i + 1).reduce((a, x) => a + x.value, 0)}%`).join(",")})`,
              // }}
            >
              <div>
                <strong>₦18.5m</strong>
                <span>Total spend</span>
              </div>
            </div>
            <div className="category-list">
              {budgets.map((c, i) => {
                const percentage = budgets.map(b => b.spent).reduce((a, x) => a + x, 0) > 0 ? ((c.spent / budgets.map(b => b.spent).reduce((a, x) => a + x, 0)) * 100).toFixed(1) : 0;
                return (
                <div key={c.department_id}>
                  <span>
                    <i style={{ background: pieChartColors[i % pieChartColors.length] }} />
                    {getDepartmentName(c.department_id)}
                  </span>
                  <strong>{percentage}%</strong>
                </div>
              )})}
            </div>
          </div>
        </article>
      </section>
      <article className="panel requests-panel">
        <PanelTitle
          title="Recent purchase requests"
          subtitle="Latest activity across your organisation"
          action="View all"
        />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Request</th>
                <th>Department</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {purchaseRequests && purchaseRequests.slice(0, 4).map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.title}</strong>
                    {/* <small>
                      {r.id} · {r.items.length} items
                    </small> */}
                  </td>
                  <td>{r.department}</td>
                  <td className="amount">{money(r.estimated_total)}</td>
                  <td>
                    <StatusBadge status={r.status} />
                  </td>
                  <td>
                    <span className={`priority ${r.priority.toLowerCase()}`}>
                      {r.priority}
                    </span>
                  </td>
                  <td>{DateTimeFormat(r.created_at, { dateStyle: "long" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
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
