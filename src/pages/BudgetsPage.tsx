import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Banknote,
  CircleDollarSign,
  Plus,
  WalletCards,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getDepartmentBudgets } from "../api/budgetsApi";
import BudgetFormModal from "../components/BudgetFormModal";
import { useAppStore } from "../store/store";
import { compactMoney, money } from "../utils/currency";

const displayStatus = (status: string) =>
  status
    .replaceAll("_", " ")
    .replace(/^./, (letter) => letter.toUpperCase());

export default function BudgetsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const organizationId = useAppStore((state) => state.user?.organization_id ?? "");
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ["budgets", organizationId],
    queryFn: () => getDepartmentBudgets(organizationId),
    enabled: Boolean(organizationId),
  });
  const periods = useMemo(
    () => [...new Set(data.map((budget) => budget.period))],
    [data],
  );
  const activePeriod = selectedPeriod || periods[0] || "";
  const budgets = useMemo(
    () => data.filter((budget) => !activePeriod || budget.period === activePeriod),
    [activePeriod, data],
  );
  const allocated = budgets.reduce((total, budget) => total + budget.allocated, 0);
  const spent = budgets.reduce((total, budget) => total + budget.spent, 0);
  const committed = budgets.reduce((total, budget) => total + budget.committed, 0);
  const chart = budgets.map((budget) => ({
    department: budget.department?.name || "Unknown",
    allocated: budget.allocated / 1_000_000,
    spent: budget.spent / 1_000_000,
    committed: budget.committed / 1_000_000,
  }));

  if (isLoading) return <div className="detail-loading" />;
  if (isError)
    return (
      <div className="empty">
        <WalletCards />
        <h3>Department budgets could not be loaded</h3>
      </div>
    );

  return (
    <>
      <section className="welcome">
        <div>
          <h2>Department budgets</h2>
          <p>
            Track allocations, commitments and actual spend
            {activePeriod ? ` for ${activePeriod}` : ""}.
          </p>
        </div>
        <div className="budget-actions">
          <select
            className="period-select"
            value={activePeriod}
            onChange={(event) => setSelectedPeriod(event.target.value)}
            disabled={periods.length === 0}
          >
            {periods.length === 0 ? (
              <option value="">No periods available</option>
            ) : (
              periods.map((period) => (
                <option key={period} value={period}>{period}</option>
              ))
            )}
          </select>
          <button className="primary-button" onClick={() => setFormOpen(true)}>
            <Plus /> Add budget
          </button>
        </div>
      </section>
      <section className="budget-stats">
        <article>
          <span className="budget-icon blue"><WalletCards /></span>
          <div>
            <small>Total allocated</small><strong>{money(allocated)}</strong>
            <p>Across {budgets.length} departments</p>
          </div>
        </article>
        <article>
          <span className="budget-icon green"><CircleDollarSign /></span>
          <div>
            <small>Actual spend</small><strong>{money(spent)}</strong>
            <p>{allocated ? Math.round((spent / allocated) * 100) : 0}% of allocation</p>
          </div>
        </article>
        <article>
          <span className="budget-icon purple"><Banknote /></span>
          <div>
            <small>Committed spend</small><strong>{money(committed)}</strong>
            <p>Approved, not fully paid</p>
          </div>
        </article>
        <article>
          <span className="budget-icon orange"><AlertTriangle /></span>
          <div>
            <small>Budget at risk</small>
            <strong>{budgets.filter((budget) => budget.status !== "healthy").length}</strong>
            <p>Require financial review</p>
          </div>
        </article>
      </section>
      <section className="panel budget-chart-panel">
        <div className="panel-title">
          <div>
            <h3>Allocation versus utilisation</h3>
            <p>Amounts shown in millions of naira</p>
          </div>
          <div className="chart-legend">
            <span><i className="allocated" />Allocated</span>
            <span><i className="spent" />Spent</span>
            <span><i className="committed" />Committed</span>
          </div>
        </div>
        <div className="budget-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart} barGap={3}>
              <CartesianGrid vertical={false} stroke="#edf0f5" />
              <XAxis
                dataKey="department"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#7c8597", fontSize: 10 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `₦${value}m`}
                tick={{ fill: "#7c8597", fontSize: 10 }}
              />
              <Tooltip formatter={(value) => `₦${value}m`} />
              <Bar dataKey="allocated" fill="#dce4fb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="spent" fill="#3c6df0" radius={[4, 4, 0, 0]} />
              <Bar dataKey="committed" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="budget-cards">
        {budgets.map((budget) => {
          const utilised = budget.allocated
            ? ((budget.spent + budget.committed) / budget.allocated) * 100
            : 0;
          return (
            <article className="panel budget-card" key={budget.id}>
              <div className="budget-card-head">
                <div>
                  <h3>{budget.department?.name || "Unknown department"}</h3>
                  <p>{budget.department?.code || "No code"} · {budget.period}</p>
                </div>
                <span className={`budget-status ${budget.status}`}>
                  {displayStatus(budget.status)}
                </span>
              </div>
              <div className="budget-total">
                <span>Allocated budget</span>
                <strong>{compactMoney(budget.allocated)}</strong>
              </div>
              <div className="budget-progress">
                <i
                  className={budget.status}
                  style={{ width: `${Math.min(100, utilised)}%` }}
                />
              </div>
              <div className="budget-values">
                <div><span>Spent</span><strong>{compactMoney(budget.spent)}</strong></div>
                <div><span>Committed</span><strong>{compactMoney(budget.committed)}</strong></div>
                <div>
                  <span>Available</span>
                  <strong>
                    {compactMoney(budget.allocated - budget.spent - budget.committed)}
                  </strong>
                </div>
              </div>
              <p className="utilisation">
                {utilised.toFixed(1)}% utilised including commitments
              </p>
            </article>
          );
        })}
      </section>
      {budgets.length === 0 && (
        <div className="empty"><WalletCards /><h3>No budgets found for this period</h3></div>
      )}
      {formOpen && (
        <BudgetFormModal
          onClose={() => setFormOpen(false)}
          onCreated={(budget) => setSelectedPeriod(budget.period)}
        />
      )}
    </>
  );
}
