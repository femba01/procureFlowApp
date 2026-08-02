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
import {
  getInventoryItems,
  getWarehouses,
  type InventoryItemRecord,
} from "../../api/inventoryApi";
import StockBadge from "../../components/StockBadge";
import Table, { type TableColumn } from "../../components/ui/Table";
import WarehouseFormModal from "../../components/WarehouseFormModal";
import { useAppStore } from "../../store/store";
import { compactMoney as money } from "../../utils/currency";
import { DateTimeFormat } from "../../utils/datetimeFormat";

const displayStatus = (status: string) =>
  status.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());

export default function InventoryPage() {
  const [query, setQuery] = useState("");
  const [warehouse, setWarehouse] = useState("All");
  const [status, setStatus] = useState("All");
  const [warehouseModalOpen, setWarehouseModalOpen] = useState(false);
  const navigate = useNavigate();
  const organizationId = useAppStore(
    (state) => state.user?.organization_id ?? "",
  );
  const {
    data = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["inventory", organizationId],
    queryFn: () => getInventoryItems(organizationId),
    enabled: Boolean(organizationId),
  });
  const { data: warehouses = [] } = useQuery({
    queryKey: ["warehouses", organizationId],
    queryFn: () => getWarehouses(organizationId),
    enabled: Boolean(organizationId),
  });

  const rows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return data.filter((item) => {
      const matchesWarehouse =
        warehouse === "All" || item.warehouse_id === warehouse;

      const matchesStatus =
        status === "All" || item.status === status;

      const searchableText =
        `${item.name} ${item.sku} ${item.category}`.toLowerCase();

      const matchesSearch =
        !normalizedQuery || searchableText.includes(normalizedQuery);

      return matchesWarehouse && matchesStatus && matchesSearch;
    });
  }, [data, query, warehouse, status]);

  const value = data.reduce(
    (sum, item) => sum + item.quantity * item.unit_cost,
    0,
  );
  const inStock = data.filter((item) => item.status === "in_stock").length;
  const lowStock = data.filter((item) => item.status === "low_stock").length;
  const outOfStock = data.filter(
    (item) => item.status === "out_of_stock",
  ).length;
  const percentage = (count: number) =>
    data.length ? (count / data.length) * 100 : 0;
  const columns: TableColumn<InventoryItemRecord>[] = [
    {
      key: "name",
      header: "Inventory item",
      render: (item) => (
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
      ),
    },
    {
      key: "warehouse",
      header: "Warehouse",
      render: (item) => item.warehouse?.name || "Unknown warehouse",
    },
    {
      key: "quantity",
      header: "Available",
      render: (item) => (
        <>
          <strong>{item.quantity - item.reserved_quantity}</strong>
          <small className="text-nowrap">{item.quantity} on hand</small>
        </>
      ),
    },
    { key: "reserved_quantity", header: "Reserved" },
    { key: "reorder_level", header: "Reorder level" },
    {
      key: "status",
      header: "Status",
      render: (item) => <StockBadge status={displayStatus(item.status)} />,
    },
    {
      key: "unit_cost",
      header: "Stock value",
      className: "amount",
      render: (item) => money(item.quantity * item.unit_cost),
    },
    {
      key: "updated_at",
      header: "Updated",
      render: (item) =>
        DateTimeFormat(item.updated_at, { dateStyle: "medium" }, "Date"),
    },
  ];

  if (isLoading) return <div className="detail-loading" />;

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
          <div className="inventory-stat-icon blue">
            <Boxes />
          </div>
          <div>
            <span>Total stock units</span>
            <strong>
              {data.reduce((sum, item) => sum + item.quantity, 0)}
            </strong>
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
            <strong>{lowStock + outOfStock}</strong>
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
            <small>
              {new Set(warehouses.map((item) => item.location)).size} locations
              covered
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
          <i
            className="empty"
            style={{ width: `${percentage(outOfStock)}%` }}
          />
        </div>
        <div className="health-legend">
          <span>
            <i className="healthy" />
            In stock <b>{inStock}</b>
          </span>
          <span>
            <i className="low" />
            Low stock <b>{lowStock}</b>
          </span>
          <span>
            <i className="empty" />
            Out of stock <b>{outOfStock}</b>
          </span>
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
        <select
          value={warehouse}
          onChange={(event) => setWarehouse(event.target.value)}
        >
          <option value="All">All warehouses</option>
          {warehouses.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
      {isError ? (
        <div className="empty">
          <Boxes />
          <h3>Inventory could not be loaded</h3>
        </div>
      ) : (
        <Table
          className="supplier-table"
          data={rows}
          columns={columns}
          rowKey={(item) => item.id}
          onRowClick={(item) => navigate(`/inventory/${item.id}`)}
          emptyMessage={
            <div className="empty">
              <Search />
              <h3>No inventory items found</h3>
            </div>
          }
          panelTitle={true}
          panelContent={
            <div className="tabs text-nowrap">
              {[
                ["All", "All"],
                ["in_stock", "In stock"],
                ["low_stock", "Low stock"],
                ["out_of_stock", "Out of stock"],
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
      {warehouseModalOpen && (
        <WarehouseFormModal onClose={() => setWarehouseModalOpen(false)} />
      )}
    </>
  );
}
