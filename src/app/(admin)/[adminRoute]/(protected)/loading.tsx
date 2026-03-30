import { Card } from "@/components/ui/card";

function AdminLoadingBlock() {
  return (
    <Card tone="soft">
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-28 rounded-full bg-[var(--color-surface-strong)]" />
        <div className="h-10 w-1/2 rounded-full bg-[var(--color-surface-strong)]" />
        <div className="h-28 rounded-[20px] bg-[var(--color-surface-strong)]" />
      </div>
    </Card>
  );
}

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <AdminLoadingBlock />
      <div className="grid gap-6 lg:grid-cols-2">
        <AdminLoadingBlock />
        <AdminLoadingBlock />
      </div>
    </div>
  );
}
