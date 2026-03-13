import { FAQAccordion } from "@/components/marketing/faq-accordion";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { faqGroups } from "@/features/marketing/content";
import { buildMetadata } from "@/lib/config/site";

type FAQPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export const metadata = buildMetadata({
  title: "FAQ",
  description: "Answer common questions about flexibility, payments, trust, and provider control.",
  path: "/faq",
});

export default async function FAQPage({ searchParams }: FAQPageProps) {
  const { q } = await searchParams;
  const query = q?.trim().toLowerCase();

  const filteredGroups = faqGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (!query) {
          return true;
        }

        return [item.question, item.answer]
          .join(" ")
          .toLowerCase()
          .includes(query);
      }),
    }))
    .filter((group) => group.items.length);

  return (
    <main className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <SectionHeading
        eyebrow="FAQ"
        title="Clear answers before the app download"
        description="Keep the copy direct, trustworthy, and aligned with the product rules."
      />
      <form className="mt-10">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search the FAQ"
          className="h-14 w-full rounded-[20px] border border-[var(--color-border)] bg-white px-5 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
        />
      </form>
      <div className="mt-10">
        {filteredGroups.length ? (
          <FAQAccordion groups={filteredGroups} />
        ) : (
          <EmptyState
            title="No FAQ items match that search"
            description="Try searching for payments, schedules, reviews, or provider control."
          />
        )}
      </div>
    </main>
  );
}
