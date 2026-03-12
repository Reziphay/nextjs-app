"use client";

import { trackEvent } from "@/features/analytics/track";
import type { FaqItem } from "@/types/content";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FaqAccordionProps {
  items: FaqItem[];
  surface?: string;
}

export function FaqAccordion({
  items,
  surface = "faq-page",
}: FaqAccordionProps) {
  return (
    <Accordion
      className="space-y-3"
      collapsible
      onValueChange={(value) => {
        if (!value) {
          return;
        }

        trackEvent("faq_expand", {
          question: value,
          surface,
        });
      }}
      type="single"
    >
      {items.map((item) => (
        <AccordionItem key={item.question} value={item.question}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
