import { AdminTopbar } from "@/components/admin/admin-topbar";
import { AnalyticsOverview } from "@/features/admin-analytics/analytics-overview";
import { getAnalyticsOverview } from "@/lib/api/admin";

export default async function AnalyticsPage() {
  const series = await getAnalyticsOverview();

  return (
    <>
      <AdminTopbar
        title="Analytics"
        description="Simple trend cards for reservations, reports, and sponsored performance."
      />
      <AnalyticsOverview series={series} />
    </>
  );
}
