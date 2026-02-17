import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { Sidebar } from "./sidebar";

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

// Stub Tooltip — render trigger children only, skip content to avoid duplicates
vi.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({
    children,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
  }) => <>{children}</>,
  TooltipContent: () => null,
  TooltipProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// ── Helpers ──────────────────────────────────────────────────────

function getNavLink(name: string) {
  const links = screen.getAllByRole("link");
  return links.find((link) => within(link).queryByText(name)) ?? null;
}

// ── Tests ────────────────────────────────────────────────────────

describe("Sidebar", () => {
  beforeEach(() => {
    mockPathname = "/organic";
  });

  it("renders all three navigation items", () => {
    render(<Sidebar />);
    expect(getNavLink("Organic & DMs")).toBeInTheDocument();
    expect(getNavLink("Ads")).toBeInTheDocument();
    expect(getNavLink("Settings")).toBeInTheDocument();
  });

  it("renders correct hrefs for each nav item", () => {
    render(<Sidebar />);
    expect(getNavLink("Organic & DMs")).toHaveAttribute("href", "/organic");
    expect(getNavLink("Ads")).toHaveAttribute("href", "/ads");
    expect(getNavLink("Settings")).toHaveAttribute("href", "/settings");
  });

  it("renders the collapsed and expanded logo text", () => {
    render(<Sidebar />);
    expect(screen.getByText("G")).toBeInTheDocument();
    expect(screen.getByText("Get Levrg - Master UTM Generator")).toBeInTheDocument();
  });

  it("marks the active nav item when pathname matches exactly", () => {
    mockPathname = "/ads";
    render(<Sidebar />);
    expect(getNavLink("Ads")?.className).toContain("bg-white/15");
  });

  it("marks the active nav item when pathname is a sub-route", () => {
    mockPathname = "/settings/values";
    render(<Sidebar />);
    expect(getNavLink("Settings")?.className).toContain("bg-white/15");
  });

  it("does not mark non-active items as active", () => {
    mockPathname = "/organic";
    render(<Sidebar />);
    expect(getNavLink("Ads")?.className).not.toContain("bg-white/15");
    expect(getNavLink("Settings")?.className).not.toContain("bg-white/15");
  });

  it("renders as an aside with a nav element", () => {
    const { container } = render(<Sidebar />);
    expect(container.querySelector("aside")).toBeInTheDocument();
    expect(container.querySelector("nav")).toBeInTheDocument();
  });
});
