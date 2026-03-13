import { AdminTopbar } from "@/components/admin/admin-topbar";
import { ActivityFeed } from "@/features/admin-activity/activity-feed";
import { getActivityFeed } from "@/lib/api/admin";

export default async function ActivityPage() {
  const items = await getActivityFeed();

  return (
    <>
      <AdminTopbar
        title="Activity"
        description="Chronological operational feed for moderation and visibility actions."
      />
      <ActivityFeed items={items} />
    </>
  );
}
