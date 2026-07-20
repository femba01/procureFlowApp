export default function StockBadge({ status }: { status: string }) {
  return (
    <span
      className={`stock-badge ${status.toLowerCase().replaceAll(" ", "-")}`}
    >
      {status}
    </span>
  );
}
