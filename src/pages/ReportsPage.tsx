import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Download,
  FileBarChart,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { getAuditLogs } from "../api/auditLogsApi";
import { getDepartments } from "../api/departmentsApi";
import { getSpendRecords, type SpendRecordReport } from "../api/reportsApi";
import { useAppStore } from "../store/store";
import type { AuditLogRecord } from "../types/audit";
import { csvCell, downloadCsv } from "../utils/csv";
import { money } from "../utils/currency";
import { DateTimeFormat } from "../utils/datetimeFormat";

const displayValue = (value: string) =>
  value
    .replaceAll("_", " ")
    .replace(/^./, (letter) => letter.toUpperCase());

export default function ReportsPage() {
  const [tab, setTab] = useState<"spend" | "audit">("spend");
  const [query, setQuery] = useState("");
  const [departmentId, setDepartmentId] = useState("All");
  const organizationId = useAppStore((state) => state.user?.organization_id ?? "");
  const spendQuery = useQuery({
    queryKey: ["spend-records", organizationId],
    queryFn: () => getSpendRecords(organizationId),
    enabled: Boolean(organizationId),
  });
  const auditQuery = useQuery({
    queryKey: ["auditLogs", organizationId],
    queryFn: () => getAuditLogs({ organizationId }),
    enabled: Boolean(organizationId),
  });
  const { data: departments = [] } = useQuery({
    queryKey: ["departments", organizationId],
    queryFn: () => getDepartments(organizationId),
    enabled: Boolean(organizationId),
  });
  const spendRows = useMemo(
    () =>
      (spendQuery.data || []).filter(
        (record) =>
          (departmentId === "All" || record.department_id === departmentId) &&
          `${record.description} ${record.supplier?.name || ""} ${record.reference} ${record.category}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [departmentId, query, spendQuery.data],
  );
  const auditRows = useMemo(
    () =>
      (auditQuery.data || []).filter((log) =>
        `${log.description} ${log.actor?.name || ""} ${log.action} ${log.entity_type} ${log.entity_id || ""}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [auditQuery.data, query],
  );

  const exportCsv = () => {
    const header = [
      "Date",
      "Department",
      "Category",
      "Supplier",
      "Description",
      "Amount",
      "Currency",
      "Type",
      "Reference",
    ];
    const lines = spendRows.map((record) =>
      [
        record.spent_on,
        record.department?.name || "",
        record.category,
        record.supplier?.name || "",
        record.description,
        record.amount,
        record.currency.trim(),
        displayValue(record.spend_type),
        record.reference,
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
          <p>Analyse organisation-wide spend and review accountable system activity.</p>
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
          <FileBarChart /> Spending report
        </button>
        <button
          className={tab === "audit" ? "selected" : ""}
          onClick={() => setTab("audit")}
        >
          <ShieldCheck /> Audit log
        </button>
      </div>
      <div className="report-filters">
        <label className="search wide">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={
              tab === "spend"
                ? "Search spend records..."
                : "Search activity, actor or reference..."
            }
          />
        </label>
        {tab === "spend" && (
          <select
            value={departmentId}
            onChange={(event) => setDepartmentId(event.target.value)}
          >
            <option value="All">All departments</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        )}
      </div>
      {tab === "spend" ? (
        spendQuery.isLoading ? (
          <div className="detail-loading" />
        ) : spendQuery.isError ? (
          <ReportError message="Spend records could not be loaded" />
        ) : (
          <SpendReport rows={spendRows} />
        )
      ) : auditQuery.isLoading ? (
        <div className="detail-loading" />
      ) : auditQuery.isError ? (
        <ReportError message="Audit logs could not be loaded" />
      ) : (
        <AuditReport logs={auditRows} />
      )}
    </>
  );
}

function SpendReport({ rows }: { rows: SpendRecordReport[] }) {
  const total = rows.reduce((sum, record) => sum + record.amount, 0);
  const largest = rows.length ? Math.max(...rows.map((record) => record.amount)) : 0;
  return (
    <>
      <section className="report-summary">
        <article>
          <span>Filtered spend</span><strong>{money(total)}</strong>
          <small>{rows.length} transactions</small>
        </article>
        <article>
          <span>Average transaction</span>
          <strong>{money(rows.length ? total / rows.length : 0)}</strong>
          <small>Across current results</small>
        </article>
        <article>
          <span>Largest transaction</span><strong>{money(largest)}</strong>
          <small>Across current results</small>
        </article>
      </section>
      <article className="panel report-table">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th><th>Description</th><th>Department</th><th>Category</th>
                <th>Supplier</th><th>Type</th><th>Reference</th><th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{DateTimeFormat(row.spent_on, { dateStyle: "medium" }, "Date")}</td>
                  <td><strong>{row.description}</strong></td>
                  <td>{row.department?.name || "Unknown department"}</td>
                  <td>{row.category}</td>
                  <td>{row.supplier?.name || "No supplier"}</td>
                  <td><span className="record-type">{displayValue(row.spend_type)}</span></td>
                  <td>{row.reference}</td>
                  <td className="amount">{money(row.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <div className="empty"><Search /><h3>No spend records found</h3></div>}
        </div>
      </article>
    </>
  );
}

function AuditReport({ logs }: { logs: AuditLogRecord[] }) {
  return (
    <article className="panel audit-list">
      <div className="audit-header">
        <div>
          <Activity />
          <span><strong>Organisation activity</strong><small>{logs.length} matching events</small></span>
        </div>
        <p>Events are chronological and retained for compliance review.</p>
      </div>
      {logs.map((log) => (
        <div className="audit-row" key={log.id}>
          <div className={`audit-icon ${log.action.toLowerCase()}`}><Activity /></div>
          <div className="audit-description">
            <div>
              <span className={`audit-action ${log.action.toLowerCase()}`}>{log.action}</span>
              <strong>{log.entity_type} · {log.entity_id || "No entity ID"}</strong>
            </div>
            <p>{log.description}</p>
            <small>
              {log.actor?.name || "System"}
              {log.actor?.role ? ` · ${log.actor.role}` : ""}
            </small>
          </div>
          <div className="audit-meta">
            <span>{DateTimeFormat(log.created_at, undefined, "DateTime")}</span>
            {log.metadata && (
              <small>
                {Object.entries(log.metadata)
                  .slice(0, 3)
                  .map(([key, value]) => `${displayValue(key)}: ${String(value)}`)
                  .join(" · ")}
              </small>
            )}
          </div>
        </div>
      ))}
      {logs.length === 0 && <div className="empty"><Activity /><h3>No audit events found</h3></div>}
    </article>
  );
}

function ReportError({ message }: { message: string }) {
  return <div className="empty"><FileBarChart /><h3>{message}</h3></div>;
}
