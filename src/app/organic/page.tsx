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
import { IntroSection } from "@/components/organic/intro-section";
import { PremiumFeatureBanner } from "@/components/layout/premium-feature-banner";
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
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-black text-indigo-950 tracking-tight">Organic & DMs</h1>
          <p className="text-muted-foreground mt-1">
            Build pixel-perfect tracking links for social media and direct messages.
          </p>
        </div>
        <Button 
          onClick={() => setDrawerOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 gap-2 font-bold"
        >
          <Plus className="size-4" />
          Generate UTM Link
        </Button>
      </div>

      <PremiumFeatureBanner />

      <IntroSection />

      {lastGenerated && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <ResultCard
            link={lastGenerated}
            onDismiss={() => setLastGenerated(null)}
          />
        </div>
      )}

      <LinksTable refreshKey={refreshKey} onAction={() => setDrawerOpen(true)} />

      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-20 right-6 md:hidden z-40">
        <Button 
          onClick={() => setDrawerOpen(true)}
          size="icon"
          className="h-14 w-14 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-2xl shadow-indigo-300 ring-4 ring-white"
        >
          <Plus className="size-6" />
        </Button>
      </div>

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
