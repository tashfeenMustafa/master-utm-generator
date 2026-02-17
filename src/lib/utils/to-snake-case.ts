/**
 * Converts a string to snake_case for UTM parameter values.
 *
 * - Lowercases all characters
 * - Inserts underscores at camelCase/PascalCase boundaries
 * - Replaces spaces, hyphens, periods, and consecutive special characters with single underscores
 * - Strips leading/trailing underscores
 */
export function toSnakeCase(input: string): string {
  if (!input) return "";

  return (
    input
      // Insert underscore before uppercase letters preceded by lowercase (camelCase)
      .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
      // Insert underscore between consecutive uppercase followed by lowercase (PascalCase)
      .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
      // Lowercase everything
      .toLowerCase()
      // Replace any non-alphanumeric characters (spaces, hyphens, dots, etc.) with underscores
      .replace(/[^a-z0-9]+/g, "_")
      // Strip leading/trailing underscores
      .replace(/^_+|_+$/g, "")
  );
}
