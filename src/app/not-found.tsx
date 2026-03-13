import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-screen max-w-[960px] place-items-center px-4 py-16">
      <div className="rounded-[32px] border border-[var(--color-border)] bg-white p-10 text-center shadow-[var(--shadow-soft)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
          Not found
        </p>
        <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-[var(--color-ink)]">
          This route does not belong to the Reziphay web surface.
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-8 text-[var(--color-ink-muted)]">
          The public website and the hidden admin stay intentionally narrow. If
          you expected an operational page, verify the configured admin route.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/" className={buttonStyles({ kind: "primary" })}>
            Go to homepage
          </Link>
          <Link href="/faq" className={buttonStyles({ kind: "secondary" })}>
            Read the FAQ
          </Link>
        </div>
      </div>
    </main>
  );
}
