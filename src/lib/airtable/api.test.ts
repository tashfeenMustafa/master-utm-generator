import { describe, it, expect, vi, beforeEach } from "vitest";
import { listBases, listTables, getRecords } from "./api";

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

describe("listBases", () => {
  it("returns base id and name", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        bases: [
          { id: "appABC", name: "Marketing" },
          { id: "appDEF", name: "Sales" },
        ],
      })
    );

    const result = await listBases("pat123");
    expect(result).toEqual([
      { id: "appABC", name: "Marketing" },
      { id: "appDEF", name: "Sales" },
    ]);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/meta/bases"),
      expect.objectContaining({
        headers: { Authorization: "Bearer pat123" },
      })
    );
  });

  it("throws on API error", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ error: "unauthorized" }, 401)
    );

    await expect(listBases("bad-token")).rejects.toThrow(
      /Airtable API error/
    );
  });

  it("returns empty array when no bases", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({}));
    const result = await listBases("pat123");
    expect(result).toEqual([]);
  });
});

describe("listTables", () => {
  it("returns tables with fields", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        tables: [
          {
            id: "tbl1",
            name: "Campaigns",
            fields: [
              { name: "Name", type: "singleLineText" },
              { name: "Status", type: "singleSelect" },
            ],
          },
        ],
      })
    );

    const result = await listTables("pat123", "appABC");
    expect(result).toEqual([
      {
        id: "tbl1",
        name: "Campaigns",
        fields: [
          { name: "Name", type: "singleLineText" },
          { name: "Status", type: "singleSelect" },
        ],
      },
    ]);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/meta/bases/appABC/tables"),
      expect.any(Object)
    );
  });

  it("returns empty array when no tables", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({}));
    const result = await listTables("pat123", "appABC");
    expect(result).toEqual([]);
  });
});

describe("getRecords", () => {
  it("returns unique values per field", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        records: [
          { fields: { Campaign: "Spring Sale", Term: "shoes" } },
          { fields: { Campaign: "Summer Sale", Term: "shoes" } },
          { fields: { Campaign: "Spring Sale", Term: "hats" } },
        ],
      })
    );

    const result = await getRecords("pat123", "appABC", "tbl1", [
      "Campaign",
      "Term",
    ]);
    expect(result).toEqual({
      Campaign: ["Spring Sale", "Summer Sale"],
      Term: ["shoes", "hats"],
    });
  });

  it("handles pagination with offset", async () => {
    mockFetch
      .mockResolvedValueOnce(
        jsonResponse({
          records: [{ fields: { Name: "val1" } }],
          offset: "page2",
        })
      )
      .mockResolvedValueOnce(
        jsonResponse({
          records: [{ fields: { Name: "val2" } }],
        })
      );

    const result = await getRecords("pat123", "appABC", "tbl1", ["Name"]);
    expect(result).toEqual({ Name: ["val1", "val2"] });
    expect(mockFetch).toHaveBeenCalledTimes(2);

    // Second call should include offset
    const secondCallUrl = mockFetch.mock.calls[1][0] as string;
    expect(secondCallUrl).toContain("offset=page2");
  });

  it("filters out empty values", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        records: [
          { fields: { Name: "val1" } },
          { fields: { Name: "" } },
          { fields: { Name: "  " } },
          { fields: { Name: "val2" } },
          { fields: {} },
        ],
      })
    );

    const result = await getRecords("pat123", "appABC", "tbl1", ["Name"]);
    expect(result).toEqual({ Name: ["val1", "val2"] });
  });

  it("handles missing records", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({}));
    const result = await getRecords("pat123", "appABC", "tbl1", ["Name"]);
    expect(result).toEqual({ Name: [] });
  });
});
