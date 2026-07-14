import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Download,
  FileBarChart,
  Filter,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { getAuditLogs, getSpendRecords } from "../api/api";
import type { SpendRecord } from "../types/types";
import { money } from "../utils/currency";
import { csvCell, downloadCsv } from "../utils/csv";
export default function ReportsPage() {
  const [tab, setTab] = useState<"spend" | "audit">("spend");
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("All");
  const { data: spend = [] } = useQuery({
    queryKey: ["spend-records"],
    queryFn: getSpendRecords,
  });
  const { data: logs = [] } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: getAuditLogs,
  });
  const rows = useMemo(
    () =>
      spend.filter(
        (r) =>
          (department === "All" || r.department === department) &&
          `${r.description} ${r.supplier} ${r.reference}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [spend, query, department],
  );
  const audit = useMemo(
    () =>
      logs.filter((log) =>
        `${log.description} ${log.actor} ${log.entityId}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [logs, query],
  );
  const exportCsv = () => {
    const source = rows;
    const header = [
      "Date",
      "Department",
      "Category",
      "Supplier",
      "Description",
      "Amount",
      "Type",
      "Reference",
    ];
    const lines = source.map((r) =>
      [
        r.date,
        r.department,
        r.category,
        r.supplier,
        r.description,
        r.amount,
        r.type,
        r.reference,
      ]
        .map(csvCell)
        .join(","),
    );
    downloadCsv(
      [header.join(","), ...lines].join("\n"),
      "procureflow-spend-report.csv",
    );
  };
  return (
    <>
      <section className="welcome">
        <div>
          <h2>Reports and audit</h2>
          <p>
            Analyse organisation-wide spend and review accountable system
            activity.
          </p>
        </div>
        {tab === "spend" && (
          <button className="primary-button" onClick={exportCsv}>
            <Download size={17} />
            Export CSV
          </button>
        )}
      </section>
      <div className="report-tabs">
        <button
          className={tab === "spend" ? "selected" : ""}
          onClick={() => setTab("spend")}
        >
          <FileBarChart />
          Spending report
        </button>
        <button
          className={tab === "audit" ? "selected" : ""}
          onClick={() => setTab("audit")}
        >
          <ShieldCheck />
          Audit log
        </button>
      </div>
      <div className="report-filters">
        <label className="search wide">
          <Search size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              tab === "spend"
                ? "Search spend records..."
                : "Search activity, actor or reference..."
            }
          />
        </label>
        {tab === "spend" && (
          <>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option>All</option>
              {[
                "Technology",
                "Operations",
                "Marketing",
                "Facilities",
                "People",
              ].map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
            <button className="secondary-button">
              <Filter size={16} />
              More filters
            </button>
          </>
        )}
      </div>
      {tab === "spend" ? (
        <SpendReport rows={rows} />
      ) : (
        <AuditReport logs={audit} />
      )}
    </>
  );
}
function SpendReport({ rows }: { rows: SpendRecord[] }) {
  const total = rows.reduce((a, r) => a + r.amount, 0);
  const largest = rows.length ? Math.max(...rows.map((r) => r.amount)) : 0;
  return (
    <>
      <section className="report-summary">
        <article>
          <span>Filtered spend</span>
          <strong>{money(total)}</strong>
          <small>{rows.length} transactions</small>
        </article>
        <article>
          <span>Average transaction</span>
          <strong>{money(rows.length ? total / rows.length : 0)}</strong>
          <small>Across current results</small>
        </article>
        <article>
          <span>Largest transaction</span>
          <strong>{money(largest)}</strong>
          <small>Requires enhanced approval</small>
        </article>
      </section>
      <article className="panel report-table">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Department</th>
                <th>Category</th>
                <th>Supplier</th>
                <th>Type</th>
                <th>Reference</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.date}</td>
                  <td>
                    <strong>{row.description}</strong>
                  </td>
                  <td>{row.department}</td>
                  <td>{row.category}</td>
                  <td>{row.supplier}</td>
                  <td>
                    <span className="record-type">{row.type}</span>
                  </td>
                  <td>{row.reference}</td>
                  <td className="amount">{money(row.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </>
  );
}
function AuditReport({
  logs,
}: {
  logs: Awaited<ReturnType<typeof getAuditLogs>>;
}) {
  return (
    <article className="panel audit-list">
      <div className="audit-header">
        <div>
          <Activity />
          <span>
            <strong>Organisation activity</strong>
            <small>{logs.length} matching events</small>
          </span>
        </div>
        <p>Events are chronological and retained for compliance review.</p>
      </div>
      {logs.map((log) => (
        <div className="audit-row" key={log.id}>
          <div className={`audit-icon ${log.action.toLowerCase()}`}>
            <Activity />
          </div>
          <div className="audit-description">
            <div>
              <span className={`audit-action ${log.action.toLowerCase()}`}>
                {log.action}
              </span>
              <strong>
                {log.entityType} · {log.entityId}
              </strong>
            </div>
            <p>{log.description}</p>
            <small>
              {log.actor} · {log.role}
            </small>
          </div>
          <div className="audit-meta">
            <span>{log.createdAt}</span>
            {log.metadata && <small>{log.metadata}</small>}
          </div>
        </div>
      ))}
    </article>
  );
}
