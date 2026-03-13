import { render, screen } from "@testing-library/react";

import { ReportsTable } from "@/features/admin-reports/reports-table";
import { getReports } from "@/lib/api/admin";

describe("ReportsTable", () => {
  it("loads and filters reports correctly", async () => {
    const reports = await getReports({ query: "duplicate" });

    render(<ReportsTable adminRoute="operator" records={reports.items} />);

    expect(screen.getByText("Spam beauty listing with fake address")).toBeInTheDocument();
    expect(screen.getByText("Duplicate barber brand profile")).toBeInTheDocument();
    expect(screen.queryByText("Provider reply contains abuse")).not.toBeInTheDocument();
  });
});
