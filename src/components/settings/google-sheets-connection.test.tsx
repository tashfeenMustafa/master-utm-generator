import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GoogleSheetsConnection } from "./google-sheets-connection";

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock storage module
vi.mock("@/lib/storage", () => ({
  getConnections: vi.fn(() => []),
  saveConnection: vi.fn((data) => ({
    id: "conn-1",
    createdAt: new Date().toISOString(),
    ...data,
  })),
  updateConnection: vi.fn((id, data) => ({
    id,
    name: "My Sheet",
    type: "google_sheets",
    config: { sheetId: "abc123" },
    lastSynced: null,
    status: "active",
    createdAt: new Date().toISOString(),
    ...data,
  })),
  deleteConnection: vi.fn(),
  deleteValuesBySource: vi.fn(),
  addValue: vi.fn((data) => ({
    id: "val-1",
    createdAt: new Date().toISOString(),
    ...data,
  })),
}));

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
  mockFetch.mockReset();

  // Mock window.history.replaceState
  vi.stubGlobal("history", {
    ...window.history,
    replaceState: vi.fn(),
  });
});

function mockStatusResponse(authenticated: boolean) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({ authenticated }),
  });
}

describe("GoogleSheetsConnection", () => {
  it("shows loading state initially", () => {
    mockFetch.mockReturnValueOnce(new Promise(() => {})); // never resolves
    render(<GoogleSheetsConnection />);
    expect(screen.getByText("Google Sheets")).toBeInTheDocument();
  });

  it("shows disconnected state when not authenticated", async () => {
    mockStatusResponse(false);
    render(<GoogleSheetsConnection />);

    await waitFor(() => {
      expect(screen.getByText("Connect Google Sheets")).toBeInTheDocument();
    });
  });

  it("shows sheet URL input when authenticated", async () => {
    mockStatusResponse(true);
    render(<GoogleSheetsConnection />);

    await waitFor(() => {
      expect(screen.getByLabelText("Google Sheet URL")).toBeInTheDocument();
    });
  });

  it("connect button links to OAuth endpoint", async () => {
    mockStatusResponse(false);
    render(<GoogleSheetsConnection />);

    await waitFor(() => {
      const link = screen.getByText("Connect Google Sheets").closest("a");
      expect(link).toHaveAttribute("href", "/api/google/auth");
    });
  });

  it("shows error for invalid sheet URL", async () => {
    const { toast } = await import("sonner");
    mockStatusResponse(true);
    render(<GoogleSheetsConnection />);

    await waitFor(() => {
      expect(screen.getByLabelText("Google Sheet URL")).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const input = screen.getByLabelText("Google Sheet URL");
    await user.type(input, "not-a-valid-url");
    await user.click(screen.getByText("Load"));

    expect(toast.error).toHaveBeenCalledWith("Invalid Google Sheets URL");
  });
});
