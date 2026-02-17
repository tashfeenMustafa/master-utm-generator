"use client";

import { ValueSection } from "@/components/settings/value-section";
import type { ManageableParameter } from "@/lib/types";

const PARAMETERS: ManageableParameter[] = [
  "utm_campaign",
  "utm_term",
  "utm_content",
];

export default function SettingsValuesPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">UTM Values</h1>
        <p className="mt-1 text-muted-foreground">
          Manage dropdown values for your UTM parameters. These will appear as
          options when generating links.
        </p>
      </div>
      {PARAMETERS.map((param) => (
        <ValueSection key={param} parameter={param} />
      ))}
    </div>
  );
}
