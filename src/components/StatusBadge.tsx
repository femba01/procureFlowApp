import type { RequestStatus } from "../types/requests";
import { cn } from "./ui";

const tones: Record<RequestStatus, string> = {
  Draft: "bg-slate-100 text-slate-600",
  "Pending approval": "bg-amber-50 text-amber-700",
  Approved: "bg-emerald-50 text-emerald-700",
  "In procurement": "bg-blue-50 text-blue-700",
  Completed: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-red-50 text-red-700",
};
export default function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold",
        tones[status],
      )}
    >
      <i className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
