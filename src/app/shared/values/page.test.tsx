import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SharedValuesPage from "./page";
import { compressValues } from "@/lib/sharing";

// ── Mocks ────────────────────────────────────────────────────────

let mockQueryParams = new URLSearchParams();
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockQueryParams,
  useRouter: () => ({
    push: mockPush,
  }),
}));

const testLibrary = {
  name: "Team Naming",
  values: [
    { parameter: "utm_campaign" as const, value: "winter_sale", label: "Winter Sale" },
    { parameter: "utm_term" as const, value: "search", label: "Search term" },
  ],
};

const validToken = compressValues(testLibrary);

describe("SharedValuesPage", () => {
  beforeEach(() => {
    mockQueryParams = new URLSearchParams();
    mockPush.mockClear();
    localStorage.clear();
  });

  it("renders error state when no token is provided", () => {
    render(<SharedValuesPage />);
    expect(screen.getByText(/Invalid or Missing Library/i)).toBeInTheDocument();
  });

  it("renders error state for invalid token", () => {
    mockQueryParams.set("lib", "invalid-token");
    render(<SharedValuesPage />);
    expect(screen.getByText(/Invalid or Missing Library/i)).toBeInTheDocument();
  });

  it("renders library details when valid token is provided", () => {
    mockQueryParams.set("lib", validToken);
    render(<SharedValuesPage />);
    
    expect(screen.getByText("Team Naming")).toBeInTheDocument();
    expect(screen.getByText("Winter Sale")).toBeInTheDocument();
    expect(screen.getByText("winter_sale")).toBeInTheDocument();
    expect(screen.getByText("Search term")).toBeInTheDocument();
  });

  it("imports values to localStorage when button is clicked", () => {
    mockQueryParams.set("lib", validToken);
    render(<SharedValuesPage />);
    
    const importButton = screen.getByText(/Import to My Library/i);
    fireEvent.click(importButton);
    
    // Check localStorage (via storage logic side effect)
    const stored = JSON.parse(localStorage.getItem("utm-generator:values") || "[]");
    expect(stored).toHaveLength(2);
    expect(stored[0].value).toBe("winter_sale");
    
    // UI should switch to "View in My Library"
    expect(screen.getByText(/View in My Library/i)).toBeInTheDocument();
  });

  it("navigates to dashboard on back click", () => {
    render(<SharedValuesPage />);
    const backButton = screen.getByText(/Back/i);
    fireEvent.click(backButton);
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });
});
