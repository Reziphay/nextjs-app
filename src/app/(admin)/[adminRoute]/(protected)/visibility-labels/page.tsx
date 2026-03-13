import { AdminTopbar } from "@/components/admin/admin-topbar";
import { VisibilityLabelsPanel } from "@/features/admin-visibility/visibility-assignments";
import { VisibilityForm } from "@/features/admin-visibility/visibility-form";
import { getVisibilityLabels } from "@/lib/api/admin";

export default async function VisibilityLabelsPage() {
  const labels = await getVisibilityLabels();

  return (
    <>
      <AdminTopbar
        title="Visibility labels"
        description="Manage the shared label library and create auditable assignments for brands, services, and users."
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <VisibilityForm />
        <VisibilityLabelsPanel labels={labels} />
      </div>
    </>
  );
}
