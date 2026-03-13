import Link from "next/link";

import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { getBrands } from "@/lib/api/admin";

type BrandsPageProps = {
  params: Promise<{
    adminRoute: string;
  }>;
  searchParams: Promise<{
    q?: string;
    status?: "all" | "healthy" | "flagged";
    page?: string;
  }>;
};

export default async function BrandsPage({ params, searchParams }: BrandsPageProps) {
  const { adminRoute } = await params;
  const { page, q, status } = await searchParams;
  const result = await getBrands({
    query: q,
    page: Number(page),
    status,
  });
  const action = `/${adminRoute}/brands`;

  return (
    <>
      <AdminTopbar
        title="Brands"
        description="Monitor owner relationships, member counts, and visibility assignments."
      />
      <AdminFilterBar
        action={action}
        query={q}
        queryPlaceholder="Search brands"
        selectLabel="Brand state"
        selectedValue={status ?? "all"}
        options={[
          { label: "All states", value: "all" },
          { label: "Healthy", value: "healthy" },
          { label: "Flagged", value: "flagged" },
        ]}
        summaryChips={[
          { label: "All", value: "all", count: result.counts.all ?? 0 },
          { label: "Healthy", value: "healthy", count: result.counts.healthy ?? 0 },
          { label: "Flagged", value: "flagged", count: result.counts.flagged ?? 0 },
        ]}
      />
      <div className="grid gap-4">
        {result.items.map((brand) => (
          <Card key={brand.id} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <Link
                href={`/${adminRoute}/brands/${brand.id}`}
                className="text-lg font-semibold text-[var(--color-ink)] hover:text-[var(--color-primary)]"
              >
                {brand.name}
              </Link>
              <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                {brand.owner} · {brand.members} members · {brand.services} services
              </p>
            </div>
            <StatusPill
              label={brand.status}
              tone={brand.status === "healthy" ? "success" : "warning"}
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
