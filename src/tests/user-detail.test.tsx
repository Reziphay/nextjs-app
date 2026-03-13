import { render, screen } from "@testing-library/react";

import { UserDetailState } from "@/features/admin-users/user-detail";
import { brandRecords, serviceRecords, userRecords } from "@/lib/mock/admin-data";

describe("UserDetailState", () => {
  it("renders loading, error, and success states", () => {
    const { container, rerender } = render(<UserDetailState state="loading" />);

    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();

    rerender(<UserDetailState state="error" />);
    expect(screen.getByText("User data could not be loaded")).toBeInTheDocument();

    rerender(
      <UserDetailState
        state="ready"
        adminRoute="operator"
        detail={{
          user: userRecords[0],
          relatedBrands: brandRecords.filter((brand) =>
            userRecords[0].linkedBrandIds.includes(brand.id),
          ),
          relatedServices: serviceRecords.filter((service) =>
            userRecords[0].linkedServiceIds.includes(service.id),
          ),
          relatedReports: [],
        }}
      />,
    );

    expect(screen.getByText(userRecords[0].name)).toBeInTheDocument();
    expect(screen.getByText("Completed reservations")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: brandRecords[0].name }),
    ).toHaveAttribute("href", "/operator/brands/brd-11");
  });
});
