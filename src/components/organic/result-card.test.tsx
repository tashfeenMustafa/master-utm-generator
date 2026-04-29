import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResultCard } from "./result-card";
import { toast } from "sonner";
import type { UtmLink } from "@/lib/types";

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    dismiss: vi.fn(),
  }),
}));

const mockLink: UtmLink = {
  id: "test-1",
  baseUrl: "https://example.com",
  utm_source: "facebook",
  utm_medium: "organic_social",
  utm_campaign: "spring_sale",
  utm_term: "social_proof",
  utm_content: "reels-5_tips",
  generatedUrl:
    "https://example.com?utm_source=facebook&utm_medium=organic_social&utm_campaign=spring_sale&utm_term=social_proof&utm_content=reels-5_tips",
  createdAt: "2026-02-17T10:30:00Z",
};

describe("ResultCard", () => {
  const user = userEvent.setup();
  let onDismiss: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    onDismiss = vi.fn();
  });

  it("renders the full generated URL", () => {
    render(<ResultCard link={mockLink} onDismiss={onDismiss} />);
    expect(screen.getByText(mockLink.generatedUrl)).toBeInTheDocument();
  });

  it("renders the success badge", () => {
    render(<ResultCard link={mockLink} onDismiss={onDismiss} />);
    const badge = screen.getByTestId("result-card").querySelector("[data-slot='badge']");
    expect(badge).toHaveTextContent("Success");
  });

  it("renders the formatted timestamp", () => {
    render(<ResultCard link={mockLink} onDismiss={onDismiss} />);
    // Should contain "Feb 17, 2026"
    expect(screen.getByText(/Feb 17, 2026/)).toBeInTheDocument();
  });

  it("renders UTM param breakdown", () => {
    render(<ResultCard link={mockLink} onDismiss={onDismiss} />);
    expect(screen.getByText("utm_source")).toBeInTheDocument();
    expect(screen.getByText("utm_campaign")).toBeInTheDocument();
    expect(screen.getByText("spring_sale")).toBeInTheDocument();
    expect(screen.getByText("utm_term")).toBeInTheDocument();
    expect(screen.getByText("social_proof")).toBeInTheDocument();
    expect(screen.getByText("utm_content")).toBeInTheDocument();
    expect(screen.getByText("reels-5_tips")).toBeInTheDocument();
  });

  it("does not show empty optional params", () => {
    const linkNoOptionals: UtmLink = {
      ...mockLink,
      utm_term: undefined,
      utm_content: undefined,
    };
    render(<ResultCard link={linkNoOptionals} onDismiss={onDismiss} />);
    expect(screen.queryByText("utm_term")).not.toBeInTheDocument();
    expect(screen.queryByText("utm_content")).not.toBeInTheDocument();
  });

  it("copies URL to clipboard and shows success toast", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    render(<ResultCard link={mockLink} onDismiss={onDismiss} />);
    await user.click(screen.getByRole("button", { name: /copy url/i }));

    expect(writeText).toHaveBeenCalledWith(mockLink.generatedUrl);
    expect(toast.success).toHaveBeenCalledWith("URL copied to clipboard");
  });

  it("shows Copied! text after clicking copy", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    render(<ResultCard link={mockLink} onDismiss={onDismiss} />);
    await user.click(screen.getByRole("button", { name: /copy url/i }));

    expect(screen.getByText("Copied!")).toBeInTheDocument();
  });

  it("calls onDismiss when X button is clicked", async () => {
    render(<ResultCard link={mockLink} onDismiss={onDismiss} />);
    await user.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onDismiss).toHaveBeenCalled();
  });

  it("has the light blue background", () => {
    render(<ResultCard link={mockLink} onDismiss={vi.fn()} />);
    const card = screen.getByTestId("result-card");
    expect(card.className).toContain("bg-indigo-50");
  });
});
