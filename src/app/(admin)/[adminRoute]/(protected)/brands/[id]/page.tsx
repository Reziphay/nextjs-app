import { notFound } from "next/navigation";

import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Card } from "@/components/ui/card";
import { getBrandById } from "@/lib/api/admin";

type BrandDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function BrandDetailPage({ params }: BrandDetailPageProps) {
  const { id } = await params;
  const brand = await getBrandById(id);

  if (!brand) {
    notFound();
  }

  return (
    <>
      <AdminTopbar
        title="Brand detail"
        description="Inspect ownership, services, reports, and visibility state."
      />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--color-ink)]">
            {brand.name}
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--color-ink-muted)]">
            Owner: {brand.owner}. Members: {brand.members}. Services: {brand.services}.
          </p>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-[var(--color-ink)]">
            Visibility labels
          </h3>
          <p className="mt-3 text-sm leading-7 text-[var(--color-ink-muted)]">
            {brand.visibility.length ? brand.visibility.join(", ") : "No active labels."}
          </p>
        </Card>
      </div>
    </>
  );
}
