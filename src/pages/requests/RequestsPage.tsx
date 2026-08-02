import { useQuery } from "@tanstack/react-query";
import { Download, Filter, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import StatusBadge from "../../components/StatusBadge";
import { money } from "../../utils/currency";
import { useAppStore } from "../../store/store";
import { getPurchaseRequests } from "../../api/requestsApi";
import { DateTimeFormat } from "../../utils/datetimeFormat";
import type { PurchaseRequest } from "../../types/requests";
import type { TableColumn } from "../../components/ui/Table";
import Table from "../../components/ui/Table";

export default function RequestsPage() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"All" | "My" | "Pending approval" | "Approved" | "Completed">("All");

  const { user } = useAppStore();

  const { data: purchaseRequests } = useQuery({
    queryKey: ["purchaseRequests"],
    queryFn: () => getPurchaseRequests(user?.organization_id || "", user?.role == "Department Manager" ? user?.department_id : undefined, user?.role == "Employee" ? user?.id : undefined),
  });

  const rows = useMemo(
    () =>
      purchaseRequests && purchaseRequests.filter((r) => {
        const matchesSearch = `${r.title} ${r.id} ${r.requester} ${r.department} ${r.status} ${r.priority}`
          .toLowerCase()
          .includes(query.toLowerCase());

        if (!matchesSearch) return false;

        switch (activeTab) {
          case "All":
            return true;
          case "My":
            return r.requester_id === user?.id;
          case "Pending approval":
            return r.status === "Pending approval";
          case "Approved":
            return r.status === "Approved";
          case "Completed":
            return r.status === "Completed";
          default:
            return false;
        }
      }) || [],
    [purchaseRequests, query, activeTab, user?.id],
  );

  const requestTabs = useMemo(
    () => [
      {
        label: "All",
        value: "All" as const,
        count: purchaseRequests?.length ?? 0,
      },
      {
        label: "My requests",
        value: "My" as const,
        count:
          purchaseRequests?.filter(
            (request) => request.requester_id === user?.id,
          ).length ?? 0,
      },
      {
        label: "Pending approval",
        value: "Pending approval" as const,
        count:
          purchaseRequests?.filter(
            (request) => request.status === "Pending approval",
          ).length ?? 0,
      },
      {
        label: "Approved",
        value: "Approved" as const,
        count:
          purchaseRequests?.filter(
            (request) => request.status === "Approved",
          ).length ?? 0,
      },
      {
        label: "Completed",
        value: "Completed" as const,
        count:
          purchaseRequests?.filter(
            (request) => request.status === "Completed",
          ).length ?? 0,
      },
    ],
    [purchaseRequests, user?.id],
  );

  const columns: TableColumn<PurchaseRequest>[] = [
    {
      key: "id",
      header: "Request",
      render: (item) => (
        <p>
          <strong>{item.title}</strong>
          <small>
            {item.request_number}
          </small>
        </p>
      ),
    },
    {
      key: "requester",
      header: "Requested by",
      render: (item) => (
        <span>{item.requester}</span>
      )
    },
    {
      key: "department",
      header: "Department",
      render: (item) => (
        <span>{item.department}</span>
      )
    },
    {
      key: "estimated_total",
      header: "Amount",
      render: (item) => (
        <strong className="money">{money(item.estimated_total)}</strong>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <StatusBadge status={item.status} />
      ),
    },
    {
      key: "priority",
      header: "Priority",
      render: (item) => (
        <span className={`priority ${item.priority.toLowerCase()}`}>
          {item.priority}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Date",
      render: (item) => (
        DateTimeFormat(item.created_at, { dateStyle: "long" })
      )
      ,
    },
  ];

  return (
    <>
      <section className="welcome">
        <div>
          <h2>Purchase requests</h2>
          <p>Create, review and track requests across every department.</p>
        </div>
        <Link className="primary-button" to="/requests/new">
          <Plus size={18} />
          New request
        </Link>
      </section>
      <div className="request-toolbar">
        <label className="search wide">
          <Search size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by request, ID or requester..."
          />
        </label>
        <button className="secondary-button">
          <Filter size={17} />
          Filter
        </button>
        <button className="secondary-button">
          <Download size={17} />
          Export
        </button>
      </div>
      <Table
        data={rows}
        columns={columns}
        rowKey={(row) => row.id}
        onRowClick={(row) => navigate(`/requests/${row.id}`)}
        panelTitle={true}
        panelContent={
          <div className="tabs text-nowrap">
            {requestTabs.map((tab) => {
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${isActive
                      ? "border-blue-600 text-blue-600!"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800"
                    }`}
                >
                  {tab.label}

                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${isActive
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                      }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        }
        emptyMessage={
          <div className="empty">
            <Search />
            <h3>No requests found</h3>
            <p>Try a different search term.</p>
          </div>
        }
      />
    </>
  );
}
