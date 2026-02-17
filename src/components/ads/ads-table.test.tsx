import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdsTable } from "./ads-table";
import { toast } from "sonner";

// Polyfill ResizeObserver for jsdom
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    dismiss: vi.fn(),
  }),
}));

describe("AdsTable", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the table with mock data", () => {
    render(<AdsTable />);
    // Should show column headers
    expect(screen.getByText("UTM URL")).toBeInTheDocument();
    expect(screen.getByText("Platform")).toBeInTheDocument();
    expect(screen.getByText("Source")).toBeInTheDocument();
    expect(screen.getByText("Medium")).toBeInTheDocument();
    expect(screen.getByText("Campaign")).toBeInTheDocument();
    expect(screen.getByText("Term")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Last Updated")).toBeInTheDocument();
  });

  it("renders search input", () => {
    render(<AdsTable />);
    expect(screen.getByLabelText("Search campaigns")).toBeInTheDocument();
  });

  it("renders group-by dropdown", () => {
    render(<AdsTable />);
    expect(screen.getByText("No grouping")).toBeInTheDocument();
  });

  it("renders status filter dropdown", () => {
    render(<AdsTable />);
    expect(screen.getByText("All statuses")).toBeInTheDocument();
  });

  it("shows platform names in the table", () => {
    render(<AdsTable />);
    expect(screen.getAllByText("Meta").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Google").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("LinkedIn").length).toBeGreaterThanOrEqual(1);
  });

  it("shows campaign data", () => {
    render(<AdsTable />);
    // Check for some campaign names from mock data
    expect(screen.getAllByText(/spring_sale/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/search_brand_terms/).length).toBeGreaterThanOrEqual(1);
  });

  it("renders copy template buttons", () => {
    render(<AdsTable />);
    const copyButtons = screen.getAllByRole("button", { name: "Copy UTM Template" });
    expect(copyButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("copies UTM template to clipboard when copy button is clicked", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    render(<AdsTable />);
    const copyButtons = screen.getAllByRole("button", { name: "Copy UTM Template" });
    await user.click(copyButtons[0]);

    expect(writeText).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("UTM template copied to clipboard");
  });

  it("shows status badges", () => {
    render(<AdsTable />);
    expect(screen.getAllByText("active").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("paused").length).toBeGreaterThanOrEqual(1);
  });

  it("shows dash for missing optional fields", () => {
    render(<AdsTable />);
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });
});
