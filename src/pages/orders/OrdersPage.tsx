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
import { getPurchaseOrders } from "../../api/purchaseOrdersApi";
import OrderStatus from "../../components/OrderStatus";
import { useAppStore } from "../../store/store";
import { money } from "../../utils/currency";
import { DateTimeFormat } from "../../utils/datetimeFormat";

const displayStatus = (status: string) =>
  status
    .replaceAll("_", " ")
    .replace(/^./, (letter) => letter.toUpperCase());

export default function OrdersPage() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const organizationId = useAppStore((state) => state.user?.organization_id ?? "");
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ["orders", organizationId],
    queryFn: () => getPurchaseOrders(organizationId),
    enabled: Boolean(organizationId),
  });
  const rows = useMemo(
    () =>
      data.filter((order) =>
        `${order.po_number} ${order.supplier?.name || ""} ${order.purchase_request?.request_number || ""} ${order.purchase_request?.title || ""}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [data, query],
  );

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
                  ["issued", "acknowledged"].includes(order.status.toLowerCase()),
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
              {data.filter((order) => order.status.toLowerCase() === "received").length}
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
      <article className="panel supplier-table">
        <div className="table-wrap">
          {isError ? (
            <div className="empty">
              <ClipboardCheck />
              <h3>Purchase orders could not be loaded</h3>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Purchase order</th>
                  <th>Supplier</th>
                  <th>Order value</th>
                  <th>Status</th>
                  <th>Delivery progress</th>
                  <th>Issued</th>
                  <th>Expected</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((order) => {
                  const received = order.purchase_order_items.reduce(
                    (total, item) => total + item.received_quantity,
                    0,
                  );
                  const ordered = order.purchase_order_items.reduce(
                    (total, item) => total + item.ordered_quantity,
                    0,
                  );
                  return (
                    <tr
                      key={order.id}
                      className="clickable-row"
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      <td>
                        <strong>{order.po_number}</strong>
                        <small>
                          From {order.purchase_request?.request_number || order.request_id}
                        </small>
                      </td>
                      <td>{order.supplier?.name || "Unknown supplier"}</td>
                      <td className="amount">{money(order.total)}</td>
                      <td>
                        <OrderStatus status={displayStatus(order.status)} />
                      </td>
                      <td>
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
                      </td>
                      <td>{DateTimeFormat(order.issued_at, { dateStyle: "medium" }, "Date")}</td>
                      <td>
                        {DateTimeFormat(
                          order.expected_delivery,
                          { dateStyle: "medium" },
                          "Date",
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {!isError && rows.length === 0 && (
            <div className="empty">
              <Search />
              <h3>No purchase orders found</h3>
              <p>Try a different search term.</p>
            </div>
          )}
        </div>
      </article>
    </>
  );
}
