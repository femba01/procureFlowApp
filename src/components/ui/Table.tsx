import React from "react";

/** Column definition */
export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  className?: string;
  cellClassName?: string | ((row: T, index: number) => string);

  /** Optional custom render for cell */
  render?: (row: T, value: unknown, i: number) => React.ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  rowKey: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  actions?: (row: T) => React.ReactNode; // custom actions per row
  emptyMessage?: string | React.ReactNode; // message to show when no data is available
  panelTitle?: boolean; // whether to show panel title
  panelContent?: React.ReactNode; // optional content to show in the panel
  className?: string;
  tableClassName?: string;
}

export default function Table<T>({
  data,
  columns,
  rowKey,
  onRowClick,
  actions,
  emptyMessage = "No data available",
  panelTitle = false,
  panelContent,
  className = "",
  tableClassName = "text-nowrap",
}: TableProps<T>) {
  return (
    <article className={`panel requests-panel ${className}`.trim()}>
      {panelTitle && panelContent}
      <div className="table-wrap">
        <table className={tableClassName}>
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th
                  key={i}
                  className={`px-3 py-3 font-bold sm:px-4 ${col.className ?? ""}`}
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="text-nowrap">
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)}>
                  {emptyMessage}
                </td>
              </tr>
            )}

            {data.map((row, index) => (
              <tr
                key={rowKey(row)}
                className={`${onRowClick ? "cursor-pointer" : ""}`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => {
                  const value = (row as Record<string, unknown>)[
                    String(col.key)
                  ];

                  const cellClassName =
                    typeof col.cellClassName === "function"
                      ? col.cellClassName(row, index)
                      : col.cellClassName;

                  return (
                    <td
                      key={String(col.key)}
                      className={`px-3 py-3 sm:px-4 ${col.className ?? ""} ${cellClassName ?? ""}`}
                    >
                      {col.render
                        ? col.render(row, value, index)
                        : React.isValidElement(value)
                          ? value
                          : String(value ?? "")}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

export function PanelTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: string;
}) {
  return (
    <div className="panel-title">
      <div>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
      {action && <button>{action}</button>}
    </div>
  );
}
