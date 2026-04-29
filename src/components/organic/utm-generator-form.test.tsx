import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UtmGeneratorForm } from "./utm-generator-form";
import * as storage from "@/lib/storage";
import { toast } from "sonner";
import type { SourceType, NamingConventions } from "@/lib/types";

// ── Default source types matching StorageInitializer ─────────────
const DEFAULT_SOURCE_TYPES: SourceType[] = [
  {
    id: "st-organic",
    name: "Organic Social",
    utm_source: "auto",
    utm_medium: "organic_social",
    platforms: ["facebook", "instagram", "linkedin", "tiktok", "x_twitter", "reddit"],
    isDefault: true,
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "st-blog",
    name: "Blog",
    utm_source: "google",
    utm_medium: "organic_search",
    platforms: ["google"],
    isDefault: true,
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "st-warm",
    name: "Warm DMs",
    utm_source: "auto",
    utm_medium: "warm_dms",
    platforms: ["instagram", "linkedin", "tiktok", "x_twitter", "facebook", "reddit"],
    isDefault: true,
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "st-cold",
    name: "Cold DMs",
    utm_source: "auto",
    utm_medium: "cold_dms",
    platforms: ["instagram", "linkedin", "tiktok", "x_twitter", "facebook", "reddit"],
    isDefault: true,
    createdAt: "2026-01-01T00:00:00Z",
  },
];

const DEFAULT_CONVENTIONS: NamingConventions = {
  utm_campaign: { parameter: "utm_campaign", rule: "snake_case" },
  utm_term: { parameter: "utm_term", rule: "snake_case" },
  utm_content: { rule: "format-hook", separator: "-" },
};

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    dismiss: vi.fn(),
  }),
}));

