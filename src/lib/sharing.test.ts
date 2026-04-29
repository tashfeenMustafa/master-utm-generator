import { describe, it, expect } from "vitest";
import { compressValues, decompressValues, generateShareUrl } from "./sharing";
import { SharedLibrary } from "./sharing";

const mockLibrary: SharedLibrary = {
  name: "Summer Campaign",
  values: [
    { parameter: "utm_campaign", value: "summer_sale", label: "Summer Sale" },
    { parameter: "utm_term", value: "beach", label: "Beach" },
  ],
};

describe("Sharing Utilities", () => {
  it("compresses and decompresses a library", () => {
    const token = compressValues(mockLibrary);
    expect(typeof token).toBe("string");
    
    const decompressed = decompressValues(token);
    expect(decompressed).not.toBeNull();
    expect(decompressed!.name).toBe(mockLibrary.name);
    expect(decompressed!.values).toHaveLength(2);
    expect(decompressed!.values[0].parameter).toBe("utm_campaign");
    expect(decompressed!.values[0].value).toBe("summer_sale");
  });

  it("handles URL-safe characters in compression", () => {
    const specialLibrary: SharedLibrary = {
      values: [{ parameter: "utm_campaign", value: "sale_2025!", label: "Sale & More" }],
    };
    const token = compressValues(specialLibrary);
    expect(token).not.toContain("+");
    expect(token).not.toContain("/");
    
    const decompressed = decompressValues(token);
    expect(decompressed!.values[0].label).toBe("Sale & More");
  });

  it("returns null for invalid tokens", () => {
    expect(decompressValues("invalid-token")).toBeNull();
    expect(decompressValues("eyBvopsiIDogInRyYXNoIiB9")).toBeNull(); // base64 but invalid schema
  });

  it("generates a full share URL", () => {
    const baseUrl = "https://app.magicutm.com";
    const url = generateShareUrl(mockLibrary, baseUrl);
    expect(url).toContain(baseUrl);
    expect(url).toContain("/shared/values");
    expect(url).toContain("lib=");
  });
});
