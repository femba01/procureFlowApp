import { useQuery } from "@tanstack/react-query";
import { Download, Filter, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getRequests } from "../api/api";
import StatusBadge from "../components/StatusBadge";
import { money } from "../utils/currency";
export default function RequestsPage() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { data = [] } = useQuery({
    queryKey: ["requests"],
    queryFn: getRequests,
  });
  const rows = useMemo(
    () =>
      data.filter((r) =>
        `${r.title} ${r.id} ${r.requester}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [data, query],
  );
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
        <div className="tabs">
          <button className="selected">
            All <span>{data.length}</span>
          </button>
          <button>My requests</button>
          <button>
            Pending approval <span>2</span>
          </button>
          <button>Completed</button>
        </div>
        <div className="table-wrap">
          <table>
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
              {rows.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => navigate(`/requests/${r.id}`)}
                  className="clickable-row"
                >
                  <td>
                    <strong>{r.title}</strong>
                    <small>
                      {r.id} · {r.items} items
                    </small>
                  </td>
                  <td>{r.requester}</td>
                  <td>{r.department}</td>
                  <td className="amount">{money(r.amount)}</td>
                  <td>
                    <StatusBadge status={r.status} />
                  </td>
                  <td>
                    <span className={`priority ${r.priority.toLowerCase()}`}>
                      {r.priority}
                    </span>
                  </td>
                  <td>{r.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
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