vi.mock("next/link", () => ({
  default: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => "/organic",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/storage", () => ({
  getValues: vi.fn(() => []),
  addValue: vi.fn(() => ({ id: "v1" })),
  addLink: vi.fn((data: any) => ({
    ...data,
    id: "link-1",
    createdAt: new Date().toISOString(),
  })),
  getSourceTypes: vi.fn(() => DEFAULT_SOURCE_TYPES),
  getNamingConventions: vi.fn(() => DEFAULT_CONVENTIONS),
  getUser: vi.fn(() => ({
    id: "local-user",
    email: "demo@example.com",
    name: "Demo User",
    plan: "free",
    isPremium: false,
    joinedAt: new Date().toISOString(),
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
    // Re-stub return values after clearAllMocks resets them
    vi.mocked(storage.getSourceTypes).mockReturnValue(DEFAULT_SOURCE_TYPES);
    vi.mocked(storage.getNamingConventions).mockReturnValue(DEFAULT_CONVENTIONS);
    vi.mocked(storage.getValues).mockReturnValue([]);
    vi.mocked(storage.addValue).mockReturnValue({ id: "v1" } as any);
    vi.mocked(storage.addLink).mockImplementation((data: any) => ({
      ...data,
      id: "link-1",
      createdAt: new Date().toISOString(),
    }));
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
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    // Campaign is now inside a Combobox — look for the label text
    expect(screen.getByText(/Campaign Name/)).toBeInTheDocument();
    expect(screen.getByText(/Content Topic/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Content Hook/i)).toBeInTheDocument();
  });

  it("shows validation errors on empty submit", async () => {
    renderForm();
    await user.click(screen.getByRole("button", { name: "Generate Magic Link" }));
    expect(screen.getByText("Base URL is required.")).toBeInTheDocument();
    expect(screen.getByText("Select a channel type.")).toBeInTheDocument();
    expect(screen.getByText("Campaign is required.")).toBeInTheDocument();
    expect(onGenerated).not.toHaveBeenCalled();
  });

  it("shows URL validation error for invalid URL", async () => {
    renderForm();
    await user.type(screen.getByLabelText("Base URL"), "not-a-url");
    await user.click(screen.getByRole("button", { name: "Generate Magic Link" }));
    expect(screen.getByText("Enter a valid URL with https://.")).toBeInTheDocument();
  });

  it("shows platform selector after selecting source type", async () => {
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

  it("shows utm_source and utm_medium editable inputs after selecting channel and platform", async () => {
    renderForm();
    await user.click(screen.getByRole("radio", { name: "Blog" }));
    
    const sourceInput = screen.getByLabelText(/Source Override/);
    const mediumInput = screen.getByLabelText(/Medium Override/);
    
    expect(sourceInput).toHaveValue("google");
    expect(mediumInput).toHaveValue("organic_search");
  });

  it("hides post format for blog channel", async () => {
    renderForm();
    await user.click(screen.getByRole("radio", { name: "Blog" }));
    expect(screen.queryByLabelText("Post Format")).not.toBeInTheDocument();
  });

  it("shows Blog Title label for blog channel", async () => {
    renderForm();
    await user.click(screen.getByRole("radio", { name: "Blog" }));
    expect(screen.getByLabelText(/Blog Title/)).toBeInTheDocument();
  });

  // Helper: open a combobox (click trigger) then type into the search input
  async function openComboboxAndType(triggerName: string, text: string) {
    const trigger = screen.getByRole("combobox", { name: triggerName });
    await user.click(trigger);
    // The CommandInput appears in the open popover
    const searchInput = await screen.findByPlaceholderText(new RegExp(triggerName, "i"));
    await user.type(searchInput, text);
    // Also fire onValueChange by typing directly into the combobox state.
    // Since CommandInput doesn't call onValueChange, we simulate via the trigger's
    // displayed value by selecting the typed item or closing with the typed value.
    // For free-text combos, the value is set by parent state via typing in trigger.
    // Instead: directly update the value state via the hidden Input approach won't work.
    // Use keyboard to confirm the free-text entry.
    await user.keyboard("{Enter}");
  }

  it("shows formatted campaign preview", async () => {
    renderForm();
    // Click the campaign combobox trigger button to open it
    const trigger = screen.getByRole("combobox", { name: /Type or select campaign/i });
    await user.click(trigger);
    // The CommandInput is rendered inside the open popover
    const searchInput = await screen.findByPlaceholderText(/search type or select campaign/i);
    await user.type(searchInput, "Brand Awareness");
    // Look for the formatted output in the convention hint (appears in multiple places)
    expect(screen.getAllByText(/brand_awareness/).length).toBeGreaterThanOrEqual(1);
  });

  it("calls onCancel when Cancel is clicked", async () => {
    renderForm();
    const cancelBtns = screen.getAllByRole("button", { name: "Cancel" });
    await user.click(cancelBtns[0]);
    expect(onCancel).toHaveBeenCalled();
  });

  it("shows live URL preview section", () => {
    renderForm();
    expect(screen.getByText("Review and Generate")).toBeInTheDocument();
  });

  it("generates a link for blog channel with valid inputs", { timeout: 15000 }, async () => {
    renderForm();

    await user.type(screen.getByLabelText("Base URL"), "https://example.com/post");
    await user.click(screen.getByRole("radio", { name: "Blog" }));
    
    const campaignTrigger = screen.getByRole("combobox", { name: /Type or select campaign/i });
    await user.click(campaignTrigger);
    const campaignSearchInput = await screen.findByPlaceholderText(/search type or select campaign/i);
    await user.type(campaignSearchInput, "brand_awareness");
    await user.keyboard("{Escape}"); // close popover, value updates via component state
    // Directly update the form state by typing in the combobox trigger (the value shown)
    // Since the combobox only syncs via CommandItem selection or onValueChange,
    // we trigger it via a direct state update — simulate by re-clicking and confirming
    
    await user.type(screen.getByLabelText(/Blog Title/), "How to Build a Brand");

    await user.click(screen.getByRole("button", { name: "Generate Magic Link" }));

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
    
    const campaignTrigger = screen.getByRole("combobox", { name: /Type or select campaign/i });
    await user.click(campaignTrigger);
    const campaignSearchInput = await screen.findByPlaceholderText(/search type or select campaign/i);
    await user.type(campaignSearchInput, "new_campaign");
    await user.keyboard("{Escape}");
    
    await user.type(screen.getByLabelText(/Blog Title/), "My Blog Post");

    await user.click(screen.getByRole("button", { name: "Generate Magic Link" }));

    expect(mockAddValue).toHaveBeenCalledWith(
      expect.objectContaining({
        parameter: "utm_campaign",
        value: "new_campaign",
        source: "auto",
      })
    );
  });

  // ── Field Validation & Guidance tests ──────────────

  it("validates Base URL on blur", async () => {
    renderForm();
    const input = screen.getByLabelText("Base URL");
    await user.type(input, "not-a-url");
    await user.tab(); // trigger blur
    expect(screen.getByText("Enter a valid URL with https://.")).toBeInTheDocument();
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
    const btn = screen.getByRole("button", { name: "Generate Magic Link" });
    expect(btn.className).toContain("opacity-60");
  });

  it("shows Generate button without muted styling when form is complete", async () => {
    renderForm();

    await user.type(screen.getByLabelText("Base URL"), "https://example.com");
    await user.click(screen.getByRole("radio", { name: "Blog" }));
    
    const campaignTrigger = screen.getByRole("combobox", { name: /Type or select campaign/i });
    await user.click(campaignTrigger);
    const campaignSearchInput = await screen.findByPlaceholderText(/search type or select campaign/i);
    await user.type(campaignSearchInput, "brand_awareness");
    await user.keyboard("{Escape}");
    
    await user.type(screen.getByLabelText(/Blog Title/), "How to Build a Brand");

    const btn = screen.getByRole("button", { name: "Generate Magic Link" });
    expect(btn.className).not.toContain("opacity-60");
  });

  it("scrolls to first error on Generate click", async () => {
    renderForm();
    await user.click(screen.getByRole("button", { name: "Generate Magic Link" }));
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "center",
    });
  });

  it("shows placeholder values in URL preview for missing required params", () => {
    renderForm();
    // Preview should show "???" or "Required" for missing params
    const previewArea = screen.getByLabelText("UTM Parameters Breakdown");
    expect(previewArea).toBeInTheDocument();
    expect(screen.getAllByText("Required").length).toBeGreaterThanOrEqual(1);
  });
});
