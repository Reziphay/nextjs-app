import { render, screen } from "@testing-library/react";

import { AnalyticsOverview } from "@/features/admin-analytics/analytics-overview";

describe("AnalyticsOverview", () => {
  it("renders a safe fallback when analytics data is unavailable", () => {
    render(<AnalyticsOverview series={null} />);

    expect(screen.getByText("No analytics data yet")).toBeInTheDocument();
  });
});
