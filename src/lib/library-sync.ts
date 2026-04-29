import { getValues, addValue } from "./storage";
import type { ManageableParameter, UtmValue } from "./types";

// ── Types ─────────────────────────────────────────────────────────

export interface LibraryExport {
  version: 1;
  exportedAt: string;
  values: UtmValue[];
}

export interface ImportResult {
  imported: number;
  skipped: number;
  invalid: number;
}

// ── Constants ─────────────────────────────────────────────────────

const VALID_PARAMETERS: ManageableParameter[] = [
  "utm_campaign",
  "utm_term",
  "utm_content",
];

const QUERY_PARAM = "import_library";

// ── Helpers ───────────────────────────────────────────────────────

function isValidUtmValue(v: unknown): v is UtmValue {
  if (!v || typeof v !== "object") return false;
  const obj = v as Record<string, unknown>;
  return (
    typeof obj.parameter === "string" &&
    VALID_PARAMETERS.includes(obj.parameter as ManageableParameter) &&
    typeof obj.value === "string" &&
    obj.value.trim().length > 0 &&
    typeof obj.label === "string"
  );
}

// ── Export ────────────────────────────────────────────────────────

/**
 * Exports all UtmValues from localStorage as a JSON string.
 */
export function exportLibrary(): string {
  const values = getValues();
  const payload: LibraryExport = {
    version: 1,
    exportedAt: new Date().toISOString(),
    values,
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Triggers a browser download of the library as a JSON file.
 */
export function downloadLibrary(): void {
  const json = exportLibrary();
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `magicutms-library-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Import ────────────────────────────────────────────────────────

/**
 * Parses a raw JSON string or decoded object and merges values into storage.
 * Returns counts of imported, skipped (duplicate), and invalid items.
 */
export function importLibrary(raw: string | object): ImportResult {
  let parsed: unknown;

  try {
    parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return { imported: 0, skipped: 0, invalid: 0 };
  }

  // Support both: top-level array OR {version, values} envelope
  let candidates: unknown[];
  if (Array.isArray(parsed)) {
    candidates = parsed;
  } else if (
    parsed &&
    typeof parsed === "object" &&
    Array.isArray((parsed as Record<string, unknown>).values)
  ) {
    candidates = (parsed as Record<string, unknown>).values as unknown[];
  } else {
    return { imported: 0, skipped: 0, invalid: 0 };
  }

  let imported = 0;
  let skipped = 0;
  let invalid = 0;

  for (const candidate of candidates) {
    if (!isValidUtmValue(candidate)) {
      invalid++;
      continue;
    }
    const result = addValue({
      parameter: candidate.parameter,
      value: candidate.value,
      label: candidate.label,
      source: candidate.source ?? "manual",
      sourceRef: candidate.sourceRef ?? null,
    });
    if (result === null) {
      skipped++;
    } else {
      imported++;
    }
  }

  return { imported, skipped, invalid };
}

// ── Preview (without importing) ───────────────────────────────────

/**
 * Parses a raw JSON string and returns the values that would be imported,
 * along with how many would be skipped (duplicates) — without writing anything.
 */
export function previewImport(raw: string | object): {
  toImport: UtmValue[];
  duplicates: number;
  invalid: number;
} {
  let parsed: unknown;
  try {
    parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return { toImport: [], duplicates: 0, invalid: 0 };
  }

  let candidates: unknown[];
  if (Array.isArray(parsed)) {
    candidates = parsed;
  } else if (
    parsed &&
    typeof parsed === "object" &&
    Array.isArray((parsed as Record<string, unknown>).values)
  ) {
    candidates = (parsed as Record<string, unknown>).values as unknown[];
  } else {
    return { toImport: [], duplicates: 0, invalid: 0 };
  }

  const existing = getValues();
  const toImport: UtmValue[] = [];
  let duplicates = 0;
  let invalid = 0;

  for (const candidate of candidates) {
    if (!isValidUtmValue(candidate)) {
      invalid++;
      continue;
    }
    const isDupe = existing.some(
      (e) => e.parameter === candidate.parameter && e.value === candidate.value
    );
    if (isDupe) {
      duplicates++;
    } else {
      toImport.push(candidate as UtmValue);
    }
  }

  return { toImport, duplicates, invalid };
}

// ── Share URL ─────────────────────────────────────────────────────

/**
 * Encodes current library as Base64 and returns a shareable URL
 * for the /settings/values page with an `?import_library=` param.
 */
export function generateShareUrl(): string {
  const values = getValues();
  const payload: LibraryExport = {
    version: 1,
    exportedAt: new Date().toISOString(),
    values,
  };
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  const base =
    typeof window !== "undefined"
      ? `${window.location.origin}/settings/values`
      : "/settings/values";
  return `${base}?${QUERY_PARAM}=${encoded}`;
}

/**
 * Reads the `?import_library=` param from a URL and decodes it.
 * Returns null if absent or malformed.
 */
export function decodeShareUrl(url: string): LibraryExport | null {
  try {
    const params = new URL(url).searchParams;
    const encoded = params.get(QUERY_PARAM);
    if (!encoded) return null;
    const json = decodeURIComponent(escape(atob(encoded)));
    const parsed = JSON.parse(json);
    if (!parsed || !Array.isArray(parsed.values)) return null;
    return parsed as LibraryExport;
  } catch {
    return null;
  }
}

export { QUERY_PARAM };
