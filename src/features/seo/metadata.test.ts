import { describe, expect, it } from "vitest";

import { createMetadata } from "@/features/seo/metadata";

describe("createMetadata", () => {
  it("builds canonical metadata for a route", () => {
    const metadata = createMetadata({
      description: "Page description",
      path: "/faq",
      title: "FAQ",
    });

    expect(metadata.alternates?.canonical).toBe("https://reziphay.com/faq");
    expect(metadata.description).toBe("Page description");
    expect(metadata.openGraph?.title).toBe("FAQ | Reziphay");
  });

  it("marks noindex pages correctly", () => {
    const metadata = createMetadata({
      description: "Private",
      noIndex: true,
      path: "/secret",
      title: "Secret",
    });

    expect(metadata.robots).toEqual({
      follow: false,
      index: false,
    });
  });
});

