import { AdminTopbar } from "@/components/admin/admin-topbar";
import { AdminOverviewSection } from "@/features/admin-dashboard/overview";
import { getAdminOverview } from "@/lib/api/admin";

export default async function AdminOverviewPage() {
  const overview = await getAdminOverview();

  return (
    <>
      <AdminTopbar
        title="Overview"
        description="High-level system snapshot for moderation load, provider growth, visibility programs, and operational activity."
      />
      <AdminOverviewSection overview={overview} />
    </>
  );
}
