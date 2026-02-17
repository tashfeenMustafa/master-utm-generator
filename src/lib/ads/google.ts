// Phase 2: Replace with real Google Ads API call
import { MOCK_ADS_DATA } from "@/lib/mock/ads-data";
import type { AdCampaign } from "@/lib/types";

export async function fetchGoogleCampaigns(): Promise<AdCampaign[]> {
  return MOCK_ADS_DATA.filter((c) => c.platform === "google");
}
