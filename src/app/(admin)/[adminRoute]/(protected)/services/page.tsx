import Link from "next/link";

import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { getServices } from "@/lib/api/admin";

type ServicesPageProps = {
  params: Promise<{
    adminRoute: string;
  }>;
  searchParams: Promise<{
    q?: string;
    status?: "all" | "active" | "paused" | "flagged";
    page?: string;
  }>;
};

export default async function ServicesPage({
  params,
  searchParams,
}: ServicesPageProps) {
  const { adminRoute } = await params;
  const { page, q, status } = await searchParams;
  const result = await getServices({
    query: q,
    page: Number(page),
    status,
  });
  const action = `/${adminRoute}/services`;

  return (
    <>
      <AdminTopbar
        title="Services"
        description="Moderation, discovery oversight, and visibility context for live services."
      />
      <AdminFilterBar
        action={action}
        query={q}
        queryPlaceholder="Search services"
        selectLabel="Service state"
        selectedValue={status ?? "all"}
        options={[
          { label: "All states", value: "all" },
          { label: "Active", value: "active" },
          { label: "Paused", value: "paused" },
          { label: "Flagged", value: "flagged" },
        ]}
        summaryChips={[
          { label: "All", value: "all", count: result.counts.all ?? 0 },
          { label: "Active", value: "active", count: result.counts.active ?? 0 },
          { label: "Paused", value: "paused", count: result.counts.paused ?? 0 },
          { label: "Flagged", value: "flagged", count: result.counts.flagged ?? 0 },
        ]}
      />
      <div className="grid gap-4">
        {result.items.map((service) => (
          <Card key={service.id} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <Link
                href={`/${adminRoute}/services/${service.id}`}
                className="text-lg font-semibold text-[var(--color-ink)] hover:text-[var(--color-primary)]"
              >
                {service.name}
              </Link>
              <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                {service.provider} · {service.brand} · {service.requestsToday} requests today
              </p>
            </div>
            <StatusPill
              label={service.status}
              tone={
                service.status === "active"
                  ? "success"
                  : service.status === "paused"
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
