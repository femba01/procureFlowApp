import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Circle, Clock3, MessageSquare, Package, X } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getPurchaseRequestDetails } from "../../api/requestsApi";
import DetailField from "../../components/DetailField";
import StatusBadge from "../../components/StatusBadge";
import type { RequestStatus } from "../../types/requests";
import { money } from "../../utils/currency";
import { useState } from "react";
import { getAuditLogs } from "../../api/auditLogsApi";
import { DateTimeFormat } from "../../utils/datetimeFormat";
import { useAppStore } from "../../store/store";

const displayStatus = (status: string) =>
  status
    .replaceAll("_", " ")
    .replace(/^./, (letter) => letter.toUpperCase());

export default function RequestDetailsPage() {
  const { requestId = "" } = useParams();
  const {user} = useAppStore();
  const [comment, setComment] = useState("");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["request", requestId],
    queryFn: () => getPurchaseRequestDetails(requestId),
    enabled: Boolean(requestId),
  });

  const {data: auditLogs} = useQuery({
    queryKey: ["auditLogs"],
    queryFn: () => getAuditLogs("Purchase request"),
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
        <span>Created {new Date(data.created_at).toLocaleString()}</span>
      </div>
      <section className="request-hero">
        <div>
          <div className="request-id">
            <span>{data.request_number}</span>
            <StatusBadge status={displayStatus(data.status) as RequestStatus} />
          </div>
          <h2>{data.title}</h2>
          <p>
            Requested by{" "}
            {data.requester_profile?.name || data.requester || "Unknown requester"} ·{" "}
            {data.department_record?.name ||
              data.department ||
              "Unknown department"}
          </p>
        </div>
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
                value={displayStatus(data.priority)}
              />
              <DetailField
                className="info"
                label="Needed by"
                value={new Date(data.needed_by).toLocaleDateString()}
              />
              <DetailField
                className="info"
                label="Cost centre"
                value={data.cost_centre}
              />
              <DetailField
                className="info"
                label="Preferred vendor"
                value={data.preferred_supplier?.name || "No preference"}
              />
              <DetailField
                className="info"
                label="Department"
                value={
                  data.department_record?.name || data.department || "Not available"
                }
              />
            </div>
            <div className="reason">
              <span>Business justification</span>
              <p>{data.business_reason}</p>
            </div>
          </section>
          <section className="panel detail-panel">
            <div className="detail-title">
              <div>
                <h3>Requested items</h3>
                <p>{data.request_items.length} line items</p>
              </div>
              <strong>{money(data.estimated_total)}</strong>
            </div>
            <div className="detail-items">
              {data.request_items.map((item) => (
                <div key={item.id}>
                  <div className="item-icon">
                    <Package size={18} />
                  </div>
                  <div>
                    <strong>{item.description}</strong>
                    <small>{item.category}</small>
                  </div>
                  <span>
                    {item.quantity} × {money(item.unit_price)}
                  </span>
                  <b>{money(item.quantity * item.unit_price)}</b>
                </div>
              ))}
              {data.request_items.length === 0 && (
                <div className="empty">
                  <Package />
                  <p>No request items were found.</p>
                </div>
              )}
            </div>
          </section>
        </div>
        <aside>
          <section className="panel timeline-panel">
            <h3>Activity timeline</h3>
            {auditLogs && auditLogs.map((event, index) => (
              <div className="timeline-event" key={event.id}>
                <div className="timeline-marker">
                  {event.action === "Approved" ? (
                    <CheckCircle2 />
                  ) : event.action === "Rejected" ? (
                    <X />
                  ) : index === 0 ? (
                    <Clock3 />
                  ) : (
                    <Circle />
                  )}
                </div>
                <div>
                  <strong>{event.action}</strong>
                  <p>{event.description}</p>
                  <small>
                    Requested by: <b>{data?.requester}</b> · {DateTimeFormat(event.created_at)}
                  </small>
                </div>
              </div>
            ))}
          </section>
          {user?.role !== "Employee" && data.status === "Pending approval" && (
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
