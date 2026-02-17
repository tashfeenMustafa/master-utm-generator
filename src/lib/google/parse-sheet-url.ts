/**
 * Extracts the Google Sheet ID from a URL.
 * Accepts URLs like:
 *   https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit...
 *   https://docs.google.com/spreadsheets/d/{SHEET_ID}
 * Returns null for invalid URLs.
 */
export function parseGoogleSheetUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "docs.google.com") return null;

    const match = parsed.pathname.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}
