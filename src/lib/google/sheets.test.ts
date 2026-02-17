import { describe, it, expect, vi, beforeEach } from "vitest";
import { getSheetMetadata, getColumnHeaders, getColumnValues } from "./sheets";

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
  mockFetch.mockReset();
});

function jsonResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  };
}

describe("getSheetMetadata", () => {
  it("returns title and tab names", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        properties: { title: "My Sheet" },
        sheets: [
          { properties: { title: "Sheet1" } },
          { properties: { title: "Sheet2" } },
        ],
      })
    );

    const result = await getSheetMetadata("token", "sheet123");
    expect(result).toEqual({
      title: "My Sheet",
      tabs: ["Sheet1", "Sheet2"],
    });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("sheet123"),
      expect.objectContaining({
        headers: { Authorization: "Bearer token" },
      })
    );
  });

  it("throws on API error", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ error: "not found" }, 404)
    );

    await expect(getSheetMetadata("token", "bad")).rejects.toThrow(
      /Google Sheets API error/
    );
  });
});

describe("getColumnHeaders", () => {
  it("returns headers from first row", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ values: [["Campaign", "Term", "Content"]] })
    );

    const result = await getColumnHeaders("token", "sheet123", "Sheet1");
    expect(result.headers).toEqual(["Campaign", "Term", "Content"]);
  });

  it("returns empty array when no data", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({}));
    const result = await getColumnHeaders("token", "sheet123", "Sheet1");
    expect(result.headers).toEqual([]);
  });
});

describe("getColumnValues", () => {
  it("returns unique values per column", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        valueRanges: [
          { values: [["val1"], ["val2"], ["val1"], ["val3"]] },
          { values: [["x"], ["y"], ["x"]] },
        ],
      })
    );

    const result = await getColumnValues("token", "sheet123", "Sheet1", [
      "A",
      "B",
    ]);
    expect(result).toEqual({
      A: ["val1", "val2", "val3"],
      B: ["x", "y"],
    });
  });

  it("filters out empty values", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        valueRanges: [{ values: [["val1"], [""], [" "], ["val2"]] }],
      })
    );

    const result = await getColumnValues("token", "sheet123", "Sheet1", ["A"]);
    expect(result).toEqual({ A: ["val1", "val2"] });
  });

  it("handles missing valueRanges", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({}));
    const result = await getColumnValues("token", "sheet123", "Sheet1", ["A"]);
    expect(result).toEqual({ A: [] });
  });
});
