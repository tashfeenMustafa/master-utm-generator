"use client";

import { GoogleSheetsConnection } from "@/components/settings/google-sheets-connection";
import { AirtableConnection } from "@/components/settings/airtable-connection";
import { AdPlatformConnections } from "@/components/settings/ad-platform-connections";

export default function SettingsConnectionsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Connections</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your connected platforms and data sources for importing UTM
          values.
        </p>
      </div>

      <GoogleSheetsConnection />

      <AirtableConnection />

      <AdPlatformConnections />
    </div>
  );
}
