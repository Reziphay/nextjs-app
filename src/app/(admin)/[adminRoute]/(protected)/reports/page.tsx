import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { ReportsTable } from "@/features/admin-reports/reports-table";
import { getReports } from "@/lib/api/admin";

type ReportsPageProps = {
  params: Promise<{
    adminRoute: string;
  }>;
  searchParams: Promise<{
    q?: string;
    status?: "all" | "open" | "reviewing" | "resolved" | "dismissed";
    page?: string;
  }>;
};

export default async function ReportsPage({
  params,
  searchParams,
}: ReportsPageProps) {
  const { adminRoute } = await params;
  const { page, q, status } = await searchParams;
  const result = await getReports({
    query: q,
    page: Number(page),
    status,
  });
  const action = `/${adminRoute}/reports`;

  return (
    <>
      <AdminTopbar
        title="Reports"
        description="Review user-submitted complaints, spam signals, and moderation actions in a calm, auditable table."
      />
      <AdminFilterBar
        action={action}
        query={q}
        queryPlaceholder="Search reports"
        selectLabel="Status"
        selectedValue={status ?? "all"}
        options={[
          { label: "All statuses", value: "all" },
          { label: "Open", value: "open" },
          { label: "Reviewing", value: "reviewing" },
          { label: "Resolved", value: "resolved" },
          { label: "Dismissed", value: "dismissed" },
        ]}
        summaryChips={[
          { label: "All", value: "all", count: result.counts.all ?? 0 },
          { label: "Open", value: "open", count: result.counts.open ?? 0 },
          {
            label: "Reviewing",
            value: "reviewing",
            count: result.counts.reviewing ?? 0,
          },
          {
            label: "Resolved",
            value: "resolved",
            count: result.counts.resolved ?? 0,
          },
          {
            label: "Dismissed",
            value: "dismissed",
            count: result.counts.dismissed ?? 0,
          },
        ]}
      />
      <ReportsTable adminRoute={adminRoute} records={result.items} />
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
