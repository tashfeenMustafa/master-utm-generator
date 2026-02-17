import { describe, it, expect, beforeEach } from "vitest";
import type { StorageAdapter } from "./types";
import {
  generateId,
  getLinks,
  addLink,
  deleteLink,
  getValues,
  addValue,
  deleteValue,
  getConnections,
  saveConnection,
  deleteConnection,
  updateConnection,
  deleteValuesBySource,
} from "./storage";

// In-memory StorageAdapter for testing (no window.localStorage needed)
function createMockAdapter(): StorageAdapter {
  const store = new Map<string, string>();
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, value),
    removeItem: (key) => store.delete(key),
  };
}

const linkData = {
  baseUrl: "https://example.com",
  utm_source: "google",
  utm_medium: "cpc",
  utm_campaign: "spring_sale",
  generatedUrl: "https://example.com?utm_source=google&utm_medium=cpc&utm_campaign=spring_sale",
} as const;

// ── generateId ───────────────────────────────────────────────────

describe("generateId", () => {
  it("returns a valid UUID string", () => {
    const id = generateId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
  });

  it("returns unique values", () => {
    const ids = new Set(Array.from({ length: 50 }, () => generateId()));
    expect(ids.size).toBe(50);
  });
});

// ── Links CRUD ───────────────────────────────────────────────────

describe("Links CRUD", () => {
  let adapter: StorageAdapter;

  beforeEach(() => {
    adapter = createMockAdapter();
  });

  it("returns empty array when no links exist", () => {
    expect(getLinks(undefined, adapter)).toEqual([]);
  });

  it("adds a link and returns it with id and createdAt", () => {
    const link = addLink(linkData, adapter);
    expect(link.id).toBeDefined();
    expect(link.createdAt).toBeDefined();
    expect(link.utm_source).toBe("google");
    expect(link.baseUrl).toBe("https://example.com");
  });

  it("persists links across reads", () => {
    addLink(linkData, adapter);
    addLink({ ...linkData, utm_campaign: "fall_sale" }, adapter);
    const links = getLinks(undefined, adapter);
    expect(links).toHaveLength(2);
  });

  it("deletes a link by id", () => {
    const link = addLink(linkData, adapter);
    deleteLink(link.id, adapter);
    expect(getLinks(undefined, adapter)).toHaveLength(0);
  });

  it("delete is a no-op for non-existent id", () => {
    addLink(linkData, adapter);
    deleteLink("non-existent-id", adapter);
    expect(getLinks(undefined, adapter)).toHaveLength(1);
  });

  it("filters links by search term (campaign)", () => {
    addLink(linkData, adapter);
    addLink({
      ...linkData,
      utm_campaign: "fall_sale",
      generatedUrl: "https://example.com?utm_source=google&utm_medium=cpc&utm_campaign=fall_sale",
    }, adapter);
    const results = getLinks({ search: "spring" }, adapter);
    expect(results).toHaveLength(1);
    expect(results[0].utm_campaign).toBe("spring_sale");
  });

  it("filters links by search term (source)", () => {
    addLink(linkData, adapter);
    addLink({ ...linkData, utm_source: "facebook", generatedUrl: "https://example.com?utm_source=facebook" }, adapter);
    const results = getLinks({ search: "facebook" }, adapter);
    expect(results).toHaveLength(1);
  });

  it("search is case-insensitive", () => {
    addLink(linkData, adapter);
    expect(getLinks({ search: "GOOGLE" }, adapter)).toHaveLength(1);
  });

  it("sorts links descending by default (newest first)", () => {
    // Seed two links with known timestamps so sort order is deterministic
    const raw = [
      { ...linkData, id: "aaa", createdAt: "2025-01-01T00:00:00Z" },
      { ...linkData, id: "bbb", createdAt: "2025-06-01T00:00:00Z" },
    ];
    adapter.setItem("utm-generator:links", JSON.stringify(raw));
    const links = getLinks(undefined, adapter);
    expect(links[0].id).toBe("bbb"); // newer first
    expect(links[1].id).toBe("aaa");
  });

  it("sorts links ascending when requested", () => {
    const raw = [
      { ...linkData, id: "aaa", createdAt: "2025-01-01T00:00:00Z" },
      { ...linkData, id: "bbb", createdAt: "2025-06-01T00:00:00Z" },
    ];
    adapter.setItem("utm-generator:links", JSON.stringify(raw));
    const links = getLinks({ sortOrder: "asc" }, adapter);
    expect(links[0].id).toBe("aaa"); // older first
    expect(links[1].id).toBe("bbb");
  });
});

