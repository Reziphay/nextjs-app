import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CtaLink } from "@/components/marketing/cta-link";
import { PageHero } from "@/components/sections/page-hero";

describe("PageHero", () => {
  it("renders hero CTA links", () => {
    render(
      <PageHero
        actions={
          <>
            <CtaLink href="/download">Download flow</CtaLink>
            <CtaLink href="/for-providers" variant="outline">
              For providers
            </CtaLink>
          </>
        }
        aside={<div>Aside content</div>}
        hero={{
          description: "Hero description",
          eyebrow: "Hero eyebrow",
          title: "Hero title",
        }}
      />,
    );

    expect(
      screen.getByRole("link", {
        name: "Download flow",
      }),
    ).toHaveAttribute("href", "/download");
    expect(
      screen.getByRole("link", {
        name: "For providers",
      }),
    ).toHaveAttribute("href", "/for-providers");
  });
});
