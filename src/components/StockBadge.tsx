import type { StockStatus } from "../types/types";

export default function StockBadge({ status }: { status: StockStatus }) {
  return (
    <span
      className={`stock-badge ${status.toLowerCase().replaceAll(" ", "-")}`}
    >
      {status}
    </span>
  );
}
