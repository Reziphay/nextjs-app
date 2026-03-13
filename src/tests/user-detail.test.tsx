import { render, screen } from "@testing-library/react";

import { UserDetailState } from "@/features/admin-users/user-detail";
import { userRecords } from "@/lib/mock/admin-data";

describe("UserDetailState", () => {
  it("renders loading, error, and success states", () => {
    const { container, rerender } = render(<UserDetailState state="loading" />);

    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();

    rerender(<UserDetailState state="error" />);
    expect(screen.getByText("User data could not be loaded")).toBeInTheDocument();

    rerender(<UserDetailState state="ready" user={userRecords[0]} />);
    expect(screen.getByText(userRecords[0].name)).toBeInTheDocument();
  });
});
