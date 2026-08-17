import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DepartmentBudgetRecord } from "../../api/budgetsApi";
import type { SpendRecordReport } from "../../api/reportsApi";
import { money } from "../../utils/currency";

interface DashboardSpendChartProps {
  budgets: DepartmentBudgetRecord[];
  spendRecords: SpendRecordReport[];
}

const monthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

export default function DashboardSpendChart({
  budgets,
  spendRecords,
}: DashboardSpendChartProps) {
  const chartData = useMemo(() => {
    const latestPeriod = budgets[0]?.period;
    const activeBudgets = latestPeriod
      ? budgets.filter((budget) => budget.period === latestPeriod)
      : [];
    const monthlyAllocation =
      activeBudgets.reduce((total, budget) => total + budget.allocated, 0) / 12;

    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setDate(1);
      date.setMonth(date.getMonth() - (5 - index));
      const key = monthKey(date);
      const spend = spendRecords
        .filter((record) => record.spent_on.slice(0, 7) === key)
        .reduce((total, record) => total + record.amount, 0);

      return {
        key,
        month: date.toLocaleDateString("en-NG", { month: "short" }),
        budget: monthlyAllocation,
        spend,
      };
    });
  }, [budgets, spendRecords]);

  return (
    <>
      <div className="chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={8}>
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
              width={54}
              tickFormatter={(value) =>
                `₦${(Number(value) / 1_000_000).toFixed(1)}m`
              }
              tick={{ fill: "#7c8597", fontSize: 11 }}
            />
            <Tooltip
              cursor={{ fill: "#f6f7fb" }}
              formatter={(value) => money(Number(value))}
              labelStyle={{ color: "#384356", fontWeight: 600 }}
            />
            <Bar
              name="Allocated budget"
              dataKey="budget"
              fill="#dce4fb"
              radius={[5, 5, 0, 0]}
            />
            <Bar
              name="Actual spend"
              dataKey="spend"
              fill="#3c6df0"
              radius={[5, 5, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
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
    </>
  );
}
