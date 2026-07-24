export default function OrderStatus({
  status,
}: {
  status: string;
}) {
  const normalized = status.toLowerCase().replaceAll("_", " ");
  const tone =
    normalized === "received" || normalized === "acknowledged"
      ? "bg-emerald-50 text-emerald-700"
      : normalized === "cancelled"
        ? "bg-red-50 text-red-700"
        : normalized === "draft"
          ? "bg-slate-100 text-slate-600"
          : normalized === "partially received"
            ? "bg-amber-50 text-amber-700"
            : "bg-blue-50 text-blue-700";

  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold", tone)}>
      {status}
    </span>
  );
}
import { cn } from "./ui";
