import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Boxes, Warehouse, SlidersHorizontal, ArrowDownLeft, ArrowUpRight, X } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getInventoryItemById, getStockMovementsById } from "../../api/inventoryApi";
import StockBadge from "../../components/StockBadge";
import { useAppStore } from "../../store/store";
import { money } from "../../utils/currency";
import { useState } from "react";

const displayStatus = (status: string) =>
  status
    .replaceAll("_", " ")
    .replace(/^./, (letter) => letter.toUpperCase());

export default function InventoryDetailsPage() {
  const { itemId = "" } = useParams();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<
    "Positive adjustment" | "Negative adjustment"
  >("Positive adjustment");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [reference, setReference] = useState("");
  const organizationId = useAppStore((state) => state.user?.organization_id ?? "");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["inventory-item", itemId, organizationId],
    queryFn: () => getInventoryItemById(itemId, organizationId),
    enabled: Boolean(itemId && organizationId),
  });

  const { data: stockMovements, } = useQuery({
    queryKey: ["stock-movements", itemId],
    queryFn: () => getStockMovementsById(itemId),
    enabled: Boolean(itemId),
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
        <button className="primary-button" onClick={() => setOpen(true)}>
          <SlidersHorizontal size={16} />
          Adjust stock
        </button>
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
              <h3>Stock movement ledger</h3>
              <p>Every quantity change with its source reference</p>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Movement</th>
                  <th>Quantity</th>
                  <th>Balance</th>
                  <th>Reference</th>
                  <th>Performed by</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stockMovements?.map((movement) => (
                  <tr key={movement.id}>
                    <td>
                      <div
                        className={`movement-type ${movement.quantity > 0 ? "positive" : "negative"}`}
                      >
                        {movement.quantity > 0 ? (
                          <ArrowDownLeft />
                        ) : (
                          <ArrowUpRight />
                        )}
                        <span>
                          <strong>{movement.type}</strong>
                          <small>
                            {movement.notes || movement.warehouseName}
                          </small>
                        </span>
                      </div>
                    </td>
                    <td
                      className={
                        movement.quantity > 0
                          ? "positive-number"
                          : "negative-number"
                      }
                    >
                      {movement.quantity > 0 ? "+" : ""}
                      {movement.quantity}
                    </td>
                    <td>{movement.balanceAfter}</td>
                    <td>{movement.reference}</td>
                    <td>{movement.performedBy}</td>
                    <td>{movement.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {stockMovements?.length === 0 && (
              <div className="no-receipts">
                No movements recorded for this item.
              </div>
            )}
          </div>
        </section>
        <aside className="panel reorder-card">
          <h3>Reorder controls</h3>
          <div className="reorder-gauge">
            <div
              style={
                {
                  "--stock-angle": `${Math.min(100, (data.quantity / Math.max(1, data.reorder_level * 2)) * 100) * 1.8}deg`,
                } as React.CSSProperties
              }
            >
              <strong>{data.quantity}</strong>
              <span>units</span>
            </div>
          </div>
          <p>
            Reorder when inventory reaches{" "}
            <strong>{data.reorder_level} units</strong>.
          </p>
          <button className="secondary-button">Create purchase request</button>
        </aside>
      </div>
      {open && (
        <div className="modal-layer">
          <button className="modal-backdrop" onClick={() => setOpen(false)} />
          <form
            className="supplier-modal adjustment-modal"
            // onSubmit={(e) => {
            //   e.preventDefault();
            //   mutation.mutate({ itemId, type, quantity, reason, reference });
            // }}
          >
            <div className="modal-title">
              <div>
                <span>
                  <SlidersHorizontal />
                </span>
                <div>
                  <h3>Adjust stock balance</h3>
                  <p>
                    {data.name} · Current balance {data.quantity}
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)}>
                <X />
              </button>
            </div>
            <div className="adjustment-form">
              <label className="form-field">
                <span>Adjustment type</span>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as typeof type)}
                >
                  <option>Positive adjustment</option>
                  <option>Negative adjustment</option>
                </select>
              </label>
              <label className="form-field">
                <span>Quantity</span>
                <input
                  type="number"
                  min="1"
                  max={
                    type === "Negative adjustment" ? data.quantity : undefined
                  }
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </label>
              <label className="form-field">
                <span>Reference</span>
                <input
                  required
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. COUNT-2026-014"
                />
              </label>
              <label className="form-field full-field">
                <span>Reason for adjustment</span>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain the physical count variance or correction"
                />
              </label>
              <div className="balance-preview">
                <span>Balance after adjustment</span>
                <strong>
                  {type === "Positive adjustment"
                    ? data.quantity + quantity
                    : data.quantity - quantity}{" "}
                  units
                </strong>
              </div>
              {/* {mutation.isError && (
                <p className="mutation-error">{mutation.error.message}</p>
              )} */}
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                className="primary-button"
                // disabled={
                //   !reason || !reference || quantity < 1 || mutation.isPending
                // }
              >
                {/* {mutation.isPending
                  ? "Saving adjustment..."
                  : "Confirm adjustment"} */}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