// ── Values CRUD ──────────────────────────────────────────────────

describe("Values CRUD", () => {
  let adapter: StorageAdapter;

  beforeEach(() => {
    adapter = createMockAdapter();
  });

  it("returns empty array when no values exist", () => {
    expect(getValues(undefined, adapter)).toEqual([]);
  });

  it("adds a value and returns it with id and createdAt", () => {
    const val = addValue(
      { parameter: "utm_campaign", value: "spring_sale", label: "Spring Sale", source: "manual", sourceRef: null },
      adapter
    );
    expect(val).not.toBeNull();
    expect(val!.id).toBeDefined();
    expect(val!.parameter).toBe("utm_campaign");
    expect(val!.value).toBe("spring_sale");
    expect(val!.label).toBe("Spring Sale");
    expect(val!.source).toBe("manual");
    expect(val!.sourceRef).toBeNull();
  });

  it("deduplicates value+parameter combos", () => {
    addValue(
      { parameter: "utm_campaign", value: "spring_sale", label: "Spring Sale", source: "manual", sourceRef: null },
      adapter
    );
    const dup = addValue(
      { parameter: "utm_campaign", value: "spring_sale", label: "Spring Sale", source: "manual", sourceRef: null },
      adapter
    );
    expect(dup).toBeNull();
    expect(getValues(undefined, adapter)).toHaveLength(1);
  });

  it("allows same value for different parameters", () => {
    addValue(
      { parameter: "utm_campaign", value: "brand", label: "Brand", source: "manual", sourceRef: null },
      adapter
    );
    const val = addValue(
      { parameter: "utm_term", value: "brand", label: "Brand", source: "manual", sourceRef: null },
      adapter
    );
    expect(val).not.toBeNull();
    expect(getValues(undefined, adapter)).toHaveLength(2);
  });

  it("filters values by parameter", () => {
    addValue(
      { parameter: "utm_campaign", value: "spring_sale", label: "Spring Sale", source: "manual", sourceRef: null },
      adapter
    );
    addValue(
      { parameter: "utm_term", value: "cpc", label: "CPC", source: "manual", sourceRef: null },
      adapter
    );
    const campaigns = getValues("utm_campaign", adapter);
    expect(campaigns).toHaveLength(1);
    expect(campaigns[0].value).toBe("spring_sale");
  });

  it("deletes a value by id", () => {
    const val = addValue(
      { parameter: "utm_campaign", value: "spring_sale", label: "Spring Sale", source: "manual", sourceRef: null },
      adapter
    );
    deleteValue(val!.id, adapter);
    expect(getValues(undefined, adapter)).toHaveLength(0);
  });
});

// ── Connections CRUD ─────────────────────────────────────────────

