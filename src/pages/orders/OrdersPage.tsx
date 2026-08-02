import { useQuery } from "@tanstack/react-query";
import {
  ClipboardCheck,
  Clock3,
  PackageCheck,
  Search,
  Truck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPurchaseOrders,
  type PurchaseOrderRecord,
} from "../../api/purchaseOrdersApi";
import Table, { type TableColumn } from "../../components/ui/Table";
import OrderStatus from "../../components/OrderStatus";
import { useAppStore } from "../../store/store";
import { money } from "../../utils/currency";
import { DateTimeFormat } from "../../utils/datetimeFormat";

const displayStatus = (status: string) =>
  status.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());

export default function OrdersPage() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

    const [status, setStatus] = useState("All");
  const organizationId = useAppStore(
    (state) => state.user?.organization_id ?? "",
  );
  const {
    data = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["orders", organizationId],
    queryFn: () => getPurchaseOrders(organizationId),
    enabled: Boolean(organizationId),
  });
  const rows = useMemo(
    () =>
      data.filter((order) => {
        const matchesQuery =
          `${order.po_number} ${order.supplier?.name || ""} ${order.purchase_request?.request_number || ""} ${order.purchase_request?.title || ""}`
            .toLowerCase()
            .includes(query.toLowerCase());

        const matchesStatus = status === "All" || order.status === status;

        return matchesQuery && matchesStatus;
      }),
    [data, query, status],
  );

  const columns: TableColumn<PurchaseOrderRecord>[] = [
    {
      key: "po_number",
      header: "Purchase order",
      render: (order) => (
        <>
          <strong>{order.po_number}</strong>
          <small>
            From {order.purchase_request?.request_number || order.request_id}
          </small>
        </>
      ),
    },
    {
      key: "supplier",
      header: "Supplier",
      render: (order) => order.supplier?.name || "Unknown supplier",
    },
    {
      key: "total",
      header: "Order value",
      className: "amount",
      render: (order) => money(order.total),
    },
    {
      key: "status",
      header: "Status",
      render: (order) => <OrderStatus status={displayStatus(order.status)} />,
    },
    {
      key: "purchase_order_items",
      header: "Delivery progress",
      render: (order) => {
        const received = order.purchase_order_items.reduce(
          (total, item) => total + item.received_quantity,
          0,
        );
        const ordered = order.purchase_order_items.reduce(
          (total, item) => total + item.ordered_quantity,
          0,
        );
        return (
          <div className="delivery-progress">
            <div>
              <i
                style={{
                  width: `${ordered ? (received / ordered) * 100 : 0}%`,
                }}
              />
            </div>
            <small>
              {received} of {ordered} units
            </small>
          </div>
        );
      },
    },
    {
      key: "issued_at",
      header: "Issued",
      render: (order) =>
        DateTimeFormat(order.issued_at, { dateStyle: "medium" }, "Date"),
    },
    {
      key: "expected_delivery",
      header: "Expected",
      render: (order) =>
        DateTimeFormat(
          order.expected_delivery,
          { dateStyle: "medium" },
          "Date",
        ),
    },
  ];

  if (isLoading) return <div className="detail-loading" />;

  return (
    <>
      <section className="welcome">
        <div>
          <h2>Purchase orders</h2>
          <p>Track issued orders, supplier acknowledgement and deliveries.</p>
        </div>
      </section>
      <section className="order-stats">
        <article>
          <ClipboardCheck />
          <div>
            <span>Total orders</span>
            <strong>{data.length}</strong>
          </div>
        </article>
        <article>
          <Clock3 />
          <div>
            <span>Awaiting delivery</span>
            <strong>
              {
                data.filter((order) =>
                  ["issued", "acknowledged"].includes(
                    order.status.toLowerCase(),
                  ),
                ).length
              }
            </strong>
          </div>
        </article>
        <article>
          <Truck />
          <div>
            <span>Partial deliveries</span>
            <strong>
              {
                data.filter(
                  (order) =>
                    order.status.toLowerCase().replaceAll(" ", "_") ===
                    "partially_received",
                ).length
              }
            </strong>
          </div>
        </article>
        <article>
          <PackageCheck />
          <div>
            <span>Fully received</span>
            <strong>
              {
                data.filter(
                  (order) => order.status.toLowerCase() === "received",
                ).length
              }
            </strong>
          </div>
        </article>
      </section>
      <div className="request-toolbar">
        <label className="search wide">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search orders, suppliers or requests..."
          />
        </label>
      </div>
      {isError ? (
        <div className="empty">
          <ClipboardCheck />
          <h3>Purchase orders could not be loaded</h3>
        </div>
      ) : (
        <Table
          className="supplier-table"
          data={rows}
          columns={columns}
          rowKey={(order) => order.id}
          onRowClick={(order) => navigate(`/orders/${order.id}`)}
          emptyMessage={
            <div className="empty">
              <Search />
              <h3>No purchase orders found</h3>
              <p>Try a different search term.</p>
            </div>
          }
          panelTitle={true}
          panelContent={
            <div className="tabs text-nowrap">
              {[
                ["All", "All"],
                ["Draft", "Draft"],
                ["Issued", "Issued"],
                ["Acknowledged", "Acknowledged"],
                ["Partially received", "Partially received"],
                ["Received", "Received"],
                ["Cancelled", "Cancelled"],
              ].map(([value, label]) => (
                <button
                  className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${status === value ? "border-blue-600 text-blue-600!"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800"
                    }`}
                  onClick={() => setStatus(value)}
                  key={value}
                >
                  {label}
                </button>
              ))}
            </div>
          }
        />
      )}
    </>
  );
}
