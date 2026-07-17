import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Boxes,
  PackageCheck,
  Plus,
  Search,
  Warehouse,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getInventoryItems, getWarehouses } from "../../api/inventoryApi";
import StockBadge from "../../components/StockBadge";
import WarehouseFormModal from "../../components/WarehouseFormModal";
import { useAppStore } from "../../store/store";
import { compactMoney as money } from "../../utils/currency";
import { DateTimeFormat } from "../../utils/datetimeFormat";

const displayStatus = (status: string) =>
  status
    .replaceAll("_", " ")
    .replace(/^./, (letter) => letter.toUpperCase());

export default function InventoryPage() {
  const [query, setQuery] = useState("");
  const [warehouse, setWarehouse] = useState("All");
  const [warehouseModalOpen, setWarehouseModalOpen] = useState(false);
  const navigate = useNavigate();
  const organizationId = useAppStore((state) => state.user?.organization_id ?? "");
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ["inventory", organizationId],
    queryFn: () => getInventoryItems(organizationId),
    enabled: Boolean(organizationId),
  });
  const { data: warehouses = [] } = useQuery({
    queryKey: ["warehouses", organizationId],
    queryFn: () => getWarehouses(organizationId),
    enabled: Boolean(organizationId),
  });
  const rows = useMemo(
    () =>
      data.filter(
        (item) =>
          (warehouse === "All" || item.warehouse_id === warehouse) &&
          `${item.name} ${item.sku} ${item.category}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [data, query, warehouse],
  );
  const value = data.reduce(
    (sum, item) => sum + item.quantity * item.unit_cost,
    0,
  );
  const inStock = data.filter((item) => item.status === "in_stock").length;
  const lowStock = data.filter((item) => item.status === "low_stock").length;
  const outOfStock = data.filter((item) => item.status === "out_of_stock").length;
  const percentage = (count: number) => (data.length ? (count / data.length) * 100 : 0);

  if (isLoading) return <div className="detail-loading" />;

  return (
    <>
      <section className="welcome">
        <div>
          <h2>Inventory control</h2>
          <p>Monitor stock availability, valuation and reorder risk across warehouses.</p>
        </div>
        <div className="button-row">
          <button
            className="secondary-button"
            onClick={() => setWarehouseModalOpen(true)}
          >
            <Warehouse size={17} />
            Add warehouse
          </button>
          <Link className="primary-button" to="/inventory/new">
            <Plus size={17} />
            Add inventory
          </Link>
        </div>
      </section>
      <section className="inventory-stats">
        <article>
          <div className="inventory-stat-icon blue"><Boxes /></div>
          <div>
            <span>Total stock units</span>
            <strong>{data.reduce((sum, item) => sum + item.quantity, 0)}</strong>
            <small>Across {data.length} catalogue items</small>
          </div>
        </article>
        <article>
          <div className="inventory-stat-icon green"><PackageCheck /></div>
          <div>
            <span>Inventory value</span>
            <strong>{money(value)}</strong>
            <small>Based on latest unit cost</small>
          </div>
        </article>
        <article>
          <div className="inventory-stat-icon orange"><AlertTriangle /></div>
          <div>
            <span>Reorder alerts</span>
            <strong>{lowStock + outOfStock}</strong>
            <small>Requires procurement action</small>
          </div>
        </article>
        <article>
          <div className="inventory-stat-icon purple"><Warehouse /></div>
          <div>
            <span>Warehouses</span>
            <strong>{warehouses.length}</strong>
            <small>
              {new Set(warehouses.map((item) => item.location)).size} locations covered
            </small>
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
          <i className="healthy" style={{ width: `${percentage(inStock)}%` }} />
          <i className="low" style={{ width: `${percentage(lowStock)}%` }} />
          <i className="empty" style={{ width: `${percentage(outOfStock)}%` }} />
        </div>
        <div className="health-legend">
          <span><i className="healthy" />In stock <b>{inStock}</b></span>
          <span><i className="low" />Low stock <b>{lowStock}</b></span>
          <span><i className="empty" />Out of stock <b>{outOfStock}</b></span>
        </div>
      </section>
      <div className="request-toolbar inventory-toolbar">
        <label className="search wide">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search SKU, product or category..."
          />
        </label>
        <select value={warehouse} onChange={(event) => setWarehouse(event.target.value)}>
          <option value="All">All warehouses</option>
          {warehouses.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
      </div>
      <article className="panel supplier-table">
        <div className="table-wrap">
          {isError ? (
            <div className="empty"><Boxes /><h3>Inventory could not be loaded</h3></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Inventory item</th><th>Warehouse</th><th>Available</th>
                  <th>Reserved</th><th>Reorder level</th><th>Status</th>
                  <th>Stock value</th><th>Updated</th>
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
                        <span><Boxes /></span>
                        <div>
                          <strong>{item.name}</strong>
                          <small>{item.sku} · {item.category}</small>
                        </div>
                      </div>
                    </td>
                    <td>{item.warehouse?.name || "Unknown warehouse"}</td>
                    <td>
                      <strong>{item.quantity - item.reserved_quantity}</strong>
                      <small>{item.quantity} on hand</small>
                    </td>
                    <td>{item.reserved_quantity}</td>
                    <td>{item.reorder_level}</td>
                    <td><StockBadge status={displayStatus(item.status)} /></td>
                    <td className="amount">{money(item.quantity * item.unit_cost)}</td>
                    <td>
                      {DateTimeFormat(item.updated_at, { dateStyle: "medium" }, "Date")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!isError && rows.length === 0 && (
            <div className="empty"><Search /><h3>No inventory items found</h3></div>
          )}
        </div>
      </article>
      {warehouseModalOpen && (
        <WarehouseFormModal onClose={() => setWarehouseModalOpen(false)} />
      )}
    </>
  );
}
