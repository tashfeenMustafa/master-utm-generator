import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ValueSection } from "./value-section";
import { toast } from "sonner";
import * as storage from "@/lib/storage";

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    dismiss: vi.fn(),
  }),
}));

vi.mock("@/lib/storage", () => ({
  getValues: vi.fn(() => []),
  addValue: vi.fn(),
  deleteValue: vi.fn(),
}));

const mockGetValues = vi.mocked(storage.getValues);
const mockAddValue = vi.mocked(storage.addValue);
const mockDeleteValue = vi.mocked(storage.deleteValue);

describe("ValueSection", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetValues.mockReturnValue([]);
  });

  it("renders empty state when no values exist", () => {
    render(<ValueSection parameter="utm_campaign" />);
    expect(screen.getByTestId("empty-state")).toHaveTextContent(
      "No values yet. Add your first value or connect a data source."
    );
  });

  it("renders the parameter heading", () => {
    render(<ValueSection parameter="utm_campaign" />);
    expect(screen.getByText("Campaign")).toBeInTheDocument();
  });

  it("shows snake_case preview while typing", async () => {
    render(<ValueSection parameter="utm_campaign" />);
    const input = screen.getByRole("textbox");
    await user.type(input, "Spring Sale");
    expect(screen.getByTestId("snake-preview")).toHaveTextContent("spring_sale");
  });

  it("adds a value and clears the input", async () => {
    const newValue = {
      id: "1",
      parameter: "utm_campaign" as const,
      value: "spring_sale",
      label: "Spring Sale",
      source: "manual" as const,
      sourceRef: null,
      createdAt: new Date().toISOString(),
    };
    mockAddValue.mockReturnValue(newValue);
    // After add, getValues returns the new value
    mockGetValues
      .mockReturnValueOnce([]) // initial render
      .mockReturnValueOnce([newValue]); // after add

    render(<ValueSection parameter="utm_campaign" />);
    const input = screen.getByRole("textbox");
    await user.type(input, "Spring Sale");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(mockAddValue).toHaveBeenCalledWith({
      parameter: "utm_campaign",
      value: "spring_sale",
      label: "Spring Sale",
      source: "manual",
      sourceRef: null,
    });
    expect(input).toHaveValue("");
    expect(toast.success).toHaveBeenCalledWith(
      'Added "spring_sale" to Campaign.'
    );
  });

  it("shows error toast on duplicate", async () => {
    mockAddValue.mockReturnValue(null);

    render(<ValueSection parameter="utm_campaign" />);
    const input = screen.getByRole("textbox");
    await user.type(input, "Spring Sale");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(toast.error).toHaveBeenCalledWith(
      '"spring_sale" already exists for Campaign.'
    );
  });

  it("renders values in list and deletes on click", async () => {
    const existing = {
      id: "1",
      parameter: "utm_campaign" as const,
      value: "spring_sale",
      label: "Spring Sale",
      source: "manual" as const,
      sourceRef: null,
      createdAt: new Date().toISOString(),
    };
    mockGetValues
      .mockReturnValueOnce([existing]) // initial render
      .mockReturnValueOnce([]); // after delete

    render(<ValueSection parameter="utm_campaign" />);
    expect(screen.getByText("Spring Sale")).toBeInTheDocument();
    expect(screen.getByText("spring_sale")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Delete spring_sale" }));

    expect(mockDeleteValue).toHaveBeenCalledWith("1");
    expect(toast.success).toHaveBeenCalledWith(
      'Removed "spring_sale" from Campaign.'
    );
  });

  it("does not add when input is empty", async () => {
    render(<ValueSection parameter="utm_campaign" />);
    const addButton = screen.getByRole("button", { name: "Add" });
    expect(addButton).toBeDisabled();
  });

  it("adds value on Enter key", async () => {
    const newValue = {
      id: "1",
      parameter: "utm_term" as const,
      value: "brand_keywords",
      label: "Brand Keywords",
      source: "manual" as const,
      sourceRef: null,
      createdAt: new Date().toISOString(),
    };
    mockAddValue.mockReturnValue(newValue);
    mockGetValues
      .mockReturnValueOnce([])
      .mockReturnValueOnce([newValue]);

    render(<ValueSection parameter="utm_term" />);
    const input = screen.getByRole("textbox");
    await user.type(input, "Brand Keywords{Enter}");

    expect(mockAddValue).toHaveBeenCalledWith({
      parameter: "utm_term",
      value: "brand_keywords",
      label: "Brand Keywords",
      source: "manual",
      sourceRef: null,
    });
    expect(input).toHaveValue("");
  });
});
