import { notFound } from "next/navigation";

import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Card } from "@/components/ui/card";
import { getServiceById } from "@/lib/api/admin";

type ServiceDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ServiceDetailPage({
  params,
}: ServiceDetailPageProps) {
  const { id } = await params;
  const service = await getServiceById(id);

  if (!service) {
    notFound();
  }

  return (
    <>
      <AdminTopbar
        title="Service detail"
        description="Review provider context, labels, and request health before intervening."
      />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--color-ink)]">
            {service.name}
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--color-ink-muted)]">
            Provider: {service.provider}. Brand: {service.brand}. Requests today:{" "}
            {service.requestsToday}.
          </p>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-[var(--color-ink)]">
            Visibility labels
          </h3>
          <p className="mt-3 text-sm leading-7 text-[var(--color-ink-muted)]">
            {service.visibility.length ? service.visibility.join(", ") : "No active labels."}
          </p>
        </Card>
      </div>
    </>
  );
}
