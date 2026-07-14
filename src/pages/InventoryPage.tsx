import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Boxes,
  PackageCheck,
  Search,
  Warehouse,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getInventory, getWarehouses } from "../api/api";
import StockBadge from "../components/StockBadge";
import { compactMoney as money } from "../utils/currency";
export default function InventoryPage() {
  const [query, setQuery] = useState("");
  const [warehouse, setWarehouse] = useState("All");
  const navigate = useNavigate();
  const { data = [] } = useQuery({
    queryKey: ["inventory"],
    queryFn: getInventory,
  });
  const { data: warehouses = [] } = useQuery({
    queryKey: ["warehouses"],
    queryFn: getWarehouses,
  });
  const rows = useMemo(
    () =>
      data.filter(
        (item) =>
          (warehouse === "All" || item.warehouseId === warehouse) &&
          `${item.name} ${item.sku} ${item.category}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [data, query, warehouse],
  );
  const value = data.reduce(
    (sum, item) => sum + item.quantity * item.unitCost,
    0,
  );
  return (
    <>
      <section className="welcome">
        <div>
          <h2>Inventory control</h2>
          <p>
            Monitor stock availability, valuation and reorder risk across
            warehouses.
          </p>
        </div>
      </section>
      <section className="inventory-stats">
        <article>
          <div className="inventory-stat-icon blue">
            <Boxes />
          </div>
          <div>
            <span>Total stock units</span>
            <strong>{data.reduce((a, i) => a + i.quantity, 0)}</strong>
            <small>Across {data.length} catalogue items</small>
          </div>
        </article>
        <article>
          <div className="inventory-stat-icon green">
            <PackageCheck />
          </div>
          <div>
            <span>Inventory value</span>
            <strong>{money(value)}</strong>
            <small>Based on latest unit cost</small>
          </div>
        </article>
        <article>
          <div className="inventory-stat-icon orange">
            <AlertTriangle />
          </div>
          <div>
            <span>Reorder alerts</span>
            <strong>
              {data.filter((i) => i.status !== "In stock").length}
            </strong>
            <small>Requires procurement action</small>
          </div>
        </article>
        <article>
          <div className="inventory-stat-icon purple">
            <Warehouse />
          </div>
          <div>
            <span>Warehouses</span>
            <strong>{warehouses.length}</strong>
            <small>2 cities covered</small>
          </div>
        </article>
      </section>
      <section className="panel stock-health">
        <div className="panel-title">
          <div>
            <h3>Stock health</h3>
            <p>Availability distribution across the catalogue</p>
          </div>
        </div>
        <div className="health-bar">
          <i
            className="healthy"
            style={{
              width: `${(data.filter((i) => i.status === "In stock").length / data.length) * 100}%`,
            }}
          />
          <i
            className="low"
            style={{
              width: `${(data.filter((i) => i.status === "Low stock").length / data.length) * 100}%`,
            }}
          />
          <i
            className="empty"
            style={{
              width: `${(data.filter((i) => i.status === "Out of stock").length / data.length) * 100}%`,
            }}
          />
        </div>
        <div className="health-legend">
          <span>
            <i className="healthy" />
            In stock <b>{data.filter((i) => i.status === "In stock").length}</b>
          </span>
          <span>
            <i className="low" />
            Low stock{" "}
            <b>{data.filter((i) => i.status === "Low stock").length}</b>
          </span>
          <span>
            <i className="empty" />
            Out of stock{" "}
            <b>{data.filter((i) => i.status === "Out of stock").length}</b>
          </span>
        </div>
      </section>
      <div className="request-toolbar inventory-toolbar">
        <label className="search wide">
          <Search size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search SKU, product or category..."
          />
        </label>
        <select
          value={warehouse}
          onChange={(e) => setWarehouse(e.target.value)}
        >
          <option value="All">All warehouses</option>
          {warehouses.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
      <article className="panel supplier-table">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Inventory item</th>
                <th>Warehouse</th>
                <th>Available</th>
                <th>Reserved</th>
                <th>Reorder level</th>
                <th>Status</th>
                <th>Stock value</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr
                  key={item.id}
                  className="clickable-row"
                  onClick={() => navigate(`/inventory/${item.id}`)}
                >
                  <td>
                    <div className="inventory-name">
                      <span>
                        <Boxes />
                      </span>
                      <div>
                        <strong>{item.name}</strong>
                        <small>
                          {item.sku} · {item.category}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>{item.warehouseName}</td>
                  <td>
                    <strong>{item.quantity - item.reserved}</strong>
                    <small>{item.quantity} on hand</small>
                  </td>
                  <td>{item.reserved}</td>
                  <td>{item.reorderLevel}</td>
                  <td>
                    <StockBadge status={item.status} />
                  </td>
                  <td className="amount">
                    {money(item.quantity * item.unitCost)}
                  </td>
                  <td>{item.lastUpdated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </>
  );
}
