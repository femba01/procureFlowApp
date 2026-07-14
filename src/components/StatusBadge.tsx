import type { RequestStatus } from "../types/types";
export default function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span className={`status ${status.toLowerCase().replace(" ", "-")}`}>
      <i />
      {status}
    </span>
  );
}
