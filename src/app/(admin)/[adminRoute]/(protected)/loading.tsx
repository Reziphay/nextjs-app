function AdminLoadingBlock() {
  return (
    <div className="rounded-[24px] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-soft)]">
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-28 rounded-full bg-[var(--color-surface-strong)]" />
        <div className="h-10 w-1/2 rounded-full bg-[var(--color-surface-strong)]" />
        <div className="h-28 rounded-[20px] bg-[var(--color-surface-strong)]" />
      </div>
    </div>
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
