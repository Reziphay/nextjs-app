import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";

type AdminPaginationProps = {
  action: string;
  page: number;
  totalPages: number;
  query?: string;
  status?: string;
  total: number;
  pageSize: number;
};

function buildPageHref(
  action: string,
  page: number,
  query?: string,
  status?: string,
) {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  if (status && status !== "all") {
    params.set("status", status);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const suffix = params.toString();

  return suffix ? `${action}?${suffix}` : action;
}

export function AdminPagination({
  action,
  page,
  pageSize,
  query,
  status,
  total,
  totalPages,
}: AdminPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-4 rounded-[24px] border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-soft)] md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-[var(--color-ink-muted)]">
        Showing {start}-{end} of {total}
      </p>
      <div className="flex items-center gap-3">
        <Link
          href={buildPageHref(action, Math.max(page - 1, 1), query, status)}
          aria-disabled={page <= 1}
          className={buttonStyles({
            kind: "secondary",
            className: page <= 1 ? "pointer-events-none opacity-50" : "",
          })}
        >
          Previous
        </Link>
        <p className="min-w-20 text-center text-sm text-[var(--color-ink-muted)]">
          {page} / {totalPages}
        </p>
        <Link
          href={buildPageHref(action, Math.min(page + 1, totalPages), query, status)}
          aria-disabled={page >= totalPages}
          className={buttonStyles({
            kind: "secondary",
            className: page >= totalPages ? "pointer-events-none opacity-50" : "",
          })}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
