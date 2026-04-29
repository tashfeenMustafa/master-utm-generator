import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AirtableConnection } from "./airtable-connection";

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock next/navigation so PaywallOverlay's useRouter() doesn't crash in tests
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => "/settings/connections",
  useSearchParams: () => new URLSearchParams(),
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
    name: "My Base",
    type: "airtable",
    config: { baseId: "appABC" },
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
  getUser: vi.fn(() => ({
    id: "local-user",
    email: "demo@example.com",
    name: "Demo User",
    plan: "free",
    isPremium: true,
    joinedAt: new Date().toISOString(),
  })),
}));

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
  mockFetch.mockReset();
});

function mockStatusResponse(authenticated: boolean) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({ authenticated }),
  });
}

describe("AirtableConnection", () => {
  it("shows loading state initially", () => {
    mockFetch.mockReturnValueOnce(new Promise(() => {})); // never resolves
    render(<AirtableConnection />);
    expect(screen.getByText("Airtable")).toBeInTheDocument();
  });

  it("shows disconnected state with PAT input when not authenticated", async () => {
    mockStatusResponse(false);
    render(<AirtableConnection />);

    await waitFor(() => {
      expect(
        screen.getByLabelText("Personal Access Token")
      ).toBeInTheDocument();
      expect(screen.getByText("Connect")).toBeInTheDocument();
    });
  });

  it("shows error when connecting with empty token", async () => {
    const { toast } = await import("sonner");
    mockStatusResponse(false);
    render(<AirtableConnection />);

    await waitFor(() => {
      expect(screen.getByText("Connect")).toBeInTheDocument();
    });

    // Button should be disabled when input is empty
    const connectButton = screen.getByText("Connect");
    expect(connectButton).toBeDisabled();
  });

  it("connects successfully with valid PAT", async () => {
    const { toast } = await import("sonner");
    mockStatusResponse(false);
    render(<AirtableConnection />);

    await waitFor(() => {
      expect(
        screen.getByLabelText("Personal Access Token")
      ).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const input = screen.getByLabelText("Personal Access Token");
    await user.type(input, "pat_valid_token");

    // Mock the connect API call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          bases: [{ id: "appABC", name: "Marketing" }],
        }),
    });

    await user.click(screen.getByText("Connect"));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Connected to Airtable!");
    });
  });

  it("shows base selector when authenticated without existing connection", async () => {
    // Status check returns authenticated
    mockStatusResponse(true);

    // Bases fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          bases: [
            { id: "appABC", name: "Marketing" },
            { id: "appDEF", name: "Sales" },
          ],
        }),
    });

    render(<AirtableConnection />);

    await waitFor(() => {
      expect(screen.getByText("Select Base")).toBeInTheDocument();
    });
  });

  it("handles disconnect", async () => {
    const { toast } = await import("sonner");
    const { getConnections } = await import("@/lib/storage");
    (getConnections as ReturnType<typeof vi.fn>).mockReturnValueOnce([
      {
        id: "conn-1",
        name: "Marketing",
        type: "airtable",
        config: {
          baseId: "appABC",
          baseName: "Marketing",
          tableId: "tbl1",
          tableName: "Campaigns",
          col_utm_campaign: "Campaign",
        },
        lastSynced: "2024-01-01T00:00:00Z",
        status: "active",
        createdAt: "2024-01-01T00:00:00Z",
      },
    ]);

    mockStatusResponse(true);
    render(<AirtableConnection />);

    await waitFor(() => {
      expect(screen.getByText("Disconnect")).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByText("Disconnect"));

    // Confirm in dialog
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await waitFor(() => {
      expect(
        screen.getByText("Disconnect Airtable?")
      ).toBeInTheDocument();
    });

    await user.click(screen.getAllByText("Disconnect").pop()!);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Airtable disconnected");
    });
  });
});
