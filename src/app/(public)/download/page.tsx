import Link from "next/link";

import { PageIntroPanel } from "@/components/marketing/page-intro-panel";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { buildMetadata, siteConfig } from "@/lib/config/site";

export const metadata = buildMetadata({
  title: "Download the app",
  description: "Drive app installs with a clear, lightweight download page.",
  path: "/download",
});

export default function DownloadPage() {
  return (
    <main className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <PageIntroPanel
        eyebrow="Get the app"
        title="The mobile app is where reservations happen"
        description="Use the website to understand the product, then move into the app for discovery, reservation requests, and ongoing account flows."
      />
      <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card tone="soft" className="p-8">
          <p className="text-sm font-medium text-[var(--color-ink-muted)]">
            App stores
          </p>
          <div className="mt-6 flex flex-col gap-4">
            <Link href={siteConfig.iosUrl} className={buttonStyles({ kind: "primary" })}>
              Download for iPhone
            </Link>
            <Link
              href={siteConfig.androidUrl}
              className={buttonStyles({ kind: "secondary" })}
            >
              Download for Android
            </Link>
          </div>
          <p className="mt-6 text-sm leading-7 text-[var(--color-ink-muted)]">
            Store links are env-driven so you can swap placeholders without
            touching route code.
          </p>
        </Card>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            "Discover trusted services",
            "Track reservation changes",
            "Complete visits and review",
          ].map((item) => (
            <Card key={item} tone="subtle" className="min-h-48">
              <p className="text-base font-semibold text-[var(--color-ink)]">
                {item}
              </p>
              <p className="mt-4 text-sm leading-7 text-[var(--color-ink-muted)]">
                Calm screens, status clarity, and a role-aware product flow stay
                centered on the mobile experience.
              </p>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
