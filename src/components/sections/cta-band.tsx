import type { ReactNode } from "react";

import { CtaLink } from "@/components/marketing/cta-link";
import { SectionHeading } from "@/components/sections/section-heading";

interface CtaBandProps {
  eyebrow?: string;
  title: string;
  description: string;
  secondaryAction?: ReactNode;
}

export function CtaBand({
  eyebrow = "Ready for launch demand",
  title,
  description,
  secondaryAction,
}: CtaBandProps) {
  return (
    <div className="rounded-[2rem] border border-accent/15 bg-[#f6e4d6] px-6 py-8 sm:px-8 lg:px-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading
          description={description}
          eyebrow={eyebrow}
          title={title}
        />
        <div className="flex flex-wrap gap-3">
          <CtaLink
            analyticsEvent={{
              name: "download_section_interaction",
              properties: {
                destination: "/download",
                surface: "cta-band",
              },
            }}
            href="/download"
          >
            Download flow
          </CtaLink>
          {secondaryAction ?? (
            <CtaLink
              analyticsEvent={{
                name: "pricing_or_visibility_interest_click",
                properties: {
                  destination: "/for-providers",
                  surface: "cta-band",
                },
              }}
              href="/for-providers"
              variant="outline"
            >
              Provider interest
            </CtaLink>
          )}
        </div>
      </div>
    </div>
  );
}
