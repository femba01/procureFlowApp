export default function OrderStatus({
  status,
}: {
  status: string;
}) {
  return (
    <span
      className={`order-status ${status.toLowerCase().replaceAll("_", "-").replaceAll(" ", "-")}`}
    >
      {status}
    </span>
  );
}
