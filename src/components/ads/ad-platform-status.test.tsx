import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdPlatformStatus } from "./ad-platform-status";

describe("AdPlatformStatus", () => {
  it("renders the status bar", () => {
    render(<AdPlatformStatus />);
    expect(screen.getByTestId("platform-status-bar")).toBeInTheDocument();
  });

  it("shows all three platforms", () => {
    render(<AdPlatformStatus />);
    expect(screen.getByText("Meta Ads")).toBeInTheDocument();
    expect(screen.getByText("Google Ads")).toBeInTheDocument();
    expect(screen.getByText("LinkedIn Ads")).toBeInTheDocument();
  });

  it("shows all platforms as Not Connected", () => {
    render(<AdPlatformStatus />);
    const badges = screen.getAllByText("Not Connected");
    expect(badges).toHaveLength(3);
  });

  it("renders Connect links pointing to settings", () => {
    render(<AdPlatformStatus />);
    const links = screen.getAllByRole("link", { name: "Connect" });
    expect(links).toHaveLength(3);
    for (const link of links) {
      expect(link).toHaveAttribute("href", "/settings/connections");
    }
  });
});
