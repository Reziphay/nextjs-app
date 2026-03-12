import Link from "next/link";
import { Menu } from "lucide-react";

import { siteNavigation } from "@/content/site";

import { CtaLink } from "@/components/marketing/cta-link";
import { Badge } from "@/components/ui/badge";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/92 backdrop-blur">
      <div className="container-shell flex min-h-18 items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-4">
          <Link className="flex items-center gap-3" href="/">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-lg font-bold text-white">
              R
            </div>
            <div className="space-y-1">
              <div className="font-display text-lg font-semibold tracking-tight">
                Reziphay
              </div>
              <div className="text-xs text-muted">
                Service discovery and flexible reservations
              </div>
            </div>
          </Link>
          <Badge className="hidden lg:inline-flex">Mobile app at the center</Badge>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          {siteNavigation.map((item) => (
            <Link
              className="text-sm font-medium text-muted transition hover:text-foreground"
              href={item.href}
              key={item.href}
            >
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <CtaLink
            eventName="header_contact_click"
            href="/contact"
            variant="ghost"
          >
            Contact
          </CtaLink>
          <CtaLink
            eventName="header_download_click"
            href="/download"
            variant="default"
          >
            Download app
          </CtaLink>
        </div>

        <details className="relative md:hidden">
          <summary className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border border-border bg-white">
            <Menu className="h-5 w-5" />
          </summary>
          <div className="absolute right-0 top-14 w-72 rounded-[1.75rem] border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge>Marketing website</Badge>
              <Badge className="bg-white">App-driven booking flow</Badge>
            </div>
            <div className="flex flex-col gap-2">
              {siteNavigation.map((item) => (
                <Link
                  className="rounded-2xl px-3 py-2 text-sm font-medium text-foreground hover:bg-card-muted"
                  href={item.href}
                  key={item.href}
                >
                  {item.title}
                </Link>
              ))}
            </div>
            <div className="mt-4 grid gap-2">
              <CtaLink href="/download" size="sm">
                Download app
              </CtaLink>
              <CtaLink href="/contact" size="sm" variant="outline">
                Talk to the team
              </CtaLink>
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}

