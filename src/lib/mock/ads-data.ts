import type { AdCampaign } from "@/lib/types";

function daysAgo(n: number): string {
  // Use a fixed reference date so SSR and client match exactly to prevent hydration errors
  const d = new Date("2026-05-01T12:00:00Z");
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export const MOCK_ADS_DATA: AdCampaign[] = [
  // ── Meta (7 campaigns) ──────────────────────────────────────────
  {
    id: "meta-001",
    platform: "meta",
    campaignName: "Spring Sale - Lookalike",
    status: "active",
    utm_source: "facebook",
    utm_medium: "paid_social",
    utm_campaign: "spring_sale_lookalike",
    utm_term: "{{adset.name}}",
    utm_content: "{{ad.name}}",
    utmTemplate:
      "https://example.com/shop?utm_source=facebook&utm_medium=paid_social&utm_campaign=spring_sale_lookalike&utm_term={{adset.name}}&utm_content={{ad.name}}",
    lastUpdated: daysAgo(1),
  },
  {
    id: "meta-002",
    platform: "meta",
    campaignName: "Brand Awareness - Video",
    status: "active",
    utm_source: "facebook",
    utm_medium: "paid_social",
    utm_campaign: "brand_awareness_video",
    utm_content: "{{ad.name}}",
    utmTemplate:
      "https://example.com?utm_source=facebook&utm_medium=paid_social&utm_campaign=brand_awareness_video&utm_content={{ad.name}}",
    lastUpdated: daysAgo(2),
  },
  {
    id: "meta-003",
    platform: "meta",
    campaignName: "Retargeting - Cart Abandoners",
    status: "active",
    utm_source: "facebook",
    utm_medium: "paid_social",
    utm_campaign: "retargeting_cart",
    utm_term: "{{adset.name}}",
    utm_content: "{{ad.name}}",
    utmTemplate:
      "https://example.com/cart?utm_source=facebook&utm_medium=paid_social&utm_campaign=retargeting_cart&utm_term={{adset.name}}&utm_content={{ad.name}}",
    lastUpdated: daysAgo(3),
  },
  {
    id: "meta-004",
    platform: "meta",
    campaignName: "Summer Promo - Stories",
    status: "paused",
    utm_source: "instagram",
    utm_medium: "paid_social",
    utm_campaign: "summer_promo_stories",
    utm_content: "{{ad.name}}",
    utmTemplate:
      "https://example.com/summer?utm_source=instagram&utm_medium=paid_social&utm_campaign=summer_promo_stories&utm_content={{ad.name}}",
    lastUpdated: daysAgo(8),
  },
  {
    id: "meta-005",
    platform: "meta",
    campaignName: "Lead Gen - Whitepaper",
    status: "completed",
    utm_source: "facebook",
    utm_medium: "paid_social",
    utm_campaign: "leadgen_whitepaper",
    utm_term: "{{adset.name}}",
    utm_content: "{{ad.name}}",
    utmTemplate:
      "https://example.com/whitepaper?utm_source=facebook&utm_medium=paid_social&utm_campaign=leadgen_whitepaper&utm_term={{adset.name}}&utm_content={{ad.name}}",
    lastUpdated: daysAgo(15),
  },
  {
    id: "meta-006",
    platform: "meta",
    campaignName: "Holiday Sale - Dynamic",
    status: "completed",
    utm_source: "facebook",
    utm_medium: "paid_social",
    utm_campaign: "holiday_sale_dynamic",
    utm_content: "{{ad.name}}",
    utmTemplate:
      "https://example.com/holiday?utm_source=facebook&utm_medium=paid_social&utm_campaign=holiday_sale_dynamic&utm_content={{ad.name}}",
    lastUpdated: daysAgo(25),
  },
  {
    id: "meta-007",
    platform: "meta",
    campaignName: "App Install - Mobile",
    status: "active",
    utm_source: "facebook",
    utm_medium: "paid_social",
    utm_campaign: "app_install_mobile",
    utm_term: "{{adset.name}}",
    utm_content: "{{ad.name}}",
    utmTemplate:
      "https://example.com/app?utm_source=facebook&utm_medium=paid_social&utm_campaign=app_install_mobile&utm_term={{adset.name}}&utm_content={{ad.name}}",
    lastUpdated: daysAgo(1),
  },

  // ── Google (6 campaigns) ────────────────────────────────────────
  {
    id: "google-001",
    platform: "google",
    campaignName: "Search - Brand Terms",
    status: "active",
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: "search_brand_terms",
    utm_term: "{keyword}",
    utm_content: "{creative}",
    utmTemplate:
      "https://example.com?utm_source=google&utm_medium=cpc&utm_campaign=search_brand_terms&utm_term={keyword}&utm_content={creative}",
    lastUpdated: daysAgo(0),
  },
  {
    id: "google-002",
    platform: "google",
    campaignName: "Search - Competitor",
    status: "active",
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: "search_competitor",
    utm_term: "{keyword}",
    utm_content: "{creative}",
    utmTemplate:
      "https://example.com?utm_source=google&utm_medium=cpc&utm_campaign=search_competitor&utm_term={keyword}&utm_content={creative}",
    lastUpdated: daysAgo(2),
  },
  {
    id: "google-003",
    platform: "google",
    campaignName: "Display - Remarketing",
    status: "active",
    utm_source: "google",
    utm_medium: "display",
    utm_campaign: "display_remarketing",
    utm_content: "{creative}",
    utmTemplate:
      "https://example.com?utm_source=google&utm_medium=display&utm_campaign=display_remarketing&utm_content={creative}",
    lastUpdated: daysAgo(4),
  },
  {
    id: "google-004",
    platform: "google",
    campaignName: "Shopping - Product Feed",
    status: "paused",
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: "shopping_product_feed",
    utm_term: "{product_id}",
    utmTemplate:
      "https://example.com/shop?utm_source=google&utm_medium=cpc&utm_campaign=shopping_product_feed&utm_term={product_id}",
    lastUpdated: daysAgo(10),
  },
  {
    id: "google-005",
    platform: "google",
    campaignName: "YouTube - Pre-roll",
    status: "completed",
    utm_source: "google",
    utm_medium: "video",
    utm_campaign: "youtube_preroll",
    utm_content: "{creative}",
    utmTemplate:
      "https://example.com?utm_source=google&utm_medium=video&utm_campaign=youtube_preroll&utm_content={creative}",
    lastUpdated: daysAgo(20),
  },
  {
    id: "google-006",
    platform: "google",
    campaignName: "Performance Max - All",
    status: "active",
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: "pmax_all",
    utm_term: "{keyword}",
    utm_content: "{creative}",
    utmTemplate:
      "https://example.com?utm_source=google&utm_medium=cpc&utm_campaign=pmax_all&utm_term={keyword}&utm_content={creative}",
    lastUpdated: daysAgo(1),
  },

  // ── LinkedIn (5 campaigns) ──────────────────────────────────────
  {
    id: "linkedin-001",
    platform: "linkedin",
    campaignName: "Sponsored Content - Decision Makers",
    status: "active",
    utm_source: "linkedin",
    utm_medium: "paid_social",
    utm_campaign: "sponsored_decision_makers",
    utm_content: "{{creative_name}}",
    utmTemplate:
      "https://example.com/enterprise?utm_source=linkedin&utm_medium=paid_social&utm_campaign=sponsored_decision_makers&utm_content={{creative_name}}",
    lastUpdated: daysAgo(1),
  },
  {
    id: "linkedin-002",
    platform: "linkedin",
    campaignName: "InMail - Event Invite",
    status: "active",
    utm_source: "linkedin",
    utm_medium: "paid_social",
    utm_campaign: "inmail_event_invite",
    utm_content: "{{creative_name}}",
    utmTemplate:
      "https://example.com/event?utm_source=linkedin&utm_medium=paid_social&utm_campaign=inmail_event_invite&utm_content={{creative_name}}",
    lastUpdated: daysAgo(3),
  },
  {
    id: "linkedin-003",
    platform: "linkedin",
    campaignName: "Lead Gen Form - Ebook",
    status: "paused",
    utm_source: "linkedin",
    utm_medium: "paid_social",
    utm_campaign: "leadgen_ebook",
    utm_content: "{{creative_name}}",
    utmTemplate:
      "https://example.com/ebook?utm_source=linkedin&utm_medium=paid_social&utm_campaign=leadgen_ebook&utm_content={{creative_name}}",
    lastUpdated: daysAgo(12),
  },
  {
    id: "linkedin-004",
    platform: "linkedin",
    campaignName: "Text Ads - Hiring",
    status: "completed",
    utm_source: "linkedin",
    utm_medium: "paid_social",
    utm_campaign: "text_ads_hiring",
    utmTemplate:
      "https://example.com/careers?utm_source=linkedin&utm_medium=paid_social&utm_campaign=text_ads_hiring",
    lastUpdated: daysAgo(22),
  },
  {
    id: "linkedin-005",
    platform: "linkedin",
    campaignName: "Video Ads - Product Demo",
    status: "active",
    utm_source: "linkedin",
    utm_medium: "paid_social",
    utm_campaign: "video_product_demo",
    utm_content: "{{creative_name}}",
    utmTemplate:
      "https://example.com/demo?utm_source=linkedin&utm_medium=paid_social&utm_campaign=video_product_demo&utm_content={{creative_name}}",
    lastUpdated: daysAgo(5),
  },
];
