"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AdminError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <Card tone="soft">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
        Hidden admin
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[var(--color-ink)]">
        This operational page failed to load.
      </h1>
      <p className="mt-4 text-sm leading-8 text-[var(--color-ink-muted)]">
        The admin surface should stay explicit under failure and allow a direct retry.
      </p>
      <div className="mt-8">
        <Button kind="admin" onClick={reset}>
          Retry
        </Button>
      </div>
    </Card>
  );
}
