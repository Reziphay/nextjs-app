import { visibilityLabelSchema } from "@/lib/validation/visibility";

describe("visibilityLabelSchema", () => {
  it("rejects incomplete visibility assignments", () => {
    const result = visibilityLabelSchema.safeParse({
      label: "",
      targetId: "",
      startsAt: "",
      endsAt: "",
      note: "",
    });

    expect(result.success).toBe(false);
  });
});
