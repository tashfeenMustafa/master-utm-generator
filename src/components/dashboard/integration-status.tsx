"use client";

import Link from "next/link";
import { CheckCircle, AlertCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataConnection } from "@/lib/types";

interface IntegrationStatusProps {
  connections: DataConnection[];
}

export function IntegrationStatus({ connections }: IntegrationStatusProps) {
  const googleSheets = connections.find((c) => c.type === "google_sheets");
  const airtable = connections.find((c) => c.type === "airtable");

  const integrations = [
    {
      name: "Google Sheets",
      connected: googleSheets?.status === "active",
      icon: googleSheets?.status === "active" ? CheckCircle : AlertCircle,
      url: "/settings/connections",
    },
    {
      name: "Airtable",
      connected: airtable?.status === "active",
      icon: airtable?.status === "active" ? CheckCircle : AlertCircle,
      url: "/settings/connections",
    },
  ];

  return (
    <div className="rounded-[10px] border border-indigo-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-indigo-950">Integrations</h3>
          <p className="text-xs text-muted-foreground">
            Sync UTM values from external sources
          </p>
        </div>
        <Zap className="h-5 w-5 text-indigo-600" />
      </div>

      <div className="space-y-3">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          return (
            <div
              key={integration.name}
              className="flex items-center justify-between rounded-md border border-border bg-background p-3"
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-4 w-4 ${
                    integration.connected
                      ? "text-indigo-600"
                      : "text-amber-600"
                  }`}
                />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {integration.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {integration.connected ? "Connected" : "Not connected"}
                  </p>
                </div>
              </div>
              <Link href={integration.url}>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                >
                  {integration.connected ? "Manage" : "Connect"}
                </Button>
              </Link>
            </div>
          );
        })}
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">
          Learn how to import custom values from your tools.
        </p>
      </div>
    </div>
  );
}
