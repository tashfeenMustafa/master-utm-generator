import { describe, it, expect } from "vitest";
import { parseGoogleSheetUrl } from "./parse-sheet-url";

describe("parseGoogleSheetUrl", () => {
  it("extracts sheet ID from a standard edit URL", () => {
    const url =
      "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/edit#gid=0";
    expect(parseGoogleSheetUrl(url)).toBe(
      "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
    );
  });

  it("extracts sheet ID from a URL without /edit", () => {
    const url =
      "https://docs.google.com/spreadsheets/d/abc123_-XYZ/";
    expect(parseGoogleSheetUrl(url)).toBe("abc123_-XYZ");
  });

  it("extracts sheet ID from a minimal URL", () => {
    const url =
      "https://docs.google.com/spreadsheets/d/abc123";
    expect(parseGoogleSheetUrl(url)).toBe("abc123");
  });

  it("returns null for non-Google domains", () => {
    expect(
      parseGoogleSheetUrl("https://example.com/spreadsheets/d/abc123/edit")
    ).toBeNull();
  });

  it("returns null for a Google Docs URL (not Sheets)", () => {
    expect(
      parseGoogleSheetUrl("https://docs.google.com/document/d/abc123/edit")
    ).toBeNull();
  });

  it("returns null for an empty string", () => {
    expect(parseGoogleSheetUrl("")).toBeNull();
  });

  it("returns null for a completely invalid URL", () => {
    expect(parseGoogleSheetUrl("not-a-url")).toBeNull();
  });

  it("returns null for a Google Sheets URL without an ID", () => {
    expect(
      parseGoogleSheetUrl("https://docs.google.com/spreadsheets/d/")
    ).toBeNull();
  });
});
