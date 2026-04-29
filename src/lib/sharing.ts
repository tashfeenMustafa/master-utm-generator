import { UtmValue, ManageableParameter } from "./types";

/**
 * Poor man's compression for sharing data in the URL.
 * We map parameter names to single characters to save space.
 */
const PARAM_MAP: Record<ManageableParameter, string> = {
  utm_campaign: "c",
  utm_term: "t",
  utm_content: "n",
};

const REVERSE_PARAM_MAP: Record<string, ManageableParameter> = {
  c: "utm_campaign",
  t: "utm_term",
  n: "utm_content",
};

export interface SharedLibrary {
  name?: string;
  values: Pick<UtmValue, "parameter" | "value" | "label">[];
}

/**
 * Encodes a list of UTM values into a URL-safe base64 string.
 */
export function compressValues(library: SharedLibrary): string {
  const compact = {
    name: library.name,
    v: library.values.map((v) => ({
      p: PARAM_MAP[v.parameter],
      v: v.value,
      l: v.label,
    })),
  };

  const json = JSON.stringify(compact);
  // Using btoa for basic base64. For production with non-ASCII chars, 
  // you'd want a more robust solution like pako or buffer.
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Decodes a shared library string from the URL.
 */
export function decompressValues(token: string): SharedLibrary | null {
  try {
    // Restore base64 padding and URL-safe chars
    let base64 = token.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) base64 += "=";

    const json = decodeURIComponent(escape(atob(base64)));
    const compact = JSON.parse(json);

    if (!compact.v || !Array.isArray(compact.v)) return null;

    return {
      name: compact.name,
      values: compact.v.map((item: any) => ({
        parameter: REVERSE_PARAM_MAP[item.p],
        value: item.v,
        label: item.l,
      })),
    };
  } catch (e) {
    console.error("Failed to decompress sharing token:", e);
    return null;
  }
}

/**
 * Generates a full shareable URL for the library.
 */
export function generateShareUrl(library: SharedLibrary, baseUrl: string): string {
  const token = compressValues(library);
  const url = new URL("/shared/values", baseUrl);
  url.searchParams.set("lib", token);
  return url.toString();
}
