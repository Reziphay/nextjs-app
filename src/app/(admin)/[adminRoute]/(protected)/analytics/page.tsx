import { AdminTopbar } from "@/components/admin/admin-topbar";
import { AnalyticsOverview } from "@/features/admin-analytics/analytics-overview";
import { getAnalyticsOverview } from "@/lib/api/admin";

export default async function AnalyticsPage() {
  const data = await getAnalyticsOverview();

  return (
    <>
      <AdminTopbar
        title="Analytics"
        description="Operational snapshot for user, provider, reservation, report, and visibility health."
      />
      <AnalyticsOverview data={data} />
    </>
  );
}
