import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Card } from "@/components/ui/card";

export default function ActivityPage() {
  return (
    <>
      <AdminTopbar
        title="Activity"
        description="Chronological operational feed for moderation and visibility actions."
      />
      <Card>
        <ul className="space-y-4 text-sm leading-7 text-[var(--color-ink-muted)]">
          <li>09:12 · Report escalated for fake address investigation.</li>
          <li>08:47 · VIP label applied to Calm Studio.</li>
          <li>08:10 · Suspended user account reviewed and confirmed.</li>
        </ul>
      </Card>
    </>
  );
}
