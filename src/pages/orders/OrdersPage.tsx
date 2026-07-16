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
import { getOrders } from "../../api/api";
import OrderStatus from "../../components/OrderStatus";
import { money } from "../../utils/currency";
export default function OrdersPage() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { data = [] } = useQuery({ queryKey: ["orders"], queryFn: getOrders });
  const rows = useMemo(
    () =>
      data.filter((order) =>
        `${order.id} ${order.supplierName} ${order.requestId}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [data, query],
  );
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
                data.filter(
                  (o) => o.status === "Issued" || o.status === "Acknowledged",
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
              {data.filter((o) => o.status === "Partially received").length}
            </strong>
          </div>
        </article>
        <article>
          <PackageCheck />
          <div>
            <span>Fully received</span>
            <strong>
              {data.filter((o) => o.status === "Received").length}
            </strong>
          </div>
        </article>
      </section>
      <div className="request-toolbar">
        <label className="search wide">
          <Search size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search orders, suppliers or requests..."
          />
        </label>
      </div>
      <article className="panel supplier-table">
        <div className="table-wrap">
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
                const received = order.items.reduce(
                  (a, i) => a + i.receivedQuantity,
                  0,
                );
                const total = order.items.reduce(
                  (a, i) => a + i.orderedQuantity,
                  0,
                );
                return (
                  <tr
                    key={order.id}
                    className="clickable-row"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <td>
                      <strong>{order.id}</strong>
                      <small>From {order.requestId}</small>
                    </td>
                    <td>{order.supplierName}</td>
                    <td className="amount">{money(order.total)}</td>
                    <td>
                      <OrderStatus status={order.status} />
                    </td>
                    <td>
                      <div className="delivery-progress">
                        <div>
                          <i
                            style={{
                              width: `${total ? (received / total) * 100 : 0}%`,
                            }}
                          />
                        </div>
                        <small>
                          {received} of {total} units
                        </small>
                      </div>
                    </td>
                    <td>{order.issuedAt}</td>
                    <td>{order.expectedDelivery}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </article>
    </>
  );
}
