import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";

const navItems = [
  { href: "/download", label: "Download" },
  { href: "/for-businesses", label: "For businesses" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[color:rgba(253,253,253,0.86)] backdrop-blur">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-sm font-semibold text-[var(--color-ink)]">
          <span className="grid h-10 w-10 place-items-center rounded-[16px] bg-[var(--color-primary)] text-base tracking-[-0.04em]">
            Rz
          </span>
          <span className="text-base tracking-[-0.03em]">Reziphay</span>
        </Link>
        <details className="group md:hidden">
          <summary className="list-none rounded-full border border-[var(--color-border-strong)] px-4 py-2 text-sm font-medium text-[var(--color-ink)]">
            Menu
          </summary>
          <div className="absolute right-4 mt-3 w-56 rounded-[20px] border border-[var(--color-border)] bg-white p-3 shadow-[var(--shadow-soft)]">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-[14px] px-3 py-2 text-sm text-[var(--color-ink-muted)] transition hover:bg-[var(--color-surface-strong)] hover:text-[var(--color-ink)]"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/onboarding"
                className="rounded-[14px] px-3 py-2 text-sm font-medium text-[var(--color-primary)] transition hover:bg-[var(--color-surface-strong)]"
              >
                Sign In
              </Link>
            </nav>
          </div>
        </details>
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-[var(--color-ink-muted)] transition hover:text-[var(--color-ink)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/onboarding"
            className={buttonStyles({ kind: "primary" })}
          >
            Sign In
          </Link>
          <Link
            href="/download"
            className={buttonStyles({ kind: "secondary" })}
          >
            Get the app
          </Link>
        </div>
      </div>
    </header>
  );
}
