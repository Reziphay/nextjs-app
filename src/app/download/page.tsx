import { getDownloadHref } from "@/config/site";
import { createMetadata } from "@/features/seo/metadata";

import { CtaLink } from "@/components/marketing/cta-link";
import { PageHero } from "@/components/sections/page-hero";
import { SectionHeading } from "@/components/sections/section-heading";
import { SectionShell } from "@/components/sections/section-shell";
import { Badge } from "@/components/ui/badge";

export const metadata = createMetadata({
  title: "Download",
  description:
    "Route visitors toward App Store and Google Play launch paths, deep links, and launch update forms for Reziphay.",
  path: "/download",
});

export default function DownloadPage() {
  return (
    <>
      <PageHero
        hero={{
          eyebrow: "Download flow",
          title: "Prepare a clean bridge from the website into the mobile product.",
          description:
            "If store links are live, send people there. If they are not live yet, send them to launch updates instead of dead buttons.",
        }}
        actions={
          <>
            <CtaLink
              analyticsEvent={{
                name: "hero_cta_click",
                properties: {
                  ctaLabel: "Open app link route",
                  destination: "/app-link",
                  surface: "download-hero",
                },
              }}
              href="/app-link"
            >
              Open app link route
            </CtaLink>
            <CtaLink
              analyticsEvent={{
                name: "hero_cta_click",
                properties: {
                  ctaLabel: "Ask for launch updates",
                  destination: "/contact?intent=app-launch",
                  surface: "download-hero",
                },
              }}
              href="/contact?intent=app-launch"
              variant="outline"
            >
              Ask for launch updates
            </CtaLink>
          </>
        }
        aside={
          <div className="space-y-4">
            <Badge>Download logic</Badge>
            <ul className="space-y-3 text-sm leading-6 text-muted">
              <li>App Store and Google Play URLs are environment-driven.</li>
              <li>If those URLs are missing, the fallback route still captures intent.</li>
              <li>The deep-link route is separate for existing app users.</li>
            </ul>
          </div>
        }
      />

      <SectionShell>
        <SectionHeading
          eyebrow="Platform routes"
          title="Support both new downloads and existing app users."
          description="This page keeps the CTA logic explicit instead of hardcoding assumptions about launch readiness."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[
            {
              eyebrow: "iOS",
              eventName: "app_store_click" as const,
              title: "App Store path",
              copy:
                "Use the App Store URL when it is available. Otherwise, route to a contact intent that captures launch demand.",
              href: getDownloadHref("ios"),
            },
            {
              eyebrow: "Android",
              eventName: "play_store_click" as const,
              title: "Google Play path",
              copy:
                "Use the Play Store URL when it is available. Otherwise, route to a matching launch-update surface.",
              href: getDownloadHref("android"),
            },
          ].map((item) => (
            <div
              className="rounded-[1.75rem] border border-border/80 bg-card p-6 shadow-[var(--shadow-card)]"
              key={item.title}
            >
              <Badge>{item.eyebrow}</Badge>
              <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">{item.copy}</p>
              <div className="mt-6">
                <CtaLink
                  analyticsEvent={{
                    name: item.eventName,
                    properties: {
                      href: item.href,
                      surface: "download-page",
                    },
                  }}
                  href={item.href}
                >
                  Continue
                </CtaLink>
              </div>
            </div>
          ))}
        </div>
      </SectionShell>
    </>
  );
}
