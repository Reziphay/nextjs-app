import Link from "next/link";

import { siteNavigation } from "@/content/site";

import { CtaLink } from "@/components/marketing/cta-link";
import { Badge } from "@/components/ui/badge";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 bg-card/80">
      <div className="container-shell grid gap-10 py-12 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-4">
          <Badge>Growth surface for the mobile product</Badge>
          <div>
            <p className="font-display text-2xl font-semibold">
              Reziphay keeps service discovery clean and reservation demand flexible.
            </p>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
              The website explains the product, captures intent, and routes people
              toward the right next step. Reservation requests stay anchored in the
              mobile app.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <CtaLink href="/download">Get app updates</CtaLink>
            <CtaLink href="/for-providers" variant="outline">
              Provider interest
            </CtaLink>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
            Explore
          </p>
          <div className="mt-4 grid gap-2">
            {siteNavigation.map((item) => (
              <Link
                className="text-sm text-foreground/85 transition hover:text-accent"
                href={item.href}
                key={item.href}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
            Legal
          </p>
          <div className="mt-4 grid gap-2 text-sm">
            <Link className="transition hover:text-accent" href="/privacy">
              Privacy
            </Link>
            <Link className="transition hover:text-accent" href="/terms">
              Terms
            </Link>
            <Link className="transition hover:text-accent" href="/about">
              About
            </Link>
            <Link className="transition hover:text-accent" href="/admin/hidden/login">
              Admin gateway
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

