"use client";

import { MediumSection } from "@/components/settings/medium-section";
import { SourceTypeSection } from "@/components/settings/source-type-section";

export default function SourceTypesPage() {
  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-indigo-950">Source Types & Mediums</h1>
        <p className="mt-1 text-muted-foreground">
          Configure naming conventions for your distribution channels and manage available mediums.
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <SourceTypeSection />
        </section>
        
        <section>
          <MediumSection />
        </section>
      </div>
    </div>
  );
}
