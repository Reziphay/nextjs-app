import {
  getBrandAdminDetail,
  getReportAdminDetail,
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

  it("returns linked target context for report detail in mock mode", async () => {
    const serviceReportDetail = await getReportAdminDetail("rpt-4021");
    const reviewReportDetail = await getReportAdminDetail("rpt-4013");
    const userReportDetail = await getReportAdminDetail("rpt-3981");

    expect(serviceReportDetail?.targetService?.id).toBe("srv-922");
    expect(serviceReportDetail?.serviceProvider?.id).toBe("usr-1006");
    expect(serviceReportDetail?.serviceBrand?.id).toBe("brd-22");
    expect(reviewReportDetail?.targetService?.id).toBe("srv-812");
    expect(reviewReportDetail?.serviceBrand?.id).toBe("brd-11");
    expect(userReportDetail?.targetUser?.id).toBe("usr-1002");
    expect(userReportDetail?.serviceProvider).toBeNull();
  });
});
