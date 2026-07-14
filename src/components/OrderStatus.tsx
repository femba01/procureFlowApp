import type { PurchaseOrderStatus } from "../types/orders";

export default function OrderStatus({
  status,
}: {
  status: PurchaseOrderStatus;
}) {
  return (
    <span className={`order-status ${status.toLowerCase().replace(" ", "-")}`}>
      {status}
    </span>
  );
}
