import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MobileNav } from "./mobile-nav";

// ── Mocks ────────────────────────────────────────────────────────

let mockPathname = "/organic";

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

// ── Helpers ──────────────────────────────────────────────────────

function getNavLink(name: string) {
  const links = screen.getAllByRole("link");
  return links.find((link) => within(link).queryByText(name)) ?? null;
}

// ── Tests ────────────────────────────────────────────────────────

describe("MobileNav", () => {
  beforeEach(() => {
    mockPathname = "/organic";
  });

  it("renders all three navigation items", () => {
    render(<MobileNav />);
    expect(getNavLink("Organic & DMs")).toBeInTheDocument();
    expect(getNavLink("Ads")).toBeInTheDocument();
    expect(getNavLink("Settings")).toBeInTheDocument();
  });

  it("renders correct hrefs for each nav item", () => {
    render(<MobileNav />);
    expect(getNavLink("Organic & DMs")).toHaveAttribute("href", "/organic");
    expect(getNavLink("Ads")).toHaveAttribute("href", "/ads");
    expect(getNavLink("Settings")).toHaveAttribute("href", "/settings");
  });

  it("marks the active nav item with text-primary class", () => {
    mockPathname = "/ads";
    render(<MobileNav />);
    expect(getNavLink("Ads")?.className).toContain("text-primary");
  });

  it("marks active for sub-routes", () => {
    mockPathname = "/settings/connections";
    render(<MobileNav />);
    expect(getNavLink("Settings")?.className).toContain("text-primary");
  });

  it("does not mark non-active items with text-primary", () => {
    mockPathname = "/organic";
    render(<MobileNav />);
    expect(getNavLink("Ads")?.className).not.toContain("text-primary");
    expect(getNavLink("Settings")?.className).not.toContain("text-primary");
  });

  it("renders as a nav element with exactly three links", () => {
    const { container } = render(<MobileNav />);
    expect(container.querySelector("nav")).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(3);
  });
});
