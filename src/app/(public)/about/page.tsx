import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { buildMetadata } from "@/lib/config/site";

export const metadata = buildMetadata({
  title: "About Reziphay",
  description: "Explain the product philosophy, moderation stance, and broad applicability.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <SectionHeading
        eyebrow="Product philosophy"
        title="A reservation mediation tool, not a payment platform and not a social app"
        description="The product stance is deliberate: flexible coordination, sector-agnostic discovery, and trust built through behavior rather than heavy-handed control."
      />
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {[
          "Intermediary system with no payment interference",
          "One account can evolve across customer and provider roles",
          "Trust is shaped by reviews, reports, and response behavior",
        ].map((item) => (
          <Card key={item}>
            <p className="font-medium text-[var(--color-ink)]">{item}</p>
          </Card>
        ))}
      </div>
      <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--color-ink)]">
            Broad sector fit
          </h2>
          <p className="mt-4 text-sm leading-8 text-[var(--color-ink-muted)]">
            Barbers, dentists, beauty experts, maintenance teams, and consultants
            can all live under the same flexible reservation philosophy. The
            website should reflect that breadth without becoming generic or vague.
          </p>
        </Card>
        <Card className="bg-[var(--color-surface)]">
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--color-ink)]">
            Moderation approach
          </h2>
          <p className="mt-4 text-sm leading-8 text-[var(--color-ink-muted)]">
            Fake or abusive entities can be flagged, closed for reservations, and
            still left publicly visible when that is safer for users.
          </p>
          <Link href="/contact" className={`${buttonStyles({ kind: "secondary" })} mt-6`}>
            Contact support
          </Link>
        </Card>
      </div>
    </main>
  );
}
