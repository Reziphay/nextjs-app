import { Card } from "@/components/ui/card";

function LoadingCard() {
  return (
    <Card tone="soft">
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-24 rounded-full bg-[var(--color-surface-strong)]" />
        <div className="h-8 w-2/3 rounded-full bg-[var(--color-surface-strong)]" />
        <div className="h-24 rounded-[20px] bg-[var(--color-surface-strong)]" />
      </div>
    </Card>
  );
}

export default function PublicLoading() {
  return (
    <main className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6 lg:px-8">
      <div className="animate-pulse">
        <div className="h-4 w-28 rounded-full bg-[var(--color-surface-strong)]" />
        <div className="mt-6 h-14 w-3/4 rounded-full bg-[var(--color-surface-strong)]" />
        <div className="mt-4 h-6 w-full max-w-2xl rounded-full bg-[var(--color-surface-strong)]" />
      </div>
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
      </div>
    </main>
  );
}
