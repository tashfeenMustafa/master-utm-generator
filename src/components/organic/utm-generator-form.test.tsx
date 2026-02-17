import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UtmGeneratorForm } from "./utm-generator-form";
import * as storage from "@/lib/storage";
import { toast } from "sonner";

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    dismiss: vi.fn(),
  }),
}));

vi.mock("@/lib/storage", () => ({
  getValues: vi.fn(() => []),
  addValue: vi.fn(() => ({ id: "v1" })),
  addLink: vi.fn((data) => ({
    ...data,
    id: "link-1",
    createdAt: new Date().toISOString(),
  })),
}));

const mockAddLink = vi.mocked(storage.addLink);
const mockAddValue = vi.mocked(storage.addValue);

describe("UtmGeneratorForm", () => {
  const user = userEvent.setup();
  let onGenerated: ReturnType<typeof vi.fn>;
  let onCancel: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    onGenerated = vi.fn();
    onCancel = vi.fn();
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = vi.fn();
  });

  function renderForm() {
    return render(
      <UtmGeneratorForm onGenerated={onGenerated} onCancel={onCancel} />
    );
  }

  it("renders all initial fields", () => {
    renderForm();
    expect(screen.getByLabelText("Base URL")).toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: /channel type/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/utm_campaign/)).toBeInTheDocument();
    expect(screen.getByLabelText(/utm_term/)).toBeInTheDocument();
    expect(screen.getByLabelText(/content hook/i)).toBeInTheDocument();
  });

  it("shows validation errors on empty submit", async () => {
    renderForm();
    await user.click(screen.getByRole("button", { name: "Generate" }));
    expect(screen.getByText("Base URL is required.")).toBeInTheDocument();
    expect(screen.getByText("Select a channel type.")).toBeInTheDocument();
    expect(screen.getByText("Campaign is required.")).toBeInTheDocument();
    expect(onGenerated).not.toHaveBeenCalled();
  });

  it("shows URL validation error for invalid URL", async () => {
    renderForm();
    await user.type(screen.getByLabelText("Base URL"), "not-a-url");
    await user.click(screen.getByRole("button", { name: "Generate" }));
    expect(screen.getByText("Enter a valid URL with https://.")).toBeInTheDocument();
  });

  it("shows platform selector after selecting channel type", async () => {
    renderForm();
    await user.click(screen.getByRole("radio", { name: "Organic Social" }));
    expect(screen.getByLabelText("Platform")).toBeInTheDocument();
  });

  it("auto-selects Google for blog channel", async () => {
    renderForm();
    await user.click(screen.getByRole("radio", { name: "Blog" }));
    const platformInput = screen.getByLabelText("Platform");
    expect(platformInput).toBeDisabled();
    expect(platformInput).toHaveValue("Google");
  });

  it("shows utm_source and utm_medium badges after selecting channel and platform", async () => {
    renderForm();
    await user.click(screen.getByRole("radio", { name: "Blog" }));
    const badges = screen.getAllByText("google");
    expect(badges.length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("organic_search").length).toBeGreaterThanOrEqual(1);
  });

  it("hides post format for blog channel", async () => {
    renderForm();
    await user.click(screen.getByRole("radio", { name: "Blog" }));
    expect(screen.queryByLabelText("Post Format")).not.toBeInTheDocument();
  });

  it("shows Blog Content Title label for blog channel", async () => {
    renderForm();
    await user.click(screen.getByRole("radio", { name: "Blog" }));
    expect(screen.getByLabelText("Blog Content Title")).toBeInTheDocument();
  });

  it("shows snake_case preview for utm_campaign input", async () => {
    renderForm();
    await user.type(screen.getByLabelText(/utm_campaign/), "Brand Awareness");
    // Preview appears in both the field preview and the URL preview section
    const matches = screen.getAllByText("brand_awareness");
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("calls onCancel when Cancel is clicked", async () => {
    renderForm();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalled();
  });

  it("shows live URL preview section", () => {
    renderForm();
    expect(screen.getByText("Preview")).toBeInTheDocument();
  });

  it("generates a link for blog channel with valid inputs", { timeout: 15000 }, async () => {
    renderForm();

    await user.type(screen.getByLabelText("Base URL"), "https://example.com/post");
    await user.click(screen.getByRole("radio", { name: "Blog" }));
    await user.type(screen.getByLabelText(/utm_campaign/), "brand_awareness");
    await user.type(screen.getByLabelText("Blog Content Title"), "How to Build a Brand");

    await user.click(screen.getByRole("button", { name: "Generate" }));

    expect(mockAddLink).toHaveBeenCalledWith(
      expect.objectContaining({
        baseUrl: "https://example.com/post",
        utm_source: "google",
        utm_medium: "organic_search",
        utm_campaign: "brand_awareness",
      })
    );
    expect(toast.success).toHaveBeenCalledWith("UTM link generated!");
    expect(onGenerated).toHaveBeenCalled();
  });

  it("auto-saves campaign value on generate", { timeout: 15000 }, async () => {
    renderForm();

    await user.type(screen.getByLabelText("Base URL"), "https://example.com");
    await user.click(screen.getByRole("radio", { name: "Blog" }));
    await user.type(screen.getByLabelText(/utm_campaign/), "new_campaign");
    await user.type(screen.getByLabelText("Blog Content Title"), "My Blog Post");

    await user.click(screen.getByRole("button", { name: "Generate" }));

    expect(mockAddValue).toHaveBeenCalledWith(
      expect.objectContaining({
        parameter: "utm_campaign",
        value: "new_campaign",
        source: "auto",
      })
    );
  });

  // ── Feature 11: Field Validation & Guidance tests ──────────────

  it("validates Base URL on blur", async () => {
    renderForm();
    const input = screen.getByLabelText("Base URL");
    await user.type(input, "not-a-url");
    await user.tab(); // trigger blur
    expect(screen.getByText("Enter a valid URL with https://.")).toBeInTheDocument();
  });

  it("validates utm_campaign on blur when empty", async () => {
    renderForm();
    const input = screen.getByLabelText(/utm_campaign/);
    await user.click(input);
    await user.tab(); // trigger blur
    expect(screen.getByText("Campaign is required.")).toBeInTheDocument();
  });

  it("validates content hook on blur when too short", async () => {
    renderForm();
    const input = screen.getByLabelText(/Content Hook/i);
    await user.type(input, "x");
    await user.tab(); // trigger blur
    expect(screen.getByText("Minimum 2 characters.")).toBeInTheDocument();
  });

  it("clears field error on new input after blur validation", async () => {
    renderForm();
    const input = screen.getByLabelText("Base URL");
    await user.type(input, "bad");
    await user.tab(); // trigger blur — shows error
    expect(screen.getByText("Enter a valid URL with https://.")).toBeInTheDocument();
    await user.clear(input);
    await user.type(input, "https://example.com");
    // Error should be cleared by onChange
    expect(screen.queryByText("Enter a valid URL with https://.")).not.toBeInTheDocument();
  });

  it("shows Generate button with muted styling when form is incomplete", () => {
    renderForm();
    const btn = screen.getByRole("button", { name: "Generate" });
    expect(btn.className).toContain("opacity-60");
  });

  it("shows Generate button without muted styling when form is complete", async () => {
    renderForm();

    await user.type(screen.getByLabelText("Base URL"), "https://example.com");
    await user.click(screen.getByRole("radio", { name: "Blog" }));
    await user.type(screen.getByLabelText(/utm_campaign/), "brand_awareness");
    await user.type(screen.getByLabelText("Blog Content Title"), "How to Build a Brand");

    const btn = screen.getByRole("button", { name: "Generate" });
    expect(btn.className).not.toContain("opacity-60");
  });

  it("scrolls to first error on Generate click", async () => {
    renderForm();
    await user.click(screen.getByRole("button", { name: "Generate" }));
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "center",
    });
  });

  it("shows contextual helper text for utm_campaign", () => {
    renderForm();
    expect(
      screen.getByText("e.g., brand_awareness, product_launch_q1")
    ).toBeInTheDocument();
  });

  it("shows contextual helper text for utm_term", () => {
    renderForm();
    expect(
      screen.getByText("e.g., social_proof, customer_stories")
    ).toBeInTheDocument();
  });

  it("shows contextual helper text for content hook", () => {
    renderForm();
    expect(
      screen.getByText("e.g., 5_tips_for_growth, behind_the_scenes")
    ).toBeInTheDocument();
  });

  it("shows blog-specific helper text for blog content title", async () => {
    renderForm();
    await user.click(screen.getByRole("radio", { name: "Blog" }));
    expect(
      screen.getByText("e.g., how_to_build_a_brand, ultimate_guide_seo")
    ).toBeInTheDocument();
  });

  it("shows ??? placeholders in URL preview for missing required params", () => {
    renderForm();
    const preview = screen.getByText("Preview").parentElement!;
    // The preview URL string should contain ??? for missing params
    const previewText = preview.querySelector(".font-mono.break-all")!.textContent!;
    expect(previewText).toContain("utm_campaign=%3F%3F%3F");
  });
});
