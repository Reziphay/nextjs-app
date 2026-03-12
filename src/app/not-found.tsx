import { createMetadata } from "@/features/seo/metadata";

import { CtaLink } from "@/components/marketing/cta-link";
import { PageHero } from "@/components/sections/page-hero";

export const metadata = createMetadata({
  title: "Page not found",
  description:
    "The page could not be found. Return to the Reziphay marketing site and continue through the main routes.",
  noIndex: true,
  path: "/404",
});

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <PageHero
        hero={{
          eyebrow: "404",
          title: "The route is missing, but the product path is still clear.",
          description:
            "Return to the main marketing surface, explore customer or provider value, or jump directly into the download flow.",
        }}
        actions={
          <>
            <CtaLink href="/">Go home</CtaLink>
            <CtaLink href="/download" variant="outline">
              Download flow
            </CtaLink>
          </>
        }
        aside={
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.2em] text-accent-strong">
              Suggested next steps
            </p>
            <ul className="space-y-3 text-sm leading-6 text-muted">
              <li>Review the main landing page and value proposition.</li>
              <li>See customer and provider journeys in dedicated routes.</li>
              <li>Use the contact form if you landed here from an old link.</li>
            </ul>
          </div>
        }
      />
    </div>
  );
}

