import { buildMetadata } from "@/lib/config/site";

describe("buildMetadata", () => {
  it("builds canonical metadata for public pages", () => {
    const metadata = buildMetadata({
      title: "FAQ",
      description: "Answers",
      path: "/faq",
    });

    expect(metadata.alternates?.canonical).toBe("http://localhost:3000/faq");
    expect(metadata.title).toBe("FAQ | Reziphay");
  });
});
