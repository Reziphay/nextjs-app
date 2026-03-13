import {
  reportActionSchema,
  userActionSchema,
} from "@/lib/validation/admin-actions";

describe("admin action schemas", () => {
  it("rejects report actions without a reason", () => {
    const result = reportActionSchema.safeParse({
      action: "resolve",
      reason: "short",
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid user account actions", () => {
    const result = userActionSchema.safeParse({
      action: "ban",
      reason: "",
    });

    expect(result.success).toBe(false);
  });
});
