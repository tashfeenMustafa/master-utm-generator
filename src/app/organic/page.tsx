"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { UtmGeneratorForm } from "@/components/organic/utm-generator-form";
import { ResultCard } from "@/components/organic/result-card";
import { LinksTable } from "@/components/organic/links-table";
import type { UtmLink } from "@/lib/types";

export default function OrganicPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<UtmLink | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  function handleGenerated(link: UtmLink) {
    setLastGenerated(link);
    setDrawerOpen(false);
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Organic & DMs</h1>
          <p className="mt-1 text-muted-foreground">
            Generate UTM links for organic social media posts and direct messages.
          </p>
        </div>
        <Button onClick={() => setDrawerOpen(true)}>
          <Plus className="size-4" />
          Generate UTM Link
        </Button>
      </div>

      {lastGenerated && (
        <ResultCard
          link={lastGenerated}
          onDismiss={() => setLastGenerated(null)}
        />
      )}

      <LinksTable refreshKey={refreshKey} />

      {/* Generator Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Generate UTM Link</SheetTitle>
            <SheetDescription>
              Fill in the fields below to generate a tracked URL.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-4">
            <UtmGeneratorForm
              onGenerated={handleGenerated}
              onCancel={() => setDrawerOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
