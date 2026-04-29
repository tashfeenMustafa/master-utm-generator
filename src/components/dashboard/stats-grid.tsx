"use client";

import { useEffect, useState } from "react";
import { Link2, Layers, BarChart2 } from "lucide-react";
import { getLinks } from "@/lib/storage";

export function StatsGrid() {
  const [stats, setStats] = useState({
    totalLinks: 0,
    activeCampaigns: 0,
    topPlatform: "None",
  });

  useEffect(() => {
    // Only run on client to avoid hydration mismatch
    const links = getLinks();
    
    // Total links
    const totalLinks = links.length;
    
    // Active campaigns (unique utm_campaigns)
    const campaigns = new Set(links.map(l => l.utm_campaign).filter(Boolean));
    const activeCampaigns = campaigns.size;
    
    // Most used platform (utm_source)
    const sourceCounts = links.reduce<Record<string, number>>((acc, l) => {
      const src = l.utm_source;
      if (src) acc[src] = (acc[src] || 0) + 1;
      return acc;
    }, {});
    
    let topPlatform = "None";
    let maxCount = 0;
    
    for (const [src, count] of Object.entries(sourceCounts)) {
      if (count > maxCount) {
        maxCount = count;
        topPlatform = src.charAt(0).toUpperCase() + src.slice(1);
      }
    }

    setStats({ totalLinks, activeCampaigns, topPlatform });
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white border rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 rounded-lg text-indigo-600">
            <Link2 className="size-5" />
          </div>
          <p className="text-sm font-medium text-neutral-500">Total Links Generated</p>
        </div>
        <p className="text-3xl font-bold text-indigo-950">{stats.totalLinks}</p>
      </div>
      
      <div className="bg-white border rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 rounded-lg text-indigo-600">
            <Layers className="size-5" />
          </div>
          <p className="text-sm font-medium text-neutral-500">Active Campaigns</p>
        </div>
        <p className="text-3xl font-bold text-indigo-950">{stats.activeCampaigns}</p>
      </div>

      <div className="bg-white border rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 rounded-lg text-indigo-600">
            <BarChart2 className="size-5" />
          </div>
          <p className="text-sm font-medium text-neutral-500">Most Used Platform</p>
        </div>
        <p className="text-3xl font-bold text-indigo-950 truncate">{stats.topPlatform}</p>
      </div>
    </div>
  );
}
