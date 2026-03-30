import Link from "next/link";

import { siteConfig } from "@/lib/config/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(242,242,247,0.96))]">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.6fr_1fr_1fr] lg:px-8">
        <div>
          <p className="text-lg font-semibold tracking-[-0.03em] text-[var(--color-ink)]">
            Reziphay
          </p>
          <p className="mt-4 max-w-md text-sm leading-7 text-[var(--color-ink-muted)]">
            Discovery, reservation requests, and operational trust for modern
            service businesses.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--color-ink)]">Pages</p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-[var(--color-ink-muted)]">
            <Link href="/download" className="transition hover:text-[var(--color-primary)]">Download</Link>
            <Link href="/for-businesses" className="transition hover:text-[var(--color-primary)]">For businesses</Link>
            <Link href="/about" className="transition hover:text-[var(--color-primary)]">About</Link>
            <Link href="/faq" className="transition hover:text-[var(--color-primary)]">FAQ</Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--color-ink)]">Support</p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-[var(--color-ink-muted)]">
            <Link href="/contact" className="transition hover:text-[var(--color-primary)]">Contact</Link>
            <Link href="/legal/terms" className="transition hover:text-[var(--color-primary)]">Terms</Link>
            <Link href="/legal/privacy" className="transition hover:text-[var(--color-primary)]">Privacy</Link>
            <a href={`mailto:${siteConfig.contactEmail}`} className="transition hover:text-[var(--color-primary)]">{siteConfig.contactEmail}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
