import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateCsvContent, exportToCsv, linksToRows } from "./csv";
import type { UtmLink } from "@/lib/types";

function makeLink(overrides: Partial<UtmLink> = {}): UtmLink {
  return {
    id: "1",
    baseUrl: "https://example.com",
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: "spring_sale",
    utm_term: "shoes",
    utm_content: "banner_ad",
    generatedUrl: "https://example.com?utm_source=google&utm_medium=cpc&utm_campaign=spring_sale&utm_term=shoes&utm_content=banner_ad",
    createdAt: "2025-01-15T10:30:00.000Z",
    ...overrides,
  };
}

describe("generateCsvContent", () => {
  it("generates CSV with header and data rows", () => {
    const links = [makeLink()];
    const csv = generateCsvContent(links);
    const lines = csv.split("\n");

    expect(lines[0]).toBe(
      "Full URL,utm_source,utm_medium,utm_campaign,utm_term,utm_content,Date Generated"
    );
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain("google");
    expect(lines[1]).toContain("spring_sale");
  });

  it("escapes fields with commas", () => {
    const link = makeLink({ utm_campaign: "spring,sale" });
    const csv = generateCsvContent([link]);
    expect(csv).toContain('"spring,sale"');
  });

  it("escapes fields with double quotes", () => {
    const link = makeLink({ utm_campaign: 'say "hello"' });
    const csv = generateCsvContent([link]);
    expect(csv).toContain('"say ""hello"""');
  });

  it("escapes fields with newlines", () => {
    const link = makeLink({ utm_campaign: "line1\nline2" });
    const csv = generateCsvContent([link]);
    expect(csv).toContain('"line1\nline2"');
  });

  it("handles empty utm_term and utm_content", () => {
    const link = makeLink({ utm_term: undefined, utm_content: undefined });
    const csv = generateCsvContent([link]);
    const lines = csv.split("\n");
    // Should have empty fields for term and content
    const fields = lines[1].split(",");
    expect(fields[4]).toBe("");
    expect(fields[5]).toBe("");
  });

  it("returns only header for empty data", () => {
    const csv = generateCsvContent([]);
    const lines = csv.split("\n");
    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain("Full URL");
  });
});

describe("exportToCsv", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("triggers a download with default filename", () => {
    const createObjectURL = vi.fn().mockReturnValue("blob:url");
    const revokeObjectURL = vi.fn();
    Object.defineProperty(globalThis, "URL", {
      value: { createObjectURL, revokeObjectURL },
      writable: true,
    });

    const clickSpy = vi.fn();
    const appendChildSpy = vi.spyOn(document.body, "appendChild").mockImplementation((node) => {
      // capture the click
      return node;
    });
    const removeChildSpy = vi.spyOn(document.body, "removeChild").mockImplementation((node) => node);

    vi.spyOn(document, "createElement").mockReturnValue({
      href: "",
      download: "",
      style: { display: "" },
      click: clickSpy,
    } as unknown as HTMLAnchorElement);

    const links = [makeLink()];
    exportToCsv(links);

    expect(createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:url");

    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });

  it("uses custom filename when provided", () => {
    const createObjectURL = vi.fn().mockReturnValue("blob:url");
    const revokeObjectURL = vi.fn();
    Object.defineProperty(globalThis, "URL", {
      value: { createObjectURL, revokeObjectURL },
      writable: true,
    });

    let downloadName = "";
    vi.spyOn(document.body, "appendChild").mockImplementation((node) => node);
    vi.spyOn(document.body, "removeChild").mockImplementation((node) => node);
    vi.spyOn(document, "createElement").mockReturnValue({
      href: "",
      set download(val: string) { downloadName = val; },
      get download() { return downloadName; },
      style: { display: "" },
      click: vi.fn(),
    } as unknown as HTMLAnchorElement);

    exportToCsv([makeLink()], "custom.csv");
    expect(downloadName).toBe("custom.csv");
  });
});

describe("linksToRows", () => {
  it("returns header row plus data rows", () => {
    const rows = linksToRows([makeLink()]);
    expect(rows).toHaveLength(2);
    expect(rows[0][0]).toBe("Full URL");
    expect(rows[1][0]).toContain("example.com");
    expect(rows[1][1]).toBe("google");
  });

  it("returns only header for empty data", () => {
    const rows = linksToRows([]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toContain("Full URL");
  });
});
