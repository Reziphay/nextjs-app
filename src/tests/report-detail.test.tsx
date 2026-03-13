import { render, screen } from "@testing-library/react";

import { ReportDetail } from "@/features/admin-reports/report-detail";
import { brandRecords, reportRecords, serviceRecords, userRecords } from "@/lib/mock/admin-data";

describe("ReportDetail", () => {
  it("renders linked service, provider, and brand context", () => {
    render(
      <ReportDetail
        adminRoute="operator"
        detail={{
          report: reportRecords[0],
          targetUser: null,
          targetBrand: null,
          targetService: serviceRecords[2],
          serviceProvider: userRecords[5],
          serviceBrand: brandRecords[2],
          relatedReports: [],
        }}
      />,
    );

    expect(screen.getByText(reportRecords[0].subject)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: serviceRecords[2].name }),
    ).toHaveAttribute("href", "/operator/services/srv-922");
    expect(
      screen.getByRole("link", { name: userRecords[5].name }),
    ).toHaveAttribute("href", "/operator/users/usr-1006");
    expect(
      screen.getByRole("link", { name: brandRecords[2].name }),
    ).toHaveAttribute("href", "/operator/brands/brd-22");
    expect(screen.getByText("Action panel")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
  });
});
