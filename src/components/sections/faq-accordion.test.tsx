import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const trackEventMock = vi.fn();

vi.mock("@/features/analytics/track", () => ({
  buildTrackingPayload: vi.fn(),
  trackEvent: (...args: unknown[]) => trackEventMock(...args),
}));

import { FaqAccordion } from "@/components/sections/faq-accordion";

describe("FaqAccordion", () => {
  beforeEach(() => {
    trackEventMock.mockReset();
  });

  it("tracks expanded questions", async () => {
    const user = userEvent.setup();

    render(
      <FaqAccordion
        items={[
          {
            answer: "Answer",
            question: "What is Reziphay?",
          },
        ]}
        surface="faq-page"
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "What is Reziphay?",
      }),
    );

    expect(trackEventMock).toHaveBeenCalledWith("faq_expand", {
      question: "What is Reziphay?",
      surface: "faq-page",
    });
  });
});
