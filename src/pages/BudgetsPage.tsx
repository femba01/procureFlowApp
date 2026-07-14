import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Banknote,
  CircleDollarSign,
  WalletCards,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getBudgets } from "../api/api";
import { compactMoney, money } from "../utils/currency";
export default function BudgetsPage() {
  const { data = [] } = useQuery({
    queryKey: ["budgets"],
    queryFn: getBudgets,
  });
  const allocated = data.reduce((a, b) => a + b.allocated, 0);
  const spent = data.reduce((a, b) => a + b.spent, 0);
  const committed = data.reduce((a, b) => a + b.committed, 0);
  const chart = data.map((b) => ({
    department: b.department,
    allocated: b.allocated / 1000000,
    spent: b.spent / 1000000,
    committed: b.committed / 1000000,
  }));
  return (
    <>
      <section className="welcome">
        <div>
          <h2>Department budgets</h2>
          <p>Track allocations, commitments and actual spend for FY 2026.</p>
        </div>
        <select className="period-select">
          <option>FY 2026</option>
          <option>FY 2025</option>
        </select>
      </section>
      <section className="budget-stats">
        <article>
          <span className="budget-icon blue">
            <WalletCards />
          </span>
          <div>
            <small>Total allocated</small>
            <strong>{money(allocated)}</strong>
            <p>Across {data.length} departments</p>
          </div>
        </article>
        <article>
          <span className="budget-icon green">
            <CircleDollarSign />
          </span>
          <div>
            <small>Actual spend</small>
            <strong>{money(spent)}</strong>
            <p>{Math.round((spent / allocated) * 100)}% of allocation</p>
          </div>
        </article>
        <article>
          <span className="budget-icon purple">
            <Banknote />
          </span>
          <div>
            <small>Committed spend</small>
            <strong>{money(committed)}</strong>
            <p>Approved, not fully paid</p>
          </div>
        </article>
        <article>
          <span className="budget-icon orange">
            <AlertTriangle />
          </span>
          <div>
            <small>Budget at risk</small>
            <strong>{data.filter((b) => b.status !== "Healthy").length}</strong>
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
            <span>
              <i className="allocated" />
              Allocated
            </span>
            <span>
              <i className="spent" />
              Spent
            </span>
            <span>
              <i className="committed" />
              Committed
            </span>
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
                tickFormatter={(v) => `₦${v}m`}
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
        {data.map((budget) => {
          const utilised =
            ((budget.spent + budget.committed) / budget.allocated) * 100;
          return (
            <article className="panel budget-card" key={budget.id}>
              <div className="budget-card-head">
                <div>
                  <h3>{budget.department}</h3>
                  <p>
                    {budget.owner} · {budget.period}
                  </p>
                </div>
                <span
                  className={`budget-status ${budget.status.toLowerCase()}`}
                >
                  {budget.status}
                </span>
              </div>
              <div className="budget-total">
                <span>Allocated budget</span>
                <strong>{compactMoney(budget.allocated)}</strong>
              </div>
              <div className="budget-progress">
                <i
                  className={budget.status.toLowerCase()}
                  style={{ width: `${Math.min(100, utilised)}%` }}
                />
              </div>
              <div className="budget-values">
                <div>
                  <span>Spent</span>
                  <strong>{compactMoney(budget.spent)}</strong>
                </div>
                <div>
                  <span>Committed</span>
                  <strong>{compactMoney(budget.committed)}</strong>
                </div>
                <div>
                  <span>Available</span>
                  <strong>
                    {compactMoney(
                      budget.allocated - budget.spent - budget.committed,
                    )}
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
    </>
  );
}
