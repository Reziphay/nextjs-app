"use client";

import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { Checkbox } from "@/components/atoms/checkbox";
import styles from "./data-table.module.css";

type Align = "left" | "center" | "right";

export type DataTableColumn<TRow> = {
  id: string;
  header: ReactNode;
  width?: string;
  align?: Align;
  className?: string;
  cellClassName?: string;
  render: (row: TRow) => ReactNode;
};

type DataTableProps<TRow> = {
  rows: TRow[];
  columns: DataTableColumn<TRow>[];
  getRowId: (row: TRow) => string;
  className?: string;
  tableClassName?: string;
  rowClassName?: (row: TRow) => string | undefined;
  emptyState?: ReactNode;
  bulkActions?: ReactNode;
  selectedRowIds?: string[];
  onSelectedRowIdsChange?: (ids: string[]) => void;
  selectLabel?: string;
};

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

function alignClassName(align: Align | undefined) {
  if (align === "center") return styles.alignCenter;
  if (align === "right") return styles.alignRight;
  return styles.alignLeft;
}

function getColumnLabel(header: ReactNode) {
  return typeof header === "string" || typeof header === "number"
    ? String(header)
    : undefined;
}

export function DataTable<TRow>({
  rows,
  columns,
  getRowId,
  className,
  tableClassName,
  rowClassName,
  emptyState,
  bulkActions,
  selectedRowIds,
  onSelectedRowIdsChange,
  selectLabel = "Select rows",
}: DataTableProps<TRow>) {
  const selectable = Boolean(onSelectedRowIdsChange);
  const selectedIds = selectedRowIds ?? [];
  const rowIds = useMemo(() => rows.map(getRowId), [getRowId, rows]);
  const allSelected = rowIds.length > 0 && rowIds.every((id) => selectedIds.includes(id));
  const someSelected = rowIds.some((id) => selectedIds.includes(id));
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = someSelected && !allSelected;
    }
  }, [allSelected, someSelected]);

  function toggleAll(checked: boolean) {
    if (!onSelectedRowIdsChange) return;
    onSelectedRowIdsChange(checked ? rowIds : []);
  }

  function toggleRow(rowId: string, checked: boolean) {
    if (!onSelectedRowIdsChange) return;
    const next = checked
      ? [...new Set([...selectedIds, rowId])]
      : selectedIds.filter((id) => id !== rowId);
    onSelectedRowIdsChange(next);
  }

  if (rows.length === 0) {
    return <>{emptyState ?? null}</>;
  }

  return (
    <div className={joinClassNames(styles.wrapper, className)}>
      {selectable && selectedIds.length > 0 ? (
        <div className={styles.bulkBar}>
          <span className={styles.bulkCount}>{selectedIds.length}</span>
          {bulkActions ? <div className={styles.bulkActions}>{bulkActions}</div> : null}
        </div>
      ) : null}

      <div className={styles.scrollArea}>
        <table className={joinClassNames(styles.table, tableClassName)}>
          <colgroup>
            {selectable ? <col style={{ width: "3rem" }} /> : null}
            {columns.map((column) => (
              <col
                key={column.id}
                style={column.width ? ({ width: column.width } as CSSProperties) : undefined}
              />
            ))}
          </colgroup>
          <thead>
            <tr>
              {selectable ? (
                <th className={joinClassNames(styles.headerCell, styles.selectionCell)}>
                  <Checkbox
                    ref={headerCheckboxRef}
                    aria-label={selectLabel}
                    checked={allSelected}
                    onChange={(event) => toggleAll(event.target.checked)}
                  />
                </th>
              ) : null}
              {columns.map((column) => (
                <th
                  key={column.id}
                  className={joinClassNames(
                    styles.headerCell,
                    alignClassName(column.align),
                    column.className,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const rowId = getRowId(row);
              const selected = selectedIds.includes(rowId);

              return (
                <tr
                  key={rowId}
                  className={joinClassNames(
                    styles.row,
                    selected ? styles.rowSelected : undefined,
                    rowClassName?.(row),
                  )}
                >
                  {selectable ? (
                    <td className={joinClassNames(styles.cell, styles.selectionCell)}>
                      <Checkbox
                        aria-label={selectLabel}
                        checked={selected}
                        onChange={(event) => toggleRow(rowId, event.target.checked)}
                      />
                    </td>
                  ) : null}
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      data-label={getColumnLabel(column.header)}
                      className={joinClassNames(
                        styles.cell,
                        alignClassName(column.align),
                        column.cellClassName,
                      )}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
