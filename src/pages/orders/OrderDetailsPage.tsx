import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Package,
  Truck,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { createGoodsReceipt, getOrder, updateOrderStatus } from "../../api/api";
import DetailField from "../../components/DetailField";
import OrderStatus from "../../components/OrderStatus";
import { money } from "../../utils/currency";
export default function OrderDetailsPage() {
  const { orderId = "" } = useParams();
  const client = useQueryClient();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [condition, setCondition] = useState<
    "Accepted" | "Accepted with issues"
  >("Accepted");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { data, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrder(orderId),
  });
  const statusMutation = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: (value) => {
      client.setQueryData(["order", orderId], value);
      client.invalidateQueries({ queryKey: ["orders"] });
      client.invalidateQueries({ queryKey: ["inventory"] });
      client.invalidateQueries({ queryKey: ["movements"] });
    },
  });
  const receiptMutation = useMutation({
    mutationFn: createGoodsReceipt,
    onSuccess: (value) => {
      client.setQueryData(["order", orderId], value);
      client.invalidateQueries({ queryKey: ["orders"] });
      client.invalidateQueries({ queryKey: ["inventory"] });
      client.invalidateQueries({ queryKey: ["movements"] });
      setOpen(false);
      setQuantities({});
      setDeliveryNote("");
      setNote("");
    },
  });
  if (isLoading || !data) return <div className="detail-loading" />;
  const received = data.items.reduce((a, i) => a + i.receivedQuantity, 0);
  const ordered = data.items.reduce((a, i) => a + i.orderedQuantity, 0);
  const progress = ordered ? (received / ordered) * 100 : 0;
  return (
    <>
      <div className="back-row">
        <Link to="/orders">
          <ArrowLeft size={17} />
          Back to purchase orders
        </Link>
        <span>{data.id}</span>
      </div>
      <section className="order-hero">
        <div>
          <div className="request-id">
            <span>Purchase order</span>
            <OrderStatus status={data.status} />
          </div>
          <h2>{data.id}</h2>
          <p>
            {data.supplierName} · Generated from {data.requestId}
          </p>
        </div>
        <div className="button-row">
          {data.status === "Issued" && (
            <button
              className="secondary-button"
              onClick={() =>
                statusMutation.mutate({ id: data.id, status: "Acknowledged" })
              }
            >
              Mark acknowledged
            </button>
          )}
          {data.status !== "Received" && data.status !== "Cancelled" && (
            <button className="primary-button" onClick={() => setOpen(true)}>
              <Package size={17} />
              Receive goods
            </button>
          )}
        </div>
      </section>
      <section className="order-overview-grid">
        <article className="panel delivery-card">
          <div>
            <span>Delivery progress</span>
            <strong>{Math.round(progress)}%</strong>
          </div>
          <div className="large-progress">
            <i style={{ width: `${progress}%` }} />
          </div>
          <p>
            {received} of {ordered} units received
          </p>
        </article>
        <article className="panel">
          <span>Order value</span>
          <strong>{money(data.total)}</strong>
          <small>{data.paymentTerms} payment terms</small>
        </article>
        <article className="panel">
          <span>Expected delivery</span>
          <strong>{data.expectedDelivery}</strong>
          <small>Issued {data.issuedAt}</small>
        </article>
        <article className="panel">
          <span>Goods receipts</span>
          <strong>{data.receipts.length}</strong>
          <small>
            {data.receipts.length
              ? "Latest received " + data.receipts[0].receivedAt
              : "No deliveries recorded"}
          </small>
        </article>
      </section>
      <div className="order-detail-layout">
        <div>
          <section className="panel order-items-panel">
            <div className="detail-title">
              <div>
                <h3>Order items</h3>
                <p>Ordered and received quantities</p>
              </div>
              <strong>{money(data.total)}</strong>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Unit price</th>
                    <th>Ordered</th>
                    <th>Received</th>
                    <th>Outstanding</th>
                    <th>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.description}</strong>
                        <small>{item.id}</small>
                      </td>
                      <td>{money(item.unitPrice)}</td>
                      <td>{item.orderedQuantity}</td>
                      <td>{item.receivedQuantity}</td>
                      <td>{item.orderedQuantity - item.receivedQuantity}</td>
                      <td>
                        <div className="mini-progress">
                          <i
                            style={{
                              width: `${(item.receivedQuantity / item.orderedQuantity) * 100}%`,
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section className="panel receipt-history">
            <h3>Goods receipt history</h3>
            {data.receipts.length === 0 ? (
              <div className="no-receipts">
                <Truck />
                <p>No goods have been received for this order.</p>
              </div>
            ) : (
              data.receipts.map((receipt) => (
                <article key={receipt.id}>
                  <div className="receipt-icon">
                    <ClipboardCheck />
                  </div>
                  <div>
                    <strong>{receipt.id}</strong>
                    <p>
                      Delivery note {receipt.deliveryNote} ·{" "}
                      {receipt.items.reduce((a, i) => a + i.quantity, 0)} units
                    </p>
                    <small>
                      Received by {receipt.receivedBy} · {receipt.receivedAt}
                    </small>
                  </div>
                  <span>
                    <CheckCircle2 />
                    {receipt.condition}
                  </span>
                </article>
              ))
            )}
          </section>
        </div>
        <aside className="panel po-meta">
          <h3>Order information</h3>
          <DetailField
            className="po-info"
            label="Supplier"
            value={data.supplierName}
          />
          <DetailField
            className="po-info"
            label="Delivery address"
            value={data.deliveryAddress}
          />
          <DetailField
            className="po-info"
            label="Payment terms"
            value={data.paymentTerms}
          />
          <DetailField
            className="po-info"
            label="Currency"
            value={data.currency}
          />
          <DetailField
            className="po-info"
            label="Quotation"
            value={data.quotationId}
          />
          <DetailField
            className="po-info"
            label="Purchase request"
            value={data.requestId}
          />
        </aside>
      </div>
      {open && (
        <div className="modal-layer">
          <button className="modal-backdrop" onClick={() => setOpen(false)} />
          <form
            className="supplier-modal receipt-modal"
            onSubmit={(e) => {
              e.preventDefault();
              receiptMutation.mutate({
                orderId: data.id,
                deliveryNote,
                condition,
                notes: note,
                items: data.items.map((item) => ({
                  itemId: item.id,
                  quantity: quantities[item.id] || 0,
                })),
              });
            }}
          >
            <div className="modal-title">
              <div>
                <span>
                  <Package />
                </span>
                <div>
                  <h3>Record goods receipt</h3>
                  <p>
                    {data.id} · {data.supplierName}
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)}>
                <X />
              </button>
            </div>
            <div className="receipt-form">
              <div className="modal-grid receipt-fields">
                <label className="form-field">
                  <span>Supplier delivery note</span>
                  <input
                    required
                    value={deliveryNote}
                    onChange={(e) => setDeliveryNote(e.target.value)}
                    placeholder="e.g. DN-20984"
                  />
                </label>
                <label className="form-field">
                  <span>Delivery condition</span>
                  <select
                    value={condition}
                    onChange={(e) =>
                      setCondition(e.target.value as typeof condition)
                    }
                  >
                    <option>Accepted</option>
                    <option>Accepted with issues</option>
                  </select>
                </label>
              </div>
              <div className="receive-lines">
                <div className="receive-header">
                  <span>Item</span>
                  <span>Ordered</span>
                  <span>Previously received</span>
                  <span>Receive now</span>
                </div>
                {data.items.map((item) => {
                  const outstanding =
                    item.orderedQuantity - item.receivedQuantity;
                  return (
                    <div className="receive-row" key={item.id}>
                      <div>
                        <strong>{item.description}</strong>
                        <small>{outstanding} outstanding</small>
                      </div>
                      <span>{item.orderedQuantity}</span>
                      <span>{item.receivedQuantity}</span>
                      <input
                        type="number"
                        min="0"
                        max={outstanding}
                        value={quantities[item.id] || 0}
                        onChange={(e) =>
                          setQuantities((q) => ({
                            ...q,
                            [item.id]: Number(e.target.value),
                          }))
                        }
                      />
                    </div>
                  );
                })}
              </div>
              <label className="form-field receipt-notes">
                <span>Inspection notes (optional)</span>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Record damaged packaging, shortages or other observations"
                />
              </label>
              {receiptMutation.isError && (
                <p className="mutation-error">
                  {receiptMutation.error.message}
                </p>
              )}
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
                disabled={
                  !deliveryNote ||
                  Object.values(quantities).every((value) => !value) ||
                  receiptMutation.isPending
                }
              >
                {receiptMutation.isPending
                  ? "Processing receipt..."
                  : "Confirm goods receipt"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
