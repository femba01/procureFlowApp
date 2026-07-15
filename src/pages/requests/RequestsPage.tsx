import { useQuery } from "@tanstack/react-query";
import { Download, Filter, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import StatusBadge from "../../components/StatusBadge";
import { money } from "../../utils/currency";
import { useAppStore } from "../../store/store";
import { getPurchaseRequests } from "../../api/requestsApi";
import { DateTimeFormat } from "../../utils/datetimeFormat";
import ClientPagination from "../../components/clientPagination";

export default function RequestsPage() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"All" | "My" | "Pending approval" | "Approved" | "Completed">("All");

  const { user } = useAppStore();

  const { data: purchaseRequests } = useQuery({
    queryKey: ["purchaseRequests"],
    queryFn: () => getPurchaseRequests(user?.organization_id || ""),
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

  const [currentPage, setCurrentPage] = useState(0);

  const itemsPerPage = 10;
  const pageCount = Math.ceil((rows && rows.length / itemsPerPage));
  const startIndex = currentPage * itemsPerPage;

  const currentUsers = rows.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handlePageChange = ({
    selected,
  }: {
    selected: number;
  }) => {
    setCurrentPage(selected);
  };

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
      <article className="panel requests-panel">
        <div className="tabs text-nowrap">
          <button type="button" onClick={() => setActiveTab("All")} className={activeTab === "All" ? "selected" : ""}>
            All <span>{purchaseRequests?.length}</span>
          </button>
          <button type="button" onClick={() => setActiveTab("My")} className={activeTab === "My" ? "selected" : ""}>
            My requests <span>{purchaseRequests && purchaseRequests?.filter(item => item.requester_id === user?.id).length}</span>
          </button>
          <button type="button" onClick={() => setActiveTab("Pending approval")} className={activeTab === "Pending approval" ? "selected" : ""}>
            Pending approval <span>{purchaseRequests && purchaseRequests?.filter(item => item.status === "Pending approval").length}</span>
          </button>
          <button type="button" onClick={() => setActiveTab("Approved")} className={activeTab === "Approved" ? "selected" : ""}>
            Approved <span>{purchaseRequests && purchaseRequests?.filter(item => item.status === "Approved").length}</span>
          </button>
          <button type="button" onClick={() => setActiveTab("Completed")} className={activeTab === "Completed" ? "selected" : ""}>
            Completed <span>{purchaseRequests && purchaseRequests?.filter(item => item.status === "Completed").length}</span>
          </button>
        </div>
        <div className="table-wrap">
          {rows && <div>
            <table className="text-nowrap">
            <thead>
              <tr>
                <th>Request</th>
                <th>Requested by</th>
                <th>Department</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers?.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => navigate(`/requests/${r.id}`)}
                  className="clickable-row"
                >
                  <td>
                    <strong>{r.title}</strong>
                    <small>
                      {r.request_number}
                    </small>
                  </td>
                  <td>{r.requester}</td>
                  <td>{r.department}</td>
                  <td className="amount">{money(r.estimated_total)}</td>
                  <td>
                    <StatusBadge status={r.status} />
                  </td>
                  <td>
                    <span className={`priority ${r.priority.toLowerCase()}`}>
                      {r.priority}
                    </span>
                  </td>
                  <td>{DateTimeFormat(r.created_at, { dateStyle: "long" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {pageCount > 1 && (
          <ClientPagination
            pageCount={pageCount}
            handlePageChange={handlePageChange}
          />)}
          </div>}
          {rows && rows.length === 0 && (
            <div className="empty">
              <Search />
              <h3>No requests found</h3>
              <p>Try a different search term.</p>
            </div>
          )}
        </div>
      </article>
    </>
  );
}