describe("Connections CRUD", () => {
  let adapter: StorageAdapter;

  const connData = {
    name: "My Sheet",
    type: "google_sheets" as const,
    config: { sheetId: "abc123" },
    lastSynced: null,
    status: "active" as const,
  };

  beforeEach(() => {
    adapter = createMockAdapter();
  });

  it("returns empty array when no connections exist", () => {
    expect(getConnections(adapter)).toEqual([]);
  });

  it("saves a connection and returns it with id and createdAt", () => {
    const conn = saveConnection(connData, adapter);
    expect(conn.id).toBeDefined();
    expect(conn.createdAt).toBeDefined();
    expect(conn.name).toBe("My Sheet");
    expect(conn.type).toBe("google_sheets");
  });

  it("persists connections across reads", () => {
    saveConnection(connData, adapter);
    saveConnection({ ...connData, name: "Second Sheet" }, adapter);
    expect(getConnections(adapter)).toHaveLength(2);
  });

  it("deletes a connection by id", () => {
    const conn = saveConnection(connData, adapter);
    deleteConnection(conn.id, adapter);
    expect(getConnections(adapter)).toHaveLength(0);
  });

  it("updates a connection", () => {
    const conn = saveConnection(connData, adapter);
    const updated = updateConnection(
      conn.id,
      { lastSynced: "2025-06-01T00:00:00Z", status: "error" },
      adapter
    );
    expect(updated).not.toBeNull();
    expect(updated!.lastSynced).toBe("2025-06-01T00:00:00Z");
    expect(updated!.status).toBe("error");
    expect(updated!.name).toBe("My Sheet"); // unchanged fields preserved
  });

  it("updateConnection returns null for non-existent id", () => {
    const result = updateConnection("non-existent", { status: "error" }, adapter);
    expect(result).toBeNull();
  });

  it("updateConnection merges config", () => {
    const conn = saveConnection(connData, adapter);
    const updated = updateConnection(
      conn.id,
      { config: { sheetId: "abc123", tabName: "Sheet1" } },
      adapter
    );
    expect(updated!.config).toEqual({ sheetId: "abc123", tabName: "Sheet1" });
  });
});

// ── deleteValuesBySource ─────────────────────────────────────────

describe("deleteValuesBySource", () => {
  let adapter: StorageAdapter;

  beforeEach(() => {
    adapter = createMockAdapter();
  });

  it("removes values matching source + sourceRef", () => {
    addValue(
      { parameter: "utm_campaign", value: "from_sheet", label: "From Sheet", source: "google_sheets", sourceRef: "sheet1" },
      adapter
    );
    addValue(
      { parameter: "utm_campaign", value: "manual_val", label: "Manual", source: "manual", sourceRef: null },
      adapter
    );
    deleteValuesBySource("google_sheets", "sheet1", adapter);
    const remaining = getValues(undefined, adapter);
    expect(remaining).toHaveLength(1);
    expect(remaining[0].source).toBe("manual");
  });

  it("does not remove values with different sourceRef", () => {
    addValue(
      { parameter: "utm_campaign", value: "from_sheet1", label: "Sheet1", source: "google_sheets", sourceRef: "sheet1" },
      adapter
    );
    addValue(
      { parameter: "utm_campaign", value: "from_sheet2", label: "Sheet2", source: "google_sheets", sourceRef: "sheet2" },
      adapter
    );
    deleteValuesBySource("google_sheets", "sheet1", adapter);
    const remaining = getValues(undefined, adapter);
    expect(remaining).toHaveLength(1);
    expect(remaining[0].sourceRef).toBe("sheet2");
  });

  it("is a no-op when no values match", () => {
    addValue(
      { parameter: "utm_campaign", value: "val", label: "Val", source: "manual", sourceRef: null },
      adapter
    );
    deleteValuesBySource("google_sheets", "sheet1", adapter);
    expect(getValues(undefined, adapter)).toHaveLength(1);
  });
});

// ── Corrupted data resilience ────────────────────────────────────

describe("corrupted data handling", () => {
  it("returns empty array for invalid JSON", () => {
    const adapter: StorageAdapter = {
      getItem: () => "not valid json{{{",
      setItem: () => {},
      removeItem: () => {},
    };
    expect(getLinks(undefined, adapter)).toEqual([]);
    expect(getValues(undefined, adapter)).toEqual([]);
    expect(getConnections(adapter)).toEqual([]);
  });

  it("returns empty array when stored value is not an array", () => {
    const adapter: StorageAdapter = {
      getItem: () => JSON.stringify({ notAnArray: true }),
      setItem: () => {},
      removeItem: () => {},
    };
    expect(getLinks(undefined, adapter)).toEqual([]);
  });

  it("returns empty array when storage key is missing", () => {
    const adapter: StorageAdapter = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
    expect(getLinks(undefined, adapter)).toEqual([]);
  });
});
