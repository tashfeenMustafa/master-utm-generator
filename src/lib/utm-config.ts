// ── Channel types ────────────────────────────────────────────────
export const CHANNEL_TYPES = [
  { value: "organic_social", label: "Organic Social" },
  { value: "blog", label: "Blog" },
  { value: "warm_dms", label: "Warm DMs" },
  { value: "cold_dms", label: "Cold DMs" },
] as const;

export type ChannelType = (typeof CHANNEL_TYPES)[number]["value"];

// ── Defaults for Seeding ─────────────────────────────────────────

export const DEFAULT_MEDIUMS = [
  { label: "Organic Social", value: "organic_social" },
  { label: "Organic Search", value: "organic_search" },
  { label: "Warm DMs", value: "warm_dms" },
  { label: "Cold DMs", value: "cold_dms" },
  { label: "Paid Social", value: "paid_social" },
  { label: "Paid Search", value: "paid_search" },
  { label: "Email", value: "email" },
  { label: "Referral", value: "referral" },
];

export const DEFAULT_SOURCE_TYPES = [
  { 
    name: "Organic Social", 
    utm_source: "auto", 
    utm_medium: "organic_social", 
    platforms: ["facebook", "instagram", "linkedin", "tiktok", "x_twitter", "reddit"],
    isDefault: true
  },
  { 
    name: "Blog", 
    utm_source: "google", 
    utm_medium: "organic_search", 
    platforms: ["google"],
    isDefault: true
  },
  { 
    name: "Warm DMs", 
    utm_source: "auto", 
    utm_medium: "warm_dms", 
    platforms: ["instagram", "linkedin", "tiktok", "x_twitter", "facebook", "reddit"],
    isDefault: true
  },
  { 
    name: "Cold DMs", 
    utm_source: "auto", 
    utm_medium: "cold_dms", 
    platforms: ["instagram", "linkedin", "tiktok", "x_twitter", "facebook", "reddit"],
    isDefault: true
  },
];

// ── Platforms ────────────────────────────────────────────────────
export interface PlatformConfig {
  value: string;
  label: string;
  utmSource: string;
  postFormats: string[];
}

export const SOCIAL_PLATFORMS: PlatformConfig[] = [
  { value: "facebook", label: "Facebook", utmSource: "facebook", postFormats: ["Reels", "Image", "Carousel", "Text"] },
  { value: "instagram", label: "Instagram", utmSource: "instagram", postFormats: ["Reels", "Image", "Carousel"] },
  { value: "linkedin", label: "LinkedIn", utmSource: "linkedin", postFormats: ["Reels", "Image", "Carousel", "Text", "Article"] },
  { value: "tiktok", label: "TikTok", utmSource: "tiktok", postFormats: ["Video", "Image", "Carousel"] },
  { value: "x_twitter", label: "X/Twitter", utmSource: "x_twitter", postFormats: ["Reels", "Image", "Carousel", "Text"] },
  { value: "reddit", label: "Reddit", utmSource: "reddit", postFormats: ["Image", "Carousel", "Text"] },
];

export const BLOG_PLATFORM: PlatformConfig = {
  value: "google",
  label: "Google",
  utmSource: "google",
  postFormats: [],
};

export const DM_PLATFORMS: PlatformConfig[] = [
  { value: "instagram", label: "Instagram", utmSource: "instagram", postFormats: ["Reels", "Image", "Carousel"] },
  { value: "linkedin", label: "LinkedIn", utmSource: "linkedin", postFormats: ["Reels", "Image", "Carousel", "Text", "Article"] },
  { value: "tiktok", label: "TikTok", utmSource: "tiktok", postFormats: ["Video", "Image", "Carousel"] },
  { value: "x_twitter", label: "X/Twitter", utmSource: "x_twitter", postFormats: ["Reels", "Image", "Carousel", "Text"] },
  { value: "facebook", label: "Facebook", utmSource: "facebook", postFormats: ["Reels", "Image", "Carousel", "Text"] },
  { value: "reddit", label: "Reddit", utmSource: "reddit", postFormats: ["Image", "Carousel", "Text"] },
];

export const ALL_PLATFORMS = Array.from(
  new Map(
    [...SOCIAL_PLATFORMS, BLOG_PLATFORM, ...DM_PLATFORMS].map((p) => [p.value, p])
  ).values()
);

export function getPlatformsForChannel(channel: ChannelType): PlatformConfig[] {
  switch (channel) {
    case "organic_social":
      return SOCIAL_PLATFORMS;
    case "blog":
      return [BLOG_PLATFORM];
    case "warm_dms":
    case "cold_dms":
      return DM_PLATFORMS;
  }
}

// ── UTM medium derivation ────────────────────────────────────────
export function getUtmMedium(channel: ChannelType): string {
  switch (channel) {
    case "organic_social":
      return "organic_social";
    case "blog":
      return "organic_search";
    case "warm_dms":
      return "warm_dms";
    case "cold_dms":
      return "cold_dms";
  }
}

// ── UTM content composition ──────────────────────────────────────
export function composeUtmContent(
  channel: ChannelType,
  postFormat: string,
  contentHook: string
): string {
  if (channel === "blog") {
    return contentHook;
  }
  if (!postFormat || !contentHook) return "";
  return `${postFormat}-${contentHook}`;
}

// ── URL building ─────────────────────────────────────────────────
export function buildUtmUrl(
  baseUrl: string,
  params: Record<string, string>
): string {
  const separator = baseUrl.includes("?") ? "&" : "?";
  const query = Object.entries(params)
    .filter(([, v]) => v)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  return query ? `${baseUrl}${separator}${query}` : baseUrl;
}

// ── URL validation ───────────────────────────────────────────────
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
