"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function PublicError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="mx-auto grid min-h-[70vh] max-w-[960px] place-items-center px-4 py-16">
      <Card tone="soft" className="max-w-xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
          Public website
        </p>
        <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-[var(--color-ink)]">
          This page failed to load cleanly.
        </h1>
        <p className="mt-4 text-sm leading-8 text-[var(--color-ink-muted)]">
          The fallback stays calm and explicit instead of dropping the user into
          a blank shell.
        </p>
        <div className="mt-8 flex justify-center">
          <Button onClick={reset}>Retry</Button>
        </div>
      </Card>
    </main>
  );
}
