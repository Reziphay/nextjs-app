import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Card } from "@/components/ui/card";
import { VisibilityForm } from "@/features/admin-visibility/visibility-form";

export default function VisibilityLabelsPage() {
  return (
    <>
      <AdminTopbar
        title="Visibility labels"
        description="Manage featured, VIP, and best-of-month assignments with clear windows and audit-friendly notes."
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <VisibilityForm />
        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">
            Active assignments
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--color-ink-muted)]">
            <li>Featured · Calm Studio · Mar 1 to Mar 31</li>
            <li>VIP · Calm Studio · Mar 10 to Apr 10</li>
            <li>Best of month · Precision fade · Mar 1 to Mar 31</li>
          </ul>
        </Card>
      </div>
    </>
  );
}
