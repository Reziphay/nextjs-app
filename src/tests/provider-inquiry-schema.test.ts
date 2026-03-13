import { providerInquirySchema } from "@/lib/validation/provider-inquiry";

describe("providerInquirySchema", () => {
  it("rejects incomplete provider inquiries", () => {
    const result = providerInquirySchema.safeParse({
      contactName: "",
      businessName: "",
      email: "bad-email",
      phone: "",
      sector: "",
      message: "",
    });

    expect(result.success).toBe(false);
  });
});
