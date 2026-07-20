import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, FileCheck2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createPurchaseOrder } from "../../api/purchaseOrdersApi";
import { getQuotationById } from "../../api/quotationsApi";
import { useAppStore } from "../../store/store";
import { money } from "../../utils/currency";

export default function GenerateOrderPage() {
  const { quotationId = "" } = useParams();
  const user = useAppStore((state) => state.user);
  const organizationId = user?.organization_id ?? "";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [address, setAddress] = useState("");
  const [date, setDate] = useState(() =>
    new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10),
  );
  const [notes, setNotes] = useState("");
  const { data: quote, isLoading, isError } = useQuery({
    queryKey: ["quotation", quotationId, organizationId],
    queryFn: () => getQuotationById(quotationId, organizationId),
    enabled: Boolean(quotationId && organizationId),
  });
  const mutation = useMutation({
    mutationFn: (input: {
      quotationId: string;
      deliveryAddress: string;
      expectedDelivery: string;
      notes?: string;
    }) => {
      if (!user) throw new Error("You must be signed in to issue an order");
      return createPurchaseOrder({
        ...input,
        organizationId: user.organization_id,
        actorId: user.id,
      });
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["orders", organizationId] });
      queryClient.invalidateQueries({ queryKey: ["auditLogs", organizationId] });
      navigate(`/orders/${order.id}`);
    },
  });

  if (isLoading) return <div className="detail-loading" />;
  if (isError || !quote) {
    return <div className="empty"><FileCheck2 /><h3>Selected quotation could not be loaded</h3></div>;
  }

  return (
    <>
      <div className="back-row">
        <Link to={`/quotations?requestId=${quote.request_id}`}><ArrowLeft size={17} /> Back to quotations</Link>
        <span>Selected quotation {quote.quotation_number}</span>
      </div>
      <section className="welcome"><div><h2>Generate purchase order</h2><p>Review the commercial terms before issuing this order.</p></div></section>
      <div className="generate-layout">
        <section className="panel po-document">
          <div className="po-doc-title">
            <div><span className="brand-mark"><FileCheck2 /></span><div><strong>PROCUREFLOW</strong><small>Procurement operations</small></div></div>
            <div><span>Purchase order</span><strong>PO-DRAFT</strong></div>
          </div>
          <div className="po-parties">
            <div><span>SUPPLIER</span><strong>{quote.supplier?.name || "Unknown supplier"}</strong><p>Approved supplier · {quote.supplier_id}</p></div>
            <div><span>REFERENCE</span><strong>{quote.purchase_request?.request_number || quote.request_id}</strong><p>Quotation {quote.quotation_number}</p></div>
          </div>
          <div className="po-terms">
            <div><span>Payment terms</span><strong>{quote.payment_terms}</strong></div>
            <div><span>Delivery timeline</span><strong>{quote.delivery_days} business days</strong></div>
            <div><span>Warranty</span><strong>{quote.warranty || "Not provided"}</strong></div>
          </div>
          <div className="po-total"><span>Purchase order total</span><strong>{money(quote.total)}</strong><small>Inclusive of delivery and applicable tax</small></div>
        </section>
        <aside className="panel issue-panel">
          <h3>Delivery instructions</h3>
          <label>Expected delivery date<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
          <label>Delivery address<textarea rows={4} value={address} onChange={(event) => setAddress(event.target.value)} /></label>
          <label>Notes to supplier<textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional handling or delivery notes" /></label>
          <div className="issue-note"><strong>When issued</strong><p>The purchase order will be saved with an Issued status.</p></div>
          <button
            className="primary-button full"
            disabled={!date || !address.trim() || mutation.isPending}
            onClick={() => mutation.mutate({ quotationId, deliveryAddress: address, expectedDelivery: date, notes })}
          >
            {mutation.isPending ? "Generating order..." : "Issue purchase order"}
          </button>
          {mutation.isError && <p className="mutation-error">{mutation.error.message}</p>}
        </aside>
      </div>
    </>
  );
}
