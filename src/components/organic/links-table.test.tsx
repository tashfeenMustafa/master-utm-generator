import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LinksTable } from "./links-table";
import * as storage from "@/lib/storage";
import { toast } from "sonner";
import type { UtmLink } from "@/lib/types";

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

vi.mock("@/lib/storage", () => ({
  getLinks: vi.fn(() => []),
  deleteLink: vi.fn(),
  getConnections: vi.fn(() => []),
}));

const mockGetLinks = vi.mocked(storage.getLinks);
const mockDeleteLink = vi.mocked(storage.deleteLink);

const mockLinks: UtmLink[] = [
  {
    id: "1",
    baseUrl: "https://example.com",
    utm_source: "facebook",
    utm_medium: "organic_social",
    utm_campaign: "spring_sale",
    utm_term: "social_proof",
    utm_content: "reels-5_tips",
    generatedUrl: "https://example.com?utm_source=facebook&utm_campaign=spring_sale",
    createdAt: "2026-02-17T10:00:00Z",
  },
  {
    id: "2",
    baseUrl: "https://example.com/blog",
    utm_source: "google",
    utm_medium: "organic_search",
    utm_campaign: "brand_awareness",
    generatedUrl: "https://example.com/blog?utm_source=google&utm_campaign=brand_awareness",
    createdAt: "2026-02-16T08:00:00Z",
  },
];

describe("LinksTable", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state when no links exist", () => {
    mockGetLinks.mockReturnValue([]);
    render(<LinksTable refreshKey={0} />);
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    expect(screen.getByText(/No UTM links generated yet/)).toBeInTheDocument();
  });

  it("renders table with links", () => {
    mockGetLinks.mockReturnValue(mockLinks);
    render(<LinksTable refreshKey={0} />);
    // Campaign values appear in the campaign column (may also appear in URL)
    expect(screen.getAllByText(/spring_sale/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/brand_awareness/).length).toBeGreaterThanOrEqual(1);
  });

  it("renders column headers", () => {
    mockGetLinks.mockReturnValue(mockLinks);
    render(<LinksTable refreshKey={0} />);
    expect(screen.getByText("Full URL")).toBeInTheDocument();
    expect(screen.getByText("Source")).toBeInTheDocument();
    expect(screen.getByText("Medium")).toBeInTheDocument();
    expect(screen.getByText("Campaign")).toBeInTheDocument();
    expect(screen.getByText("Term")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
    expect(screen.getByText("Date")).toBeInTheDocument();
  });

  it("shows dash for missing optional fields", () => {
    mockGetLinks.mockReturnValue(mockLinks);
    render(<LinksTable refreshKey={0} />);
    // The second link has no utm_term or utm_content
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThanOrEqual(2);
  });

  it("renders search input", () => {
    mockGetLinks.mockReturnValue(mockLinks);
    render(<LinksTable refreshKey={0} />);
    expect(screen.getByLabelText("Search links")).toBeInTheDocument();
  });

  it("reloads data when refreshKey changes", () => {
    mockGetLinks.mockReturnValue([]);
    const { rerender } = render(<LinksTable refreshKey={0} />);
    expect(mockGetLinks).toHaveBeenCalledTimes(1);

    mockGetLinks.mockReturnValue(mockLinks);
    rerender(<LinksTable refreshKey={1} />);
    expect(mockGetLinks).toHaveBeenCalledTimes(2);
  });

  it("copies URL to clipboard when copy button is clicked", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });
    mockGetLinks.mockReturnValue(mockLinks);

    render(<LinksTable refreshKey={0} />);
    // Click the first copy button (aria-label)
    const copyButtons = screen.getAllByRole("button", { name: "Copy URL" });
    await user.click(copyButtons[0]);

    expect(writeText).toHaveBeenCalledWith(mockLinks[0].generatedUrl);
    expect(toast.success).toHaveBeenCalledWith("URL copied to clipboard");
  });

  it("shows delete confirmation dialog", async () => {
    mockGetLinks.mockReturnValue(mockLinks);
    render(<LinksTable refreshKey={0} />);

    const deleteButtons = screen.getAllByLabelText("Delete link");
    await user.click(deleteButtons[0]);

    expect(screen.getByText("Delete this link?")).toBeInTheDocument();
    expect(screen.getByText(/This action cannot be undone/)).toBeInTheDocument();
  });

  it("deletes link after confirmation", async () => {
    mockGetLinks
      .mockReturnValueOnce(mockLinks) // initial
      .mockReturnValueOnce([mockLinks[1]]); // after delete

    render(<LinksTable refreshKey={0} />);

    const deleteButtons = screen.getAllByLabelText("Delete link");
    await user.click(deleteButtons[0]);

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(mockDeleteLink).toHaveBeenCalledWith("1");
    expect(toast.success).toHaveBeenCalledWith("Link deleted");
  });

  it("renders group-by dropdown", () => {
    mockGetLinks.mockReturnValue(mockLinks);
    render(<LinksTable refreshKey={0} />);
    expect(screen.getByText("No grouping")).toBeInTheDocument();
  });
});
