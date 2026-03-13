import { getBrands, getReports, getServices, getUsers } from "@/lib/api/admin";

describe("admin list filtering and pagination", () => {
  it("filters reports by status and paginates results", async () => {
    const result = await getReports({ status: "open", page: 1 });

    expect(result.total).toBe(2);
    expect(result.items).toHaveLength(2);
    expect(result.counts.open).toBe(2);
  });

  it("paginates users when no filters are applied", async () => {
    const result = await getUsers({ page: 2 });

    expect(result.total).toBe(6);
    expect(result.page).toBe(2);
    expect(result.items).toHaveLength(2);
  });

  it("filters brands and services by their operational status", async () => {
    const brands = await getBrands({ status: "flagged" });
    const services = await getServices({ status: "active" });

    expect(brands.items.every((brand) => brand.status === "flagged")).toBe(true);
    expect(services.items.every((service) => service.status === "active")).toBe(true);
  });
});
