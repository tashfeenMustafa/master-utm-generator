// Phase 2: Replace with real LinkedIn Ads API call
import { MOCK_ADS_DATA } from "@/lib/mock/ads-data";
import type { AdCampaign } from "@/lib/types";

export async function fetchLinkedInCampaigns(): Promise<AdCampaign[]> {
  return MOCK_ADS_DATA.filter((c) => c.platform === "linkedin");
}
