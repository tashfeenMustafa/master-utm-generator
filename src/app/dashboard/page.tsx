"use client";

import { useMemo } from "react";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentLinks } from "@/components/dashboard/recent-links";
import { IntegrationStatus } from "@/components/dashboard/integration-status";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { getLinks, getConnections } from "@/lib/storage";

export default function DashboardPage() {
  const links = useMemo(() => getLinks(), []);
  const connections = useMemo(() => getConnections(), []);

  return (
    <main className="flex flex-1 flex-col overflow-hidden bg-slate-50">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl space-y-6 p-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-indigo-950">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              Overview of your UTM tracking links and integrations
            </p>
          </div>

          {/* Stats Grid */}
          <StatsGrid />

          {/* Main Grid */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            {/* Left Column - Chart and Actions */}
            <div className="space-y-6 lg:col-span-2">
              <TrendChart links={links} />
              <QuickActions />
            </div>

            {/* Right Column - Recent and Integrations */}
            <div className="space-y-6">
              <RecentLinks links={links} />
              <IntegrationStatus connections={connections} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
