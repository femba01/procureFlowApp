import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Package, PackageCheck, Truck, X } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import {
  getPurchaseOrderById,
  updateOrderReceipt,
  type PurchaseOrderItemRecord,
} from "../../api/purchaseOrdersApi";
import DetailField from "../../components/DetailField";
import OrderStatus from "../../components/OrderStatus";
import Table, { type TableColumn } from "../../components/ui/Table";
import { useAppStore } from "../../store/store";
import { money } from "../../utils/currency";
import { DateTimeFormat } from "../../utils/datetimeFormat";
import { useState } from "react";
import type { UpdateOrderReceiptInput } from "../../types/orders";

const displayStatus = (status: string) =>
  status.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());

export default function OrderDetailsPage() {
  const { orderId = "" } = useParams();
  const user = useAppStore((state) => state.user);
  const organizationId = user?.organization_id ?? "";
  const queryClient = useQueryClient();
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [nextStatus, setNextStatus] =
    useState<UpdateOrderReceiptInput["status"]>("acknowledged");
  const [receivedQuantities, setReceivedQuantities] = useState<
    Record<string, number>
  >({});

  const { data, isLoading, isError } = useQuery({
    queryKey: ["order", orderId, organizationId],
    queryFn: () => getPurchaseOrderById(orderId, organizationId),
    enabled: Boolean(orderId && organizationId),
  });

  const mutation = useMutation({
    mutationFn: (input: UpdateOrderReceiptInput) => {
      if (!user) throw new Error("You must be signed in to update an order");
      return updateOrderReceipt({
        ...input,
        organizationId: user.organization_id,
        actorId: user.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", organizationId] });
      queryClient.invalidateQueries({
        queryKey: ["order", orderId, organizationId],
      });
      queryClient.invalidateQueries({ queryKey: ["budgets", organizationId] });
      queryClient.invalidateQueries({
        queryKey: ["spend-records", organizationId],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({
        queryKey: ["auditLogs", organizationId],
      });
      setReceiptOpen(false);
    },
  });

  if (isLoading) return <div className="detail-loading" />;
  if (isError || !data)
    return (
      <div className="empty">
        <Package />
        <h3>Purchase order not found</h3>
        <Link to="/orders">Return to purchase orders</Link>
      </div>
    );

  const canUpdateReceipt =
    data.status.toLowerCase() !== "received" &&
    (user?.role === "Administrator" || user?.role === "Procurement Officer");

  const openReceipt = () => {
    setNextStatus(
      data.status.toLowerCase() === "issued"
        ? "acknowledged"
        : (data.status.toLowerCase() as UpdateOrderReceiptInput["status"]),
    );
    setReceivedQuantities(
      Object.fromEntries(
        data.purchase_order_items.map((item) => [
          item.id,
          item.received_quantity,
        ]),
      ),
    );
    // receiptMutation.reset();
    setReceiptOpen(true);
  };

  const received = data.purchase_order_items.reduce(
    (total, item) => total + item.received_quantity,
    0,
  );
  const ordered = data.purchase_order_items.reduce(
    (total, item) => total + item.ordered_quantity,
    0,
  );
  const progress = ordered ? (received / ordered) * 100 : 0;

  const itemColumns: TableColumn<PurchaseOrderItemRecord>[] = [
    {
      key: "description",
      header: "Item",
      render: (item) => (
        <>
          <strong>{item.description}</strong>
          <small>{item.request_item_id || item.id}</small>
        </>
      ),
    },
    {
      key: "unit_price",
      header: "Unit price",
      render: (item) => money(item.unit_price),
    },
    { key: "ordered_quantity", header: "Ordered" },
    { key: "received_quantity", header: "Received" },
    {
      key: "outstanding",
      header: "Outstanding",
      render: (item) => item.ordered_quantity - item.received_quantity,
    },
    {
      key: "progress",
      header: "Progress",
      render: (item) => (
        <div className="mini-progress">
          <i
            style={{
              width: `${item.ordered_quantity ? (item.received_quantity / item.ordered_quantity) * 100 : 0}%`,
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="back-row">
        <Link to="/orders">
          <ArrowLeft size={17} />
          Back to purchase orders
        </Link>
        <span>{data.po_number}</span>
      </div>
      <section className="order-hero">
        <div>
          <div className="request-id">
            <span>Purchase order</span>
            <OrderStatus status={displayStatus(data.status)} />
          </div>
          <h2>{data.po_number}</h2>
          <p>
            {data.supplier?.name || "Unknown supplier"} · Generated from{" "}
            {data.purchase_request?.request_number || data.request_id}
          </p>
        </div>
        {canUpdateReceipt && (
          <button
            className="primary-button"
            type="button"
            onClick={openReceipt}
          >
            <PackageCheck size={17} />
            Update delivery
          </button>
        )}
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
          <small>{data.payment_terms || "No payment terms provided"}</small>
        </article>
        <article className="panel">
          <span>Expected delivery</span>
          <strong>
            {DateTimeFormat(
              data.expected_delivery,
              { dateStyle: "medium" },
              "Date",
            )}
          </strong>
          <small>
            Issued{" "}
            {DateTimeFormat(data.issued_at, { dateStyle: "medium" }, "Date")}
          </small>
        </article>
        <article className="panel">
          <span>Order items</span>
          <strong>{data.purchase_order_items.length}</strong>
          <small>{ordered} total units ordered</small>
        </article>
      </section>
      <section className="panel po-meta">
        <h3>Order information</h3>
        <hr className="text-gray-300" />
        <div className="flex flex-col md:gap-5 md:flex-row md:justify-between md:items-center">
          <DetailField
            className="po-info"
            label="Supplier"
            value={data.supplier?.name || "Unknown supplier"}
          />
          <DetailField
            className="po-info"
            label="Delivery address"
            value={data.delivery_address}
          />
          <DetailField
            className="po-info"
            label="Payment terms"
            value={data.payment_terms || "Not provided"}
          />
          <DetailField
            className="po-info"
            label="Currency"
            value={data.currency.trim()}
          />
          <DetailField
            className="po-info"
            label="Quotation"
            value={data.quotation_id}
          />
          <DetailField
            className="po-info"
            label="Purchase request"
            value={data.purchase_request?.request_number || data.request_id}
          />
        </div>
      </section>
      {/* <div className="order-detail-layout"> */}
      <div className="flex-col space-y-4">
        <Table
          className="order-items-panel"
          data={data.purchase_order_items}
          columns={itemColumns}
          rowKey={(item) => item.id}
          panelTitle
          panelContent={
            <div className="detail-title">
              <div>
                <h3>Order items</h3>
                <p>Ordered and received quantities</p>
              </div>
              <strong>{money(data.total)}</strong>
            </div>
          }
          emptyMessage={
            <div className="no-receipts">
              <Truck />
              <p>No items were found for this purchase order.</p>
            </div>
          }
        />
        {data.notes && (
          <section className="panel receipt-history">
            <h3>Order notes</h3>
            <p>{data.notes}</p>
          </section>
        )}
      </div>
      {/* <aside className="panel po-meta">
          <h3>Order information</h3>
          <DetailField
            className="po-info"
            label="Supplier"
            value={data.supplier?.name || "Unknown supplier"}
          />
          <DetailField
            className="po-info"
            label="Delivery address"
            value={data.delivery_address}
          />
          <DetailField
            className="po-info"
            label="Payment terms"
            value={data.payment_terms || "Not provided"}
          />
          <DetailField
            className="po-info"
            label="Currency"
            value={data.currency.trim()}
          />
          <DetailField
            className="po-info"
            label="Quotation"
            value={data.quotation_id}
          />
          <DetailField
            className="po-info"
            label="Purchase request"
            value={data.purchase_request?.request_number || data.request_id}
          />
        </aside> */}
      {/* </div> */}
      {receiptOpen && (
        <div className="modal-layer">
          <button
            className="modal-backdrop"
            type="button"
            aria-label="Close delivery update"
            onClick={() => setReceiptOpen(false)}
          />
          <form
            className="supplier-modal receipt-modal"
            onSubmit={(event) => {
              event.preventDefault();
            }}
          >
            <div className="modal-title">
              <div>
                <span>
                  <PackageCheck />
                </span>
                <div>
                  <h3>Update delivery</h3>
                  <p>
                    Record cumulative received quantities for {data.po_number}.
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setReceiptOpen(false)}
              >
                <X />
              </button>
            </div>
            <div className="receipt-form-body">
              <label className="form-field">
                <span>Order status</span>
                <select
                  value={nextStatus}
                  onChange={(event) =>
                    setNextStatus(
                      event.target.value as UpdateOrderReceiptInput["status"],
                    )
                  }
                >
                  <option value="issued">Issued</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="partially_received">Partially received</option>
                  <option value="received">Received</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </label>
              <div className="receipt-items">
                {data.purchase_order_items.map((item) => (
                  <label key={item.id} className="receipt-item">
                    <span>
                      <strong>{item.description}</strong>
                      <small>Expected: {item.ordered_quantity}</small>
                    </span>
                    <input
                      type="number"
                      min="0"
                      max={item.ordered_quantity}
                      step="1"
                      required
                      value={receivedQuantities[item.id] ?? 0}
                      onChange={(event) =>
                        setReceivedQuantities((current) => ({
                          ...current,
                          [item.id]: Number(event.target.value),
                        }))
                      }
                    />
                  </label>
                ))}
              </div>
              {nextStatus === "received" && (
                <p className="receipt-notice">
                  Completing this order will post {money(data.total)} to the
                  linked department budget.
                </p>
              )}
              {mutation.isError && (
                <p className="mutation-error" role="alert">
                  {mutation.error.message}
                </p>
              )}
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setReceiptOpen(false)}
              >
                Cancel
              </button>
              <button
                className="primary-button"
                type="button"
                disabled={mutation.isPending}
                onClick={() =>
                  // mutation.mutate({ quotationId, deliveryAddress: address, expectedDelivery: date, notes })

                  mutation.mutate({
                    orderId: orderId,
                    organizationId: organizationId,
                    actorId: user?.id ?? "",
                    status: nextStatus,
                    items: data.purchase_order_items.map((item) => ({
                      id: item.id,
                      receivedQuantity: receivedQuantities[item.id] ?? 0,
                    })),
                  })
                }
              >
                {mutation.isPending ? "Updating Order..." : "Update Order"}
              </button>
            </div>
          </form>
        </div>
      )}
      {/* {receiptOpen && (
        <Modal
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        title="Create purchase request"
        description="Provide the details for this request."
        icon={<FileText size={20} />}
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setReceiptOpen(false)}
            >
              Cancel
            </Button>

            <Button type="submit" form="purchase-request-form">
              Create request
            </Button>
          </>
        }
      >
        <form
          id="purchase-request-form"
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <div className="receipt-form-body">
              <label className="form-field">
                <span>Order status</span>
                <select
                  value={nextStatus}
                  onChange={(event) =>
                    setNextStatus(
                      event.target.value as UpdateOrderReceiptInput["status"],
                    )
                  }
                >
                  <option value="issued">Issued</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="partially_received">Partially received</option>
                  <option value="received">Received</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </label>
              <div className="receipt-items">
                {data.purchase_order_items.map((item) => (
                  <label key={item.id} className="receipt-item">
                    <span>
                      <strong>{item.description}</strong>
                      <small>Expected: {item.ordered_quantity}</small>
                    </span>
                    <input
                      type="number"
                      min="0"
                      max={item.ordered_quantity}
                      step="1"
                      required
                      value={receivedQuantities[item.id] ?? 0}
                      onChange={(event) =>
                        setReceivedQuantities((current) => ({
                          ...current,
                          [item.id]: Number(event.target.value),
                        }))
                      }
                    />
                  </label>
                ))}
              </div>
              {nextStatus === "received" && (
                <p className="receipt-notice">
                  Completing this order will post {money(data.total)} to the
                  linked department budget.
                </p>
              )}

            </div>
        </form>
      </Modal>
      )} */}
    </>
  );
}
