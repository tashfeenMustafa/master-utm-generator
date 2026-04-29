import { describe, it, expect, beforeEach, vi } from "vitest";
import { exportLibrary, importLibrary, previewImport, generateShareUrl, decodeShareUrl } from "./library-sync";
import type { ManageableParameter } from "./types";

// ── Minimal localStorage mock ─────────────────────────────────────
class MockStorage implements Storage {
  private store: Record<string, string> = {};
  get length() { return Object.keys(this.store).length; }
  key(index: number) { return Object.keys(this.store)[index] ?? null; }
  getItem(key: string) { return this.store[key] ?? null; }
  setItem(key: string, value: string) { this.store[key] = value; }
  removeItem(key: string) { delete this.store[key]; }
  clear() { this.store = {}; }
}

const mockStorage = new MockStorage();

vi.stubGlobal("localStorage", mockStorage);
vi.stubGlobal("window", {
  localStorage: mockStorage,
  location: { origin: "https://app.magicutms.com" },
  dispatchEvent: () => {},
});

// ── Helpers ───────────────────────────────────────────────────────
function makeSampleValues(params: ManageableParameter[] = ["utm_campaign"]) {
  return params.map((p, i) => ({
    id: `id-${i}`,
    parameter: p,
    value: `value_${i}`,
    label: `Value ${i}`,
    source: "manual" as const,
    sourceRef: null,
    createdAt: new Date().toISOString(),
  }));
}

describe("library-sync", () => {
  beforeEach(() => {
    mockStorage.clear();
  });

  // ── Export ────────────────────────────────────────────────────

  it("exportLibrary returns valid JSON with version envelope", () => {
    const json = exportLibrary();
    const parsed = JSON.parse(json);
    expect(parsed.version).toBe(1);
    expect(parsed.exportedAt).toBeDefined();
    expect(Array.isArray(parsed.values)).toBe(true);
  });

  it("exportLibrary returns empty values array when no values stored", () => {
    const json = exportLibrary();
    expect(JSON.parse(json).values).toHaveLength(0);
  });

  // ── Import ────────────────────────────────────────────────────

  it("importLibrary returns zero counts for invalid JSON", () => {
    const result = importLibrary("not-json");
    expect(result).toEqual({ imported: 0, skipped: 0, invalid: 0 });
  });

  it("importLibrary accepts plain array format", () => {
    const values = makeSampleValues();
    const result = importLibrary(JSON.stringify(values));
    expect(result.imported).toBe(1);
    expect(result.skipped).toBe(0);
    expect(result.invalid).toBe(0);
  });

  it("importLibrary accepts envelope format", () => {
    const values = makeSampleValues();
    const envelope = { version: 1, exportedAt: new Date().toISOString(), values };
    const result = importLibrary(JSON.stringify(envelope));
    expect(result.imported).toBe(1);
  });

  it("importLibrary skips duplicates on second import", () => {
    const values = makeSampleValues();
    importLibrary(JSON.stringify(values));
    const second = importLibrary(JSON.stringify(values));
    expect(second.imported).toBe(0);
    expect(second.skipped).toBe(1);
  });

  it("importLibrary marks entries with invalid parameter as invalid", () => {
    const badValues = [{ parameter: "utm_source", value: "fb", label: "FB" }];
    const result = importLibrary(JSON.stringify(badValues));
    expect(result.invalid).toBe(1);
    expect(result.imported).toBe(0);
  });

  // ── Preview ───────────────────────────────────────────────────

  it("previewImport returns correct stats without writing", () => {
    const values = makeSampleValues(["utm_campaign", "utm_term"]);
    importLibrary(JSON.stringify([values[0]])); // pre-seed one
    const preview = previewImport(JSON.stringify(values));
    expect(preview.toImport).toHaveLength(1); // utm_term is new
    expect(preview.duplicates).toBe(1);        // utm_campaign is dupe
    expect(preview.invalid).toBe(0);
  });

  // ── Share URL ─────────────────────────────────────────────────

  it("generateShareUrl produces a decodable URL", () => {
    const url = generateShareUrl();
    expect(url).toContain("import_library=");
    const decoded = decodeShareUrl(url);
    expect(decoded).not.toBeNull();
    expect(decoded?.version).toBe(1);
    expect(Array.isArray(decoded?.values)).toBe(true);
  });

  it("decodeShareUrl returns null for URL without import_library param", () => {
    expect(decodeShareUrl("https://example.com/settings/values")).toBeNull();
  });

  it("decodeShareUrl returns null for malformed Base64", () => {
    expect(decodeShareUrl("https://example.com?import_library=!!!bad!!!")).toBeNull();
  });
});
