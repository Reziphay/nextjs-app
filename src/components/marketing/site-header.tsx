import Link from "next/link";

import { LanguageThemeControls } from "@/components/shared/language-theme-controls";
import { ReziphayLogo } from "@/components/shared/reziphay-logo";
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
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-glass)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1240px] items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3 text-sm font-semibold text-[var(--color-ink)]"
        >
          <ReziphayLogo size={44} className="rounded-[18px] shadow-[var(--shadow-card)]" />
          <span className="flex min-w-0 flex-col leading-none">
            <span className="whitespace-nowrap text-base tracking-[-0.03em]">Reziphay</span>
            <span className="mt-1 whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--color-ink-faint)] max-md:hidden">
              Mobile-first
            </span>
          </span>
        </Link>
        <details className="group relative ml-auto lg:hidden">
          <summary className="list-none rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] shadow-[var(--shadow-card)]">
            Menu
          </summary>
          <div className="absolute right-0 mt-3 w-56 rounded-[20px] border border-[var(--color-border)] bg-[var(--color-card)] p-3 shadow-[var(--shadow-soft)] backdrop-blur-sm">
            <LanguageThemeControls className="mb-3 justify-start" dropdownSide="left" />
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
        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-5 lg:flex xl:gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap text-sm text-[var(--color-ink-muted)] transition hover:text-[var(--color-primary)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden shrink-0 items-center gap-3 lg:flex">
          <LanguageThemeControls className="shrink-0" />
          <Link
            href="/onboarding"
            className={buttonStyles({ kind: "primary", className: "shrink-0 whitespace-nowrap" })}
          >
            Sign In
          </Link>
          <Link
            href="/download"
            className={buttonStyles({ kind: "secondary", className: "shrink-0 whitespace-nowrap" })}
          >
            Get the app
          </Link>
        </div>
      </div>
    </header>
  );
}
