import type { ReactNode } from "react";

export interface ColumnDef<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyState?: ReactNode;
}

export function DataTable<T>({ data, columns, keyExtractor, onRowClick, emptyState }: DataTableProps<T>): JSX.Element {
  if (!data.length && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-brand-border bg-brand-surface shadow-sm">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="border-b border-brand-border bg-brand-surface-soft">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-brand-muted whitespace-nowrap ${col.className || ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={keyExtractor(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`border-b border-brand-border transition-colors last:border-b-0 ${onRowClick ? "cursor-pointer hover:bg-brand-surface-muted" : ""}`}
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3.5 text-brand-text-soft font-medium ${col.className || ""}`}>
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && !emptyState && (
            <tr>
              <td colSpan={columns.length} className="text-center py-8 text-brand-muted">
                No data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
