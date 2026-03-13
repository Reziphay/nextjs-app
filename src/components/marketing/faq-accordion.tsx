type FAQAccordionProps = {
  groups: Array<{
    title: string;
    items: Array<{
      question: string;
      answer: string;
    }>;
  }>;
};

export function FAQAccordion({ groups }: FAQAccordionProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {groups.map((group) => (
        <div key={group.title} className="space-y-4">
          <h3 className="text-lg font-semibold text-[var(--color-ink)]">
            {group.title}
          </h3>
          {group.items.map((item) => (
            <details
              key={item.question}
              className="group rounded-[20px] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-soft)]"
            >
              <summary className="cursor-pointer list-none pr-6 text-sm font-medium text-[var(--color-ink)]">
                {item.question}
              </summary>
              <p className="mt-3 text-sm leading-7 text-[var(--color-ink-muted)]">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      ))}
    </div>
  );
}
