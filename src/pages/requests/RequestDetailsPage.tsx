import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  MessageSquare,
  Package,
  Pencil,
  X,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import {
  decidePurchaseRequest,
  getApprovalEvents,
  getPurchaseRequestDetails,
  type ApprovalAction,
  type ApprovalStage,
} from "../../api/requestsApi";
import DetailField from "../../components/DetailField";
import StatusBadge from "../../components/StatusBadge";
import type { RequestStatus } from "../../types/requests";
import { money } from "../../utils/currency";
import { useState } from "react";
import { getAuditLogs } from "../../api/auditLogsApi";
import { DateTimeFormat } from "../../utils/datetimeFormat";
import { useAppStore } from "../../store/store";

const displayStatus = (status: string) =>
  status.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());

const approvalStageForRole = (
  role: string | undefined,
): ApprovalStage | null => {
  if (role === "Department Manager") return "manager";
  if (role === "Finance Officer") return "finance";
  if (role === "Administrator" || role === "Procurement Officer")
    return "executive";
  return null;
};

export default function RequestDetailsPage() {
  const { requestId = "" } = useParams();
  const { user } = useAppStore();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["request", requestId],
    queryFn: () => getPurchaseRequestDetails(requestId),
    enabled: Boolean(requestId),
  });

  const mutation = useMutation({
    mutationFn: (action: Exclude<ApprovalAction, "commented">) => {
      const stage = approvalStageForRole(user?.role);
      if (!user || !stage)
        throw new Error("You are not allowed to approve requests.");
      return decidePurchaseRequest({
        requestId,
        organizationId: user.organization_id,
        approverId: user.id,
        stage,
        action,
        comment,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["request", requestId] });
      queryClient.invalidateQueries({ queryKey: ["purchaseRequests"] });
      queryClient.invalidateQueries({
        queryKey: ["approvalEvents", requestId],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setComment("");
    },
  });

  const { data: approvalEvents = [] } = useQuery({
    queryKey: ["approvalEvents", requestId],
    queryFn: () => getApprovalEvents(requestId),
    enabled: Boolean(requestId),
  });

  const { data: auditLogs } = useQuery({
    queryKey: [
      "auditLogs",
      user?.organization_id,
      "Purchase request",
      requestId,
    ],
    queryFn: () =>
      getAuditLogs({
        organizationId: user!.organization_id,
        entityType: "Purchase request",
        entityId: requestId,
      }),
    enabled: Boolean(user?.organization_id && requestId),
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

  const timelineEvents = [
    ...approvalEvents.map((event) => ({
      id: `approval-${event.id}`,
      action: displayStatus(event.action),
      description:
        event.comment ||
        `Request ${event.action} at the ${event.stage} approval stage.`,
      actor: event.approver?.name || "Approver",
      role: event.approver?.role || displayStatus(event.stage),
      createdAt: event.created_at,
    })),
    ...(auditLogs ?? []).map((event) => ({
      id: `audit-${event.id}`,
      action: event.action,
      description: event.description,
      actor: data.requester || "System",
      role: "",
      createdAt: event.created_at,
    })),
  ].sort(
    (first, second) =>
      new Date(second.createdAt).getTime() -
      new Date(first.createdAt).getTime(),
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
            {data.requester_profile?.name ||
              data.requester ||
              "Unknown requester"}{" "}
            ·{" "}
            {data.department_record?.name ||
              data.department ||
              "Unknown department"}
          </p>
        </div>
        <div className="flex gap-2">
          {data.status.toLowerCase() === "draft" &&
            (data.requester_id === user?.id || user?.role !== "Employee") && (
              <Link
                className="secondary-button"
                to={`/requests/${data.id}/edit`}
              >
                <Pencil size={17} />
                Edit request
              </Link>
            )}
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
                className="info leading-4"
                label="Preferred vendor"
                value={data.preferred_supplier?.name || "No preference"}
              />
              <DetailField
                className="info"
                label="Department"
                value={
                  data.department_record?.name ||
                  data.department ||
                  "Not available"
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
            {timelineEvents.map((event, index) => (
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
                <div className="leading-4">
                  <strong>Request {event.action}</strong>
                  <p>{event.description}</p>
                  <small>
                    <b>{event.actor}</b>
                    {event.role ? ` · ${event.role}` : ""} ·{" "}
                    {DateTimeFormat(event.createdAt)}
                  </small>
                </div>
              </div>
            ))}
          </section>
          {approvalStageForRole(user?.role) &&
            (data.status === "Pending approval" || data.status === "Draft") && (
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
                {(data.status === "Pending approval" ||
                  data.status === "Draft") && (
                  <div className="approval-actions py-4">
                    <button
                      className="reject-button"
                      disabled={mutation.isPending}
                      onClick={() => mutation.mutate("rejected")}
                    >
                      <X size={17} />
                      Reject Request
                    </button>
                    <button
                      className="approve-button"
                      disabled={mutation.isPending}
                      onClick={() => mutation.mutate("approved")}
                    >
                      <Check size={17} />
                      Approve request
                    </button>
                  </div>
                )}
                {mutation.isError && (
                  <p className="mutation-error" role="alert">
                    {mutation.error.message}
                  </p>
                )}
              </section>
            )}
        </aside>
      </div>
    </>
  );
}
