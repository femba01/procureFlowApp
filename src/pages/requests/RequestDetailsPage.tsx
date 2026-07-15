import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  MessageSquare,
  Package,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getRequest, updateRequestStatus } from "../../api/api";
import DetailField from "../../components/DetailField";
import StatusBadge from "../../components/StatusBadge";
import { money } from "../../utils/currency";
export default function RequestDetailsPage() {
  const { requestId = "" } = useParams();
  const client = useQueryClient();
  const [comment, setComment] = useState("");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["request", requestId],
    queryFn: () => getRequest(requestId),
  });
  const mutation = useMutation({
    mutationFn: updateRequestStatus,
    onSuccess: (value) => {
      client.setQueryData(["request", requestId], value);
      client.invalidateQueries({ queryKey: ["requests"] });
      client.invalidateQueries({ queryKey: ["dashboard"] });
      setComment("");
    },
  });
  if (isLoading) return <div className="detail-loading" />;
  if (isError || !data)
    return (
      <div className="empty">
        <Package />
        <h3>Request not found</h3>
        <Link to="/requests">Return to requests</Link>
      </div>
    );
  return (
    <>
      <div className="back-row">
        <Link to="/requests">
          <ArrowLeft size={17} />
          Back to requests
        </Link>
        <span>Last updated just now</span>
      </div>
      <section className="request-hero">
        <div>
          <div className="request-id">
            <span>{data.id}</span>
            <StatusBadge status={data.status} />
          </div>
          <h2>{data.title}</h2>
          <p>
            Requested by {data.requester} · {data.department}
          </p>
        </div>
        {data.status === "Pending approval" && (
          <div className="approval-actions">
            <button
              className="reject-button"
              disabled={mutation.isPending}
              onClick={() =>
                mutation.mutate({ id: data.id, status: "Rejected", comment })
              }
            >
              <X size={17} />
              Reject
            </button>
            <button
              className="approve-button"
              disabled={mutation.isPending}
              onClick={() =>
                mutation.mutate({ id: data.id, status: "Approved", comment })
              }
            >
              <Check size={17} />
              Approve request
            </button>
          </div>
        )}
      </section>
      <div className="detail-layout">
        <div>
          <section className="panel detail-panel">
            <h3>Request overview</h3>
            <div className="overview-grid">
              <DetailField
                className="info"
                label="Total value"
                value={money(data.estimated_total)}
              />
              <DetailField
                className="info"
                label="Priority"
                value={data.priority}
              />
              <DetailField
                className="info"
                label="Needed by"
                value={data.needed_by ? new Date(data.needed_by).toLocaleDateString() : "N/A"}
              />
              <DetailField
                className="info"
                label="Cost centre"
                value={data.costCentre}
              />
              <DetailField
                className="info"
                label="Preferred vendor"
                value={data.vendorPreference || "No preference"}
              />
              <DetailField
                className="info"
                label="Department"
                value={data.department}
              />
            </div>
            <div className="reason">
              <span>Business justification</span>
              <p>{data.businessReason}</p>
            </div>
          </section>
          <section className="panel detail-panel">
            <div className="detail-title">
              <div>
                <h3>Requested items</h3>
                <p>{data.lineItems.length} line items</p>
              </div>
              <strong>{money(data.estimated_total)}</strong>
            </div>
            <div className="detail-items">
              {data.lineItems.map((item) => (
                <div key={item.id}>
                  <div className="item-icon">
                    <Package size={18} />
                  </div>
                  <div>
                    <strong>{item.description}</strong>
                    <small>{item.category}</small>
                  </div>
                  <span>
                    {item.quantity} × {money(item.unitPrice)}
                  </span>
                  <b>{money(item.quantity * item.unitPrice)}</b>
                </div>
              ))}
            </div>
          </section>
        </div>
        <aside>
          <section className="panel timeline-panel">
            <h3>Activity timeline</h3>
            {data.timeline.map((event, index) => (
              <div className="timeline-event" key={event.id}>
                <div className="timeline-marker">
                  {event.type === "approved" ? (
                    <CheckCircle2 />
                  ) : event.type === "rejected" ? (
                    <X />
                  ) : index === 0 ? (
                    <Clock3 />
                  ) : (
                    <Circle />
                  )}
                </div>
                <div>
                  <strong>{event.title}</strong>
                  <p>{event.description}</p>
                  <small>
                    {event.actor} · {event.createdAt}
                  </small>
                </div>
              </div>
            ))}
          </section>
          {data.status === "Pending approval" && (
            <section className="panel comment-panel">
              <label>
                <MessageSquare size={17} />
                Approval note
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Add a reason or note for the requester..."
              />
              <p>This note will appear in the audit timeline.</p>
            </section>
          )}
        </aside>
      </div>
    </>
  );
}
