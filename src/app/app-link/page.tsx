import type { Metadata } from "next";
import { Suspense } from "react";

import { siteConfig } from "@/config/site";

import { AppLinkResolver } from "@/components/marketing/app-link-resolver";
import { PageHero } from "@/components/sections/page-hero";
import { SectionShell } from "@/components/sections/section-shell";

export const metadata: Metadata = {
  title: "App link",
  description:
    "A fallback route that attempts to open the Reziphay app and falls back to the download flow when needed.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: `${siteConfig.url}/app-link`,
  },
};

export default function AppLinkPage() {
  return (
    <>
      <PageHero
        hero={{
          eyebrow: "App link",
          title: "Open the app first, then fall back cleanly if needed.",
          description:
            "The deep-link route is useful for existing users, QR flows, and future smart download buttons.",
        }}
        actions={null}
        aside={
          <div className="space-y-3 text-sm leading-6 text-muted">
            <p>This route is intentionally noindex.</p>
            <p>It supports deep links without polluting the public marketing story.</p>
          </div>
        }
      />
      <SectionShell>
        <Suspense
          fallback={
            <div className="rounded-[1.75rem] border border-border/80 bg-card p-6 shadow-[var(--shadow-card)]">
              <p className="text-sm leading-6 text-muted">
                Preparing the app-link fallback...
              </p>
            </div>
          }
        >
          <AppLinkResolver />
        </Suspense>
      </SectionShell>
    </>
  );
}
