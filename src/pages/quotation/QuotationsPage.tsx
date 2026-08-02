import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Award,
  Check,
  Clock3,
  Copy,
  MailPlus,
  ShieldCheck,
  Truck,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  createQuotationInvitation,
  getQuotationInvitations,
  getQuotations,
  selectQuotation,
} from "../../api/quotationsApi";
import { getPurchaseRequests } from "../../api/requestsApi";
import { getSupplierOptions } from "../../api/suppliersApi";
import { useAppStore } from "../../store/store";
import Table, { type TableColumn } from "../../components/ui/Table";

const formatMoney = (value: number, currency = "NGN") =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency.trim(),
    maximumFractionDigits: 2,
  }).format(value || 0);

const dateTimeInputValue = () => {
  const date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
};

export default function QuotationsPage() {
  const user = useAppStore((state) => state.user);
  const organizationId = user?.organization_id ?? "";
  const [params, setParams] = useSearchParams();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [expiresAt, setExpiresAt] = useState(dateTimeInputValue);
  const [invitationUrl, setInvitationUrl] = useState("");
  const queryClient = useQueryClient();

  const requestsQuery = useQuery({
    queryKey: ["requests", organizationId, "quotation-options"],
    queryFn: () => getPurchaseRequests(organizationId),
    enabled: Boolean(organizationId),
  });
  const requests = requestsQuery.data ?? [];
  const requestId = params.get("requestId") || requests[0]?.id || "";
  const activeRequest = requests.find((request) => request.id === requestId);
  const quotationsQuery = useQuery({
    queryKey: ["quotations", organizationId, requestId],
    queryFn: () => getQuotations(organizationId, requestId),
    enabled: Boolean(organizationId && requestId),
  });
  const invitationsQuery = useQuery({
    queryKey: ["quotation-invitations", organizationId, requestId],
    queryFn: () => getQuotationInvitations(organizationId, requestId),
    enabled: Boolean(organizationId && requestId),
  });
  const suppliersQuery = useQuery({
    queryKey: ["supplier-options", organizationId],
    queryFn: () => getSupplierOptions(organizationId),
    enabled: Boolean(organizationId && inviteOpen),
  });
  const quotations = quotationsQuery.data ?? [];
  const lowest = quotations.length
    ? Math.min(...quotations.map((quotation) => quotation.total))
    : 0;
  const fastest = quotations.length
    ? Math.min(...quotations.map((quotation) => quotation.delivery_days))
    : 0;
  const selectedExists = quotations.some(
    (quotation) => quotation.status === "selected",
  );
  const itemCount = new Set(
    quotations.flatMap((quotation) =>
      quotation.quotation_items.map((item) => item.request_item_id),
    ),
  ).size;
  const comparisonRows = [
    {
      id: "total",
      label: "Total price",
      values: quotations.map((q) => formatMoney(q.total, q.currency)),
      best: quotations.findIndex((q) => q.total === lowest),
    },
    {
      id: "delivery",
      label: "Delivery timeline",
      values: quotations.map((q) => `${q.delivery_days} business days`),
      best: quotations.findIndex((q) => q.delivery_days === fastest),
    },
    {
      id: "payment",
      label: "Payment terms",
      values: quotations.map((q) => q.payment_terms),
      best: -1,
    },
    {
      id: "warranty",
      label: "Warranty",
      values: quotations.map((q) => q.warranty || "Not provided"),
      best: -1,
    },
    {
      id: "technical",
      label: "Technical score",
      values: quotations.map((q) => `${q.technical_score}/100`),
      best: quotations.findIndex(
        (q) =>
          q.technical_score ===
          Math.max(...quotations.map((item) => item.technical_score)),
      ),
    },
  ];
  type ComparisonRow = (typeof comparisonRows)[number];
  const comparisonColumns: TableColumn<ComparisonRow>[] = [
    {
      key: "label",
      header: "Evaluation factor",
      render: (row) => <strong>{row.label}</strong>,
    },
    ...quotations.map((quotation, index) => ({
      key: quotation.id,
      header: quotation.supplier?.name || "Unknown supplier",
      cellClassName: (row: ComparisonRow) =>
        row.best === index ? "best-value" : "",
      render: (row: ComparisonRow) => (
        <>
          {row.values[index]}
          {row.best === index && <span>Best</span>}
        </>
      ),
    })),
  ];

  const selectMutation = useMutation({
    mutationFn: (quotationId: string) => {
      if (!user) throw new Error("You must be signed in to select a quotation");
      return selectQuotation({
        quotationId,
        organizationId: user.organization_id,
        actorId: user.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["quotations", organizationId, requestId],
      });
      queryClient.invalidateQueries({
        queryKey: ["auditLogs", organizationId],
      });
    },
  });
  const inviteMutation = useMutation({
    mutationFn: () => {
      if (!user || !requestId || !supplierId) {
        throw new Error("Select a request and supplier");
      }
      return createQuotationInvitation({
        requestId,
        supplierId,
        expiresAt: new Date(expiresAt).toISOString(),
        organizationId: user.organization_id,
        actorId: user.id,
      });
    },
    onSuccess: ({ token }) => {
      setInvitationUrl(
        `${window.location.origin}/supplier/quotation?token=${encodeURIComponent(token)}`,
      );
      queryClient.invalidateQueries({
        queryKey: ["quotation-invitations", organizationId, requestId],
      });
      queryClient.invalidateQueries({
        queryKey: ["auditLogs", organizationId],
      });
    },
  });

  if (requestsQuery.isLoading) return <div className="detail-loading" />;
  if (requestsQuery.isError) {
    return (
      <div className="empty">
        <Award />
        <h3>Requests could not be loaded</h3>
      </div>
    );
  }

  return (
    <>
      <div className="back-row">
        <Link to={requestId ? `/requests/${requestId}` : "/requests"}>
          <ArrowLeft size={17} /> Back to request
        </Link>
        <span>
          {activeRequest?.request_number || "Select a purchase request"}
        </span>
      </div>
      <section className="welcome quotation-heading">
        <div>
          <h2>Compare supplier quotations</h2>
          <p>
            {activeRequest?.title || "Choose a request"} · {itemCount} items ·{" "}
            {quotations.length} responses received
          </p>
        </div>
        <div className="quotation-actions">
          <select
            className="period-select"
            value={requestId}
            onChange={(event) => setParams({ requestId: event.target.value })}
          >
            {requests.length === 0 && (
              <option value="">No requests available</option>
            )}
            {requests.map((request) => (
              <option key={request.id} value={request.id}>
                {request.request_number} — {request.title}
              </option>
            ))}
          </select>
          <button
            className="primary-button"
            disabled={!requestId}
            onClick={() => {
              setInvitationUrl("");
              setInviteOpen(true);
            }}
          >
            <MailPlus size={16} /> Invite supplier
          </button>
        </div>
      </section>

      {invitationsQuery.data && invitationsQuery.data.length > 0 && (
        <section className="invitation-strip">
          {invitationsQuery.data.map((invitation) => (
            <span key={invitation.id}>
              {invitation.supplier?.name || "Supplier"}
              <b className={invitation.status}>{invitation.status}</b>
            </span>
          ))}
        </section>
      )}

      {quotationsQuery.isLoading ? (
        <div className="detail-loading" />
      ) : quotationsQuery.isError ? (
        <div className="empty">
          <Award />
          <h3>Quotations could not be loaded</h3>
        </div>
      ) : quotations.length === 0 ? (
        <div className="empty">
          <MailPlus />
          <h3>No quotations received</h3>
          <p>Invite suppliers to submit quotations for this request.</p>
        </div>
      ) : (
        <>
          <div className="quote-grid">
            {quotations.map((quotation) => (
              <article
                className={`quote-card panel ${quotation.total === lowest ? "recommended" : ""} ${quotation.status}`}
                key={quotation.id}
              >
                {quotation.total === lowest && (
                  <div className="recommendation">
                    <Award size={14} /> Recommended
                  </div>
                )}
                <div className="quote-supplier">
                  <div className="quote-logo">
                    {(quotation.supplier?.name || "Supplier")
                      .split(" ")
                      .slice(0, 2)
                      .map((word) => word[0])
                      .join("")}
                  </div>
                  <div>
                    <h3>{quotation.supplier?.name || "Unknown supplier"}</h3>
                    <span>
                      {quotation.quotation_number} · Valid until{" "}
                      {new Date(quotation.valid_until).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="quote-price">
                  <span>Total quotation</span>
                  <strong>
                    {formatMoney(quotation.total, quotation.currency)}
                  </strong>
                  <small>
                    {formatMoney(quotation.subtotal, quotation.currency)} before
                    fees and tax
                  </small>
                </div>
                <div className="quote-metrics">
                  <div>
                    <Truck />
                    <span>
                      Delivery
                      <strong>{quotation.delivery_days} business days</strong>
                    </span>
                    {quotation.delivery_days === fastest && <b>Fastest</b>}
                  </div>
                  <div>
                    <Clock3 />
                    <span>
                      Payment terms<strong>{quotation.payment_terms}</strong>
                    </span>
                  </div>
                  <div>
                    <ShieldCheck />
                    <span>
                      Warranty
                      <strong>{quotation.warranty || "Not provided"}</strong>
                    </span>
                  </div>
                  <div>
                    <Award />
                    <span>
                      Technical score
                      <strong>{quotation.technical_score}/100</strong>
                    </span>
                  </div>
                </div>
                <div className="cost-breakdown">
                  <div>
                    <span>Items subtotal</span>
                    <strong>
                      {formatMoney(quotation.subtotal, quotation.currency)}
                    </strong>
                  </div>
                  <div>
                    <span>Delivery fee</span>
                    <strong>
                      {quotation.delivery_fee
                        ? formatMoney(
                            quotation.delivery_fee,
                            quotation.currency,
                          )
                        : "Included"}
                    </strong>
                  </div>
                  <div>
                    <span>Tax</span>
                    <strong>
                      {formatMoney(quotation.tax, quotation.currency)}
                    </strong>
                  </div>
                </div>
                {quotation.status === "selected" ? (
                  <Link
                    className="selected-quote"
                    to={`/orders/generate/${quotation.id}`}
                  >
                    <Check /> Generate purchase order
                  </Link>
                ) : quotation.status === "declined" || selectedExists ? (
                  <button className="declined-quote" disabled>
                    Not selected
                  </button>
                ) : (
                  <button
                    className="select-quote"
                    disabled={selectMutation.isPending}
                    onClick={() => selectMutation.mutate(quotation.id)}
                  >
                    Select this quotation
                  </button>
                )}
              </article>
            ))}
          </div>
          {selectMutation.isError && (
            <p className="mutation-error">{selectMutation.error.message}</p>
          )}
          <Table
            className="comparison-table"
            tableClassName=""
            data={comparisonRows}
            columns={comparisonColumns}
            rowKey={(row) => row.id}
            panelTitle
            panelContent={
              <div className="panel-title">
                <div>
                  <h3>Commercial comparison</h3>
                  <p>Normalised view of every supplier response</p>
                </div>
              </div>
            }
          />
        </>
      )}

      {inviteOpen && (
        <div className="modal-layer">
          <button
            className="modal-backdrop"
            aria-label="Close invitation form"
            onClick={() => setInviteOpen(false)}
          />
          <form
            className="supplier-modal"
            onSubmit={(event) => {
              event.preventDefault();
              inviteMutation.mutate();
            }}
          >
            <div className="modal-title">
              <div>
                <span>
                  <MailPlus />
                </span>
                <div>
                  <h3>Invite supplier</h3>
                  <p>Create a secure quotation submission link.</p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setInviteOpen(false)}
              >
                <X />
              </button>
            </div>
            <div className="modal-grid">
              <label className="form-field">
                <span>Supplier</span>
                <select
                  required
                  value={supplierId}
                  onChange={(event) => setSupplierId(event.target.value)}
                >
                  <option value="">Select supplier</option>
                  {(suppliersQuery.data ?? []).map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-field">
                <span>Invitation expires</span>
                <input
                  required
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(event) => setExpiresAt(event.target.value)}
                />
              </label>
              {invitationUrl && (
                <label className="form-field wide">
                  <span>Secure invitation link</span>
                  <div className="invitation-link">
                    <input readOnly value={invitationUrl} />
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() =>
                        navigator.clipboard.writeText(invitationUrl)
                      }
                    >
                      <Copy size={15} /> Copy
                    </button>
                  </div>
                </label>
              )}
            </div>
            {inviteMutation.isError && (
              <p className="mutation-error">{inviteMutation.error.message}</p>
            )}
            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setInviteOpen(false)}
              >
                Close
              </button>
              <button
                className="primary-button"
                disabled={inviteMutation.isPending}
              >
                {inviteMutation.isPending
                  ? "Creating invitation..."
                  : invitationUrl
                    ? "Create new link"
                    : "Create invitation"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
