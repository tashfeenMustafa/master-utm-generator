import { describe, it, expect } from "vitest";
import { MOCK_ADS_DATA } from "./ads-data";

describe("MOCK_ADS_DATA", () => {
  it("has at least 15 campaigns", () => {
    expect(MOCK_ADS_DATA.length).toBeGreaterThanOrEqual(15);
  });

  it("includes all three platforms", () => {
    const platforms = new Set(MOCK_ADS_DATA.map((c) => c.platform));
    expect(platforms.has("meta")).toBe(true);
    expect(platforms.has("google")).toBe(true);
    expect(platforms.has("linkedin")).toBe(true);
  });

  it("has correct required fields on every campaign", () => {
    for (const campaign of MOCK_ADS_DATA) {
      expect(campaign.id).toBeTruthy();
      expect(["meta", "google", "linkedin"]).toContain(campaign.platform);
      expect(campaign.campaignName).toBeTruthy();
      expect(["active", "paused", "completed"]).toContain(campaign.status);
      expect(campaign.utm_source).toBeTruthy();
      expect(campaign.utm_medium).toBeTruthy();
      expect(campaign.utm_campaign).toBeTruthy();
      expect(campaign.utmTemplate).toMatch(/^https?:\/\//);
      expect(campaign.lastUpdated).toBeTruthy();
      // Verify ISO 8601 date
      expect(new Date(campaign.lastUpdated).toISOString()).toBeTruthy();
    }
  });

  it("has a variety of statuses", () => {
    const statuses = new Set(MOCK_ADS_DATA.map((c) => c.status));
    expect(statuses.has("active")).toBe(true);
    expect(statuses.has("paused")).toBe(true);
    expect(statuses.has("completed")).toBe(true);
  });

  it("has unique IDs", () => {
    const ids = MOCK_ADS_DATA.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has meta campaigns with dynamic placeholders", () => {
    const metaCampaigns = MOCK_ADS_DATA.filter((c) => c.platform === "meta");
    expect(metaCampaigns.length).toBeGreaterThanOrEqual(4);
    const hasPlaceholder = metaCampaigns.some((c) => c.utmTemplate.includes("{{"));
    expect(hasPlaceholder).toBe(true);
  });

  it("has google campaigns with ValueTrack parameters", () => {
    const googleCampaigns = MOCK_ADS_DATA.filter((c) => c.platform === "google");
    expect(googleCampaigns.length).toBeGreaterThanOrEqual(4);
    const hasValueTrack = googleCampaigns.some((c) => c.utmTemplate.includes("{keyword}"));
    expect(hasValueTrack).toBe(true);
  });

  it("has linkedin campaigns", () => {
    const linkedinCampaigns = MOCK_ADS_DATA.filter((c) => c.platform === "linkedin");
    expect(linkedinCampaigns.length).toBeGreaterThanOrEqual(4);
  });
});
