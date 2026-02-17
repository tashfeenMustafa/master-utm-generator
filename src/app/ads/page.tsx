import { Megaphone, Info } from "lucide-react";
import { AdPlatformStatus } from "@/components/ads/ad-platform-status";
import { AdsTable } from "@/components/ads/ads-table";

export default function AdsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Megaphone className="size-6" />
          Ads
        </h1>
        <p className="mt-1 text-muted-foreground">
          View UTM parameters from your paid advertising campaigns.
        </p>
      </div>

      <AdPlatformStatus />

      <div className="flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-200">
        <Info className="size-4 mt-0.5 shrink-0" />
        <p>
          Showing mock data. Connect your ad accounts in{" "}
          <a href="/settings/connections" className="font-medium underline">
            Settings
          </a>{" "}
          to see live campaign UTMs.
        </p>
      </div>

      <AdsTable />
    </div>
  );
}
