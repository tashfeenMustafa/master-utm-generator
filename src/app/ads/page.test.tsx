import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AdsPage from "./page";

// Polyfill ResizeObserver for jsdom
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

// Mock sonner so toast calls don't break
vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    dismiss: vi.fn(),
  }),
}));

// Mock next/link since we're in jsdom
vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

describe("AdsPage", () => {
  it("renders without the 'state update before mount' error", () => {
    // This test specifically validates the fix: before adding "use client"
    // and the missing cn import, rendering AdsPage would throw a React error.
    expect(() => render(<AdsPage />)).not.toThrow();
  });

  it("renders the page heading", () => {
    render(<AdsPage />);
    expect(screen.getByText("Ads")).toBeInTheDocument();
  });

  it("renders the mock data info banner", () => {
    render(<AdsPage />);
    expect(screen.getByText(/Showing mock data/)).toBeInTheDocument();
  });

  it("renders the Settings link inside the info banner", () => {
    render(<AdsPage />);
    const settingsLink = screen.getByRole("link", { name: "Settings" });
    expect(settingsLink).toHaveAttribute("href", "/settings/connections");
  });

  it("renders the AdPlatformStatus bar", () => {
    render(<AdsPage />);
    expect(screen.getByTestId("platform-status-bar")).toBeInTheDocument();
  });

  it("renders the AdsTable with column headers", () => {
    render(<AdsPage />);
    expect(screen.getByText("UTM URL")).toBeInTheDocument();
    expect(screen.getByText("Platform")).toBeInTheDocument();
    expect(screen.getByText("Campaign")).toBeInTheDocument();
  });
});
