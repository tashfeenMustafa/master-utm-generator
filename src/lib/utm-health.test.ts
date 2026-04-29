import { describe, it, expect } from "vitest";
import { analyzeUrl } from "./utm-health";

describe("analyzeUrl", () => {
  it("returns error for invalid URL", () => {
    const report = analyzeUrl("not-a-url");
    expect(report.status).toBe("error");
    expect(report.score).toBe(0);
    expect(report.findings[0].message).toBe("Invalid URL format");
  });

  it("returns error for missing required params", () => {
    const report = analyzeUrl("https://example.com?utm_source=fb");
    expect(report.status).toBe("error");
    expect(report.score).toBeLessThan(60);
    const missingCampaign = report.findings.find(f => f.param === "utm_campaign");
    expect(missingCampaign?.type).toBe("error");
  });

  it("handles dynamic macros as valid", () => {
    const report = analyzeUrl("https://example.com?utm_source=facebook&utm_medium=paid&utm_campaign={{campaign.name}}");
    expect(report.status).toBe("healthy");
    expect(report.score).toBe(100);
    const macroFinding = report.findings.find(f => f.param === "utm_campaign");
    expect(macroFinding?.type).toBe("success");
    expect(macroFinding?.message).toContain("Valid dynamic macro");
  });

  it("flags non-snake_case as warnings", () => {
    const report = analyzeUrl("https://example.com?utm_source=facebook&utm_medium=PaidSocial&utm_campaign=SpringSale");
    expect(report.status).toBe("warning");
    expect(report.score).toBeLessThan(100);
    const mediumFinding = report.findings.find(f => f.param === "utm_medium");
    expect(mediumFinding?.type).toBe("warning");
    expect(mediumFinding?.message).toContain("clean snake_case");
  });

  it("flags spaces as warnings", () => {
    const report = analyzeUrl("https://example.com?utm_source=facebook&utm_medium=paid%20social&utm_campaign=test");
    expect(report.status).toBe("warning");
    const mediumFinding = report.findings.find(f => f.param === "utm_medium");
    expect(mediumFinding?.message).toContain("contains spaces");
  });

  it("generates a fixed URL", () => {
    const report = analyzeUrl("https://example.com?utm_source=FB&utm_medium=Paid%20Social&utm_campaign=Summer_Sale");
    expect(report.fixedUrl).toBe("https://example.com/?utm_source=fb&utm_medium=paid_social&utm_campaign=summer_sale");
  });

  it("returns error for URL with no UTM params", () => {
    const report = analyzeUrl("https://example.com");
    expect(report.status).toBe("error");
    expect(report.findings[0].message).toBe("No UTM parameters found");
  });
});
