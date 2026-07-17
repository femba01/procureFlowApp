import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Boxes, Warehouse } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getInventoryItemById } from "../../api/inventoryApi";
import StockBadge from "../../components/StockBadge";
import { useAppStore } from "../../store/store";
import { money } from "../../utils/currency";
import { DateTimeFormat } from "../../utils/datetimeFormat";

const displayStatus = (status: string) =>
  status
    .replaceAll("_", " ")
    .replace(/^./, (letter) => letter.toUpperCase());

export default function InventoryDetailsPage() {
  const { itemId = "" } = useParams();
  const organizationId = useAppStore((state) => state.user?.organization_id ?? "");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["inventory-item", itemId, organizationId],
    queryFn: () => getInventoryItemById(itemId, organizationId),
    enabled: Boolean(itemId && organizationId),
  });

  if (isLoading) return <div className="detail-loading" />;
  if (isError || !data)
    return (
      <div className="empty">
        <Boxes />
        <h3>Inventory item not found</h3>
        <Link to="/inventory">Return to inventory</Link>
      </div>
    );

  const available = data.quantity - data.reserved_quantity;

  return (
    <>
      <div className="back-row">
        <Link to="/inventory">
          <ArrowLeft size={17} />
          Back to inventory
        </Link>
        <span>{data.sku}</span>
      </div>
      <section className="inventory-hero panel">
        <div className="large-item-icon"><Boxes /></div>
        <div>
          <div className="supplier-heading">
            <h2>{data.name}</h2>
            <StockBadge status={displayStatus(data.status)} />
          </div>
          <p>
            {data.sku} · {data.category} · {data.warehouse?.name || "Unknown warehouse"}
          </p>
        </div>
      </section>
      <section className="inventory-detail-stats">
        <article className="panel">
          <span>On hand</span><strong>{data.quantity}</strong><small>Physical inventory</small>
        </article>
        <article className="panel">
          <span>Available</span><strong>{available}</strong>
          <small>After {data.reserved_quantity} reserved</small>
        </article>
        <article className="panel">
          <span>Reorder threshold</span><strong>{data.reorder_level}</strong>
          <small>
            {data.quantity <= data.reorder_level
              ? "Reorder is required"
              : "Stock level is healthy"}
          </small>
        </article>
        <article className="panel">
          <span>Inventory value</span>
          <strong>{money(data.quantity * data.unit_cost)}</strong>
          <small>{money(data.unit_cost)} per unit</small>
        </article>
      </section>
      <div className="inventory-detail-layout">
        <section className="panel movement-panel">
          <div className="panel-title">
            <div>
              <h3>Inventory information</h3>
              <p>Current database values for this catalogue item</p>
            </div>
          </div>
          <div className="overview-grid">
            <div><span>Warehouse</span><strong>{data.warehouse?.name || "Not available"}</strong></div>
            <div><span>Warehouse code</span><strong>{data.warehouse?.code || "Not available"}</strong></div>
            <div><span>Location</span><strong>{data.warehouse?.location || "Not available"}</strong></div>
            <div>
              <span>Last updated</span>
              <strong>{DateTimeFormat(data.updated_at, { dateStyle: "medium" }, "Date")}</strong>
            </div>
          </div>
        </section>
        <aside className="panel reorder-card">
          <Warehouse />
          <h3>Warehouse</h3>
          <p>{data.warehouse?.name || "Not available"}</p>
          <strong>{data.warehouse?.location || ""}</strong>
        </aside>
      </div>
    </>
  );
}
