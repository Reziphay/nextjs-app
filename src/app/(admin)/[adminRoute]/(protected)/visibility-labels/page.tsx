import { AdminTopbar } from "@/components/admin/admin-topbar";
import { VisibilityAssignmentsPanel } from "@/features/admin-visibility/visibility-assignments";
import { VisibilityForm } from "@/features/admin-visibility/visibility-form";
import { getVisibilityAssignments } from "@/lib/api/admin";

export default async function VisibilityLabelsPage() {
  const assignments = await getVisibilityAssignments();

  return (
    <>
      <AdminTopbar
        title="Visibility labels"
        description="Manage featured, VIP, and best-of-month assignments with clear windows and audit-friendly notes."
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <VisibilityForm />
        <VisibilityAssignmentsPanel assignments={assignments} />
      </div>
    </>
  );
}
