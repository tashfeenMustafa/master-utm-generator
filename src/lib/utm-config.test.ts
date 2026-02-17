import { describe, it, expect } from "vitest";
import {
  getPlatformsForChannel,
  getUtmMedium,
  composeUtmContent,
  buildUtmUrl,
  isValidUrl,
} from "./utm-config";

describe("getPlatformsForChannel", () => {
  it("returns 6 social platforms for organic_social", () => {
    const platforms = getPlatformsForChannel("organic_social");
    expect(platforms).toHaveLength(6);
    expect(platforms.map((p) => p.value)).toContain("facebook");
    expect(platforms.map((p) => p.value)).toContain("instagram");
  });

  it("returns only Google for blog", () => {
    const platforms = getPlatformsForChannel("blog");
    expect(platforms).toHaveLength(1);
    expect(platforms[0].value).toBe("google");
  });

  it("returns DM platforms for warm_dms", () => {
    const platforms = getPlatformsForChannel("warm_dms");
    expect(platforms).toHaveLength(6);
  });

  it("returns DM platforms for cold_dms", () => {
    const platforms = getPlatformsForChannel("cold_dms");
    expect(platforms).toHaveLength(6);
  });

  it("includes correct post formats for Instagram", () => {
    const platforms = getPlatformsForChannel("organic_social");
    const ig = platforms.find((p) => p.value === "instagram");
    expect(ig?.postFormats).toEqual(["Reels", "Image", "Carousel"]);
  });
});

describe("getUtmMedium", () => {
  it("returns organic_social for organic_social", () => {
    expect(getUtmMedium("organic_social")).toBe("organic_social");
  });
  it("returns organic_search for blog", () => {
    expect(getUtmMedium("blog")).toBe("organic_search");
  });
  it("returns warm_dms for warm_dms", () => {
    expect(getUtmMedium("warm_dms")).toBe("warm_dms");
  });
  it("returns cold_dms for cold_dms", () => {
    expect(getUtmMedium("cold_dms")).toBe("cold_dms");
  });
});

describe("composeUtmContent", () => {
  it("composes organic content with hyphen separator", () => {
    expect(composeUtmContent("organic_social", "reels", "5_tips")).toBe("reels-5_tips");
  });
  it("returns blog title only for blog channel", () => {
    expect(composeUtmContent("blog", "", "how_to_build")).toBe("how_to_build");
  });
  it("returns empty string when parts are missing", () => {
    expect(composeUtmContent("organic_social", "", "hook")).toBe("");
    expect(composeUtmContent("organic_social", "reels", "")).toBe("");
  });
});

describe("buildUtmUrl", () => {
  it("appends params with ? when no existing query", () => {
    const url = buildUtmUrl("https://example.com", { utm_source: "google" });
    expect(url).toBe("https://example.com?utm_source=google");
  });

  it("appends params with & when ? already exists", () => {
    const url = buildUtmUrl("https://example.com?page=1", { utm_source: "google" });
    expect(url).toBe("https://example.com?page=1&utm_source=google");
  });

  it("skips empty values", () => {
    const url = buildUtmUrl("https://example.com", { utm_source: "google", utm_term: "" });
    expect(url).toBe("https://example.com?utm_source=google");
  });

  it("encodes special characters", () => {
    const url = buildUtmUrl("https://example.com", { utm_campaign: "hello world" });
    expect(url).toBe("https://example.com?utm_campaign=hello%20world");
  });

  it("returns base URL when no params have values", () => {
    expect(buildUtmUrl("https://example.com", { utm_source: "" })).toBe("https://example.com");
  });
});

describe("isValidUrl", () => {
  it("accepts https URLs", () => {
    expect(isValidUrl("https://example.com")).toBe(true);
  });
  it("accepts http URLs", () => {
    expect(isValidUrl("http://example.com")).toBe(true);
  });
  it("rejects URLs without protocol", () => {
    expect(isValidUrl("example.com")).toBe(false);
  });
  it("rejects empty string", () => {
    expect(isValidUrl("")).toBe(false);
  });
  it("rejects non-http protocols", () => {
    expect(isValidUrl("ftp://example.com")).toBe(false);
  });
});
