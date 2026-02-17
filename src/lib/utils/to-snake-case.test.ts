import { describe, it, expect } from "vitest";
import { toSnakeCase } from "./to-snake-case";

describe("toSnakeCase", () => {
  it("returns empty string for empty input", () => {
    expect(toSnakeCase("")).toBe("");
  });

  it("returns already snake_case strings unchanged", () => {
    expect(toSnakeCase("brand_awareness")).toBe("brand_awareness");
  });

  it("lowercases and replaces spaces", () => {
    expect(toSnakeCase("Brand Awareness")).toBe("brand_awareness");
  });

  it("converts camelCase", () => {
    expect(toSnakeCase("brandAwareness")).toBe("brand_awareness");
  });

  it("converts PascalCase", () => {
    expect(toSnakeCase("BrandAwareness")).toBe("brand_awareness");
  });

  it("handles ALL CAPS", () => {
    expect(toSnakeCase("BRAND AWARENESS")).toBe("brand_awareness");
  });

  it("handles consecutive uppercase (acronyms)", () => {
    expect(toSnakeCase("getHTTPResponse")).toBe("get_http_response");
  });

  it("replaces hyphens with underscores", () => {
    expect(toSnakeCase("brand-awareness")).toBe("brand_awareness");
  });

  it("replaces periods with underscores", () => {
    expect(toSnakeCase("brand.awareness")).toBe("brand_awareness");
  });

  it("collapses consecutive special characters into one underscore", () => {
    expect(toSnakeCase("brand---awareness")).toBe("brand_awareness");
    expect(toSnakeCase("brand   awareness")).toBe("brand_awareness");
    expect(toSnakeCase("brand - awareness")).toBe("brand_awareness");
  });

  it("strips leading and trailing underscores", () => {
    expect(toSnakeCase("_brand_awareness_")).toBe("brand_awareness");
    expect(toSnakeCase("__leading")).toBe("leading");
    expect(toSnakeCase("trailing__")).toBe("trailing");
  });

  it("strips leading/trailing special characters", () => {
    expect(toSnakeCase(" Brand Awareness ")).toBe("brand_awareness");
    expect(toSnakeCase("-brand-awareness-")).toBe("brand_awareness");
  });

  it("handles numbers", () => {
    expect(toSnakeCase("product launch Q1")).toBe("product_launch_q1");
    expect(toSnakeCase("5 Tips For Growth")).toBe("5_tips_for_growth");
  });

  it("handles mixed special characters", () => {
    expect(toSnakeCase("hello.world-foo bar")).toBe("hello_world_foo_bar");
  });

  it("handles real UTM content examples from PRD", () => {
    expect(toSnakeCase("5 tips for growth")).toBe("5_tips_for_growth");
    expect(toSnakeCase("How To Build A Brand")).toBe("how_to_build_a_brand");
    expect(toSnakeCase("customer_stories")).toBe("customer_stories");
    expect(toSnakeCase("behind the scenes")).toBe("behind_the_scenes");
  });
});
