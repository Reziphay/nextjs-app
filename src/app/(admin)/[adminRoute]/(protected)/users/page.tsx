import Link from "next/link";

import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { getUsers } from "@/lib/api/admin";

type UsersPageProps = {
  params: Promise<{
    adminRoute: string;
  }>;
  searchParams: Promise<{
    q?: string;
    status?: "all" | "active" | "suspended" | "closed";
    page?: string;
  }>;
};

export default async function UsersPage({ params, searchParams }: UsersPageProps) {
  const { adminRoute } = await params;
  const { page, q, status } = await searchParams;
  const result = await getUsers({
    query: q,
    page: Number(page),
    state: status,
  });
  const action = `/${adminRoute}/users`;

  return (
    <>
      <AdminTopbar
        title="Users"
        description="Inspect identity, role mix, account health, and penalty state without clutter."
      />
      <AdminFilterBar
        action={action}
        query={q}
        queryPlaceholder="Search users"
        selectLabel="Account state"
        selectedValue={status ?? "all"}
        options={[
          { label: "All states", value: "all" },
          { label: "Active", value: "active" },
          { label: "Suspended", value: "suspended" },
          { label: "Closed", value: "closed" },
        ]}
        summaryChips={[
          { label: "All", value: "all", count: result.counts.all ?? 0 },
          { label: "Active", value: "active", count: result.counts.active ?? 0 },
          {
            label: "Suspended",
            value: "suspended",
            count: result.counts.suspended ?? 0,
          },
          { label: "Closed", value: "closed", count: result.counts.closed ?? 0 },
        ]}
      />
      <div className="grid gap-4">
        {result.items.map((user) => (
          <Card key={user.id} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <Link
                href={`/${adminRoute}/users/${user.id}`}
                className="text-lg font-semibold text-[var(--color-ink)] hover:text-[var(--color-primary)]"
              >
                {user.name}
              </Link>
              <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                {user.roles.join(", ")} · {user.penaltyPoints} penalty points
              </p>
            </div>
            <StatusPill
              label={user.state}
              tone={
                user.state === "active"
                  ? "success"
                  : user.state === "suspended"
                    ? "warning"
                    : "danger"
              }
            />
          </Card>
        ))}
      </div>
      <AdminPagination
        action={action}
        page={result.page}
        pageSize={result.pageSize}
        query={q}
        status={status}
        total={result.total}
        totalPages={result.totalPages}
      />
    </>
  );
}
