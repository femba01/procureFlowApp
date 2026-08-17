import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { SpendRecordReport } from "../../api/reportsApi";
import { compactMoney, money } from "../../utils/currency";

const CATEGORY_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#f97316",
  "#6366f1",
  "#14b8a6",
];

interface SpendByCategoryChartProps {
  spendRecords: SpendRecordReport[];
}

export default function SpendByCategoryChart({
  spendRecords,
}: SpendByCategoryChartProps) {
  const categories = useMemo(() => {
    const totals = new Map<string, number>();

    spendRecords.forEach((record) => {
      const department =
        record.department?.name?.trim() || "Unknown department";
      totals.set(department, (totals.get(department) ?? 0) + record.amount);
    });

    return Array.from(totals, ([name, value]) => ({ name, value })).sort(
      (a, b) => b.value - a.value,
    );
  }, [spendRecords]);

  const totalSpend = categories.reduce((total, item) => total + item.value, 0);

  if (totalSpend === 0) {
    return (
      <div className="flex min-h-[260px] items-center justify-center text-sm text-slate-500">
        No department spend data available.
      </div>
    );
  }

  return (
    <div className="category-chart">
      <div className="relative h-[190px] w-[190px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categories}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={82}
              paddingAngle={2}
              stroke="none"
            >
              {categories.map((category, index) => (
                <Cell
                  key={category.name}
                  fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value) => money(Number(value))} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <strong className="font-manrope text-base text-slate-800">
            {compactMoney(totalSpend)}
          </strong>
          <span className="text-[10px] text-slate-500">Total spend</span>
        </div>
      </div>

      <div className="category-list max-h-[220px] min-w-[165px] overflow-y-auto pr-2">
        {categories.map((category, index) => (
          <div key={category.name}>
            <span className="flex min-w-0 items-center">
              <i
                className="shrink-0"
                style={{
                  background: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                }}
              />
              <span className="truncate" title={category.name}>
                {category.name}
              </span>
            </span>
            <strong className="ml-4 shrink-0">
              {((category.value / totalSpend) * 100).toFixed(1)}%
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
}
