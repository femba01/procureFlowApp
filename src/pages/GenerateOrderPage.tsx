import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, FileCheck2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { generateOrder, getQuotations } from "../api/api";
import { money } from "../utils/currency";
export default function GenerateOrderPage() {
  const { quotationId = "" } = useParams();
  const navigate = useNavigate();
  const client = useQueryClient();
  const [address, setAddress] = useState(
    "Acme HQ, 24 Adeola Odeku Street, Victoria Island, Lagos",
  );
  const [date, setDate] = useState("2026-07-18");
  const [notes, setNotes] = useState("");
  const { data = [] } = useQuery({
    queryKey: ["quotations", "PR-2026-084"],
    queryFn: () => getQuotations(),
  });
  const quote = data.find((q) => q.id === quotationId);
  const mutation = useMutation({
    mutationFn: generateOrder,
    onSuccess: (order) => {
      client.invalidateQueries({ queryKey: ["orders"] });
      navigate(`/orders/${order.id}`);
    },
  });
  if (!quote) return <div className="detail-loading" />;
  return (
    <>
      <div className="back-row">
        <Link to="/quotations">
          <ArrowLeft size={17} />
          Back to quotations
        </Link>
        <span>Selected quotation {quote.id}</span>
      </div>
      <section className="welcome">
        <div>
          <h2>Generate purchase order</h2>
          <p>Review the commercial terms before issuing this order.</p>
        </div>
      </section>
      <div className="generate-layout">
        <section className="panel po-document">
          <div className="po-doc-title">
            <div>
              <span className="brand-mark">
                <FileCheck2 />
              </span>
              <div>
                <strong>ACME CORPORATION</strong>
                <small>Procurement operations</small>
              </div>
            </div>
            <div>
              <span>Purchase order</span>
              <strong>PO-DRAFT</strong>
            </div>
          </div>
          <div className="po-parties">
            <div>
              <span>SUPPLIER</span>
              <strong>{quote.supplierName}</strong>
              <p>Approved supplier · {quote.supplierId}</p>
            </div>
            <div>
              <span>REFERENCE</span>
              <strong>{quote.requestId}</strong>
              <p>Quotation {quote.id}</p>
            </div>
          </div>
          <div className="po-terms">
            <div>
              <span>Payment terms</span>
              <strong>{quote.paymentTerms}</strong>
            </div>
            <div>
              <span>Delivery timeline</span>
              <strong>{quote.deliveryDays} business days</strong>
            </div>
            <div>
              <span>Warranty</span>
              <strong>{quote.warranty}</strong>
            </div>
          </div>
          <div className="po-total">
            <span>Purchase order total</span>
            <strong>{money(quote.total)}</strong>
            <small>Inclusive of delivery and applicable tax</small>
          </div>
        </section>
        <aside className="panel issue-panel">
          <h3>Delivery instructions</h3>
          <label>
            Expected delivery date
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label>
            Delivery address
            <textarea
              rows={4}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </label>
          <label>
            Notes to supplier
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional handling or delivery notes"
            />
          </label>
          <div className="issue-note">
            <strong>When issued</strong>
            <p>
              The supplier will receive this purchase order and the status will
              move to “Issued”.
            </p>
          </div>
          <button
            className="primary-button full"
            disabled={!date || !address || mutation.isPending}
            onClick={() =>
              mutation.mutate({
                quotationId,
                deliveryAddress: address,
                expectedDelivery: date,
                notes,
              })
            }
          >
            {mutation.isPending
              ? "Generating order..."
              : "Issue purchase order"}
          </button>
          {mutation.isError && (
            <p className="mutation-error">{mutation.error.message}</p>
          )}
        </aside>
      </div>
    </>
  );
}
