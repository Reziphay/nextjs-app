import {
  getBrandAdminDetail,
  getServiceAdminDetail,
  getUserAdminDetail,
} from "@/lib/api/admin";

describe("admin detail adapters", () => {
  it("returns linked brands and services for a user in mock mode", async () => {
    const detail = await getUserAdminDetail("usr-1001");

    expect(detail?.user.id).toBe("usr-1001");
    expect(detail?.relatedBrands.map((brand) => brand.id)).toEqual([
      "brd-11",
      "brd-22",
    ]);
    expect(detail?.relatedServices.map((service) => service.id)).toEqual([
      "srv-812",
    ]);
  });

  it("returns brand and service relationship context in mock mode", async () => {
    const brandDetail = await getBrandAdminDetail("brd-25");
    const serviceDetail = await getServiceAdminDetail("srv-922");

    expect(brandDetail?.relatedReports.map((report) => report.id)).toEqual([
      "rpt-3988",
    ]);
    expect(serviceDetail?.provider?.id).toBe("usr-1006");
    expect(serviceDetail?.brand?.id).toBe("brd-22");
    expect(serviceDetail?.relatedReports.map((report) => report.id)).toEqual([
      "rpt-4021",
    ]);
  });
});
