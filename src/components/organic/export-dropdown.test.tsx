import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExportDropdown } from "./export-dropdown";
import { toast } from "sonner";
import type { UtmLink } from "@/lib/types";

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

vi.mock("@/lib/export/csv", () => ({
  exportToCsv: vi.fn(),
  linksToRows: vi.fn(() => [["header"], ["row"]]),
}));

vi.mock("@/lib/google/parse-sheet-url", () => ({
  parseGoogleSheetUrl: vi.fn(() => null),
}));

const mockLink: UtmLink = {
  id: "1",
  baseUrl: "https://example.com",
  utm_source: "google",
  utm_medium: "cpc",
  utm_campaign: "spring",
  generatedUrl: "https://example.com?utm_source=google",
  createdAt: "2025-01-15T10:00:00Z",
};

describe("ExportDropdown", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the export button", () => {
    render(
      <ExportDropdown getFilteredRows={() => [mockLink]} hasGoogleSheets={false} />
    );
    expect(screen.getByTestId("export-button")).toBeInTheDocument();
  });

  it("shows CSV option when dropdown is open", async () => {
    render(
      <ExportDropdown getFilteredRows={() => [mockLink]} hasGoogleSheets={false} />
    );
    await user.click(screen.getByTestId("export-button"));
    expect(screen.getByTestId("export-csv")).toBeInTheDocument();
    expect(screen.getByText("Export as CSV")).toBeInTheDocument();
  });

  it("does not show Google Sheets option when hasGoogleSheets is false", async () => {
    render(
      <ExportDropdown getFilteredRows={() => [mockLink]} hasGoogleSheets={false} />
    );
    await user.click(screen.getByTestId("export-button"));
    expect(screen.queryByTestId("export-google-sheets")).not.toBeInTheDocument();
  });

  it("shows Google Sheets option when hasGoogleSheets is true", async () => {
    render(
      <ExportDropdown getFilteredRows={() => [mockLink]} hasGoogleSheets={true} />
    );
    await user.click(screen.getByTestId("export-button"));
    expect(screen.getByTestId("export-google-sheets")).toBeInTheDocument();
  });

  it("shows toast when exporting CSV with no data", async () => {
    render(
      <ExportDropdown getFilteredRows={() => []} hasGoogleSheets={false} />
    );
    await user.click(screen.getByTestId("export-button"));
    await user.click(screen.getByTestId("export-csv"));
    expect(toast).toHaveBeenCalledWith("No data to export");
  });

  it("calls exportToCsv when CSV option is clicked with data", async () => {
    const { exportToCsv } = await import("@/lib/export/csv");
    render(
      <ExportDropdown getFilteredRows={() => [mockLink]} hasGoogleSheets={false} />
    );
    await user.click(screen.getByTestId("export-button"));
    await user.click(screen.getByTestId("export-csv"));
    expect(exportToCsv).toHaveBeenCalledWith([mockLink]);
    expect(toast.success).toHaveBeenCalledWith("Exported 1 links as CSV");
  });
});
