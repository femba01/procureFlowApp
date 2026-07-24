import { cn } from "./ui";

export default function StockBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase().replaceAll("_", " ");
  const tone =
    normalized === "in stock"
      ? "bg-emerald-50 text-emerald-700"
      : normalized === "low stock"
        ? "bg-amber-50 text-amber-700"
        : "bg-red-50 text-red-700";

  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold", tone)}>
      {status}
    </span>
  );
}
