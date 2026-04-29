"use client";

import { useState } from "react";
import { Download, Upload, Share2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { ValueSection } from "@/components/settings/value-section";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { exportValues, importValues, getValues } from "@/lib/storage";
import { generateShareUrl } from "@/lib/sharing";
import { NamingConventionSection } from "@/components/settings/naming-convention-section";
import type { ManageableParameter } from "@/lib/types";

const PARAMETERS: ManageableParameter[] = [
  "utm_campaign",
  "utm_term",
  "utm_content",
];

export default function SettingsValuesPage() {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  function handleExport() {
    try {
      const data = exportValues();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `magicutm_library_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Library exported successfully");
    } catch {
      toast.error("Failed to export library");
    }
  }

  function handleImport() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const { imported, skipped } = importValues(content);
          toast.success(`Import complete: ${imported} added, ${skipped} skipped`);
          // Force refresh page to show new values
          window.location.reload();
        } catch (err: any) {
          toast.error(err.message || "Failed to import library");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  function handleShare() {
    const values = getValues();
    if (values.length === 0) {
      toast.error("Your library is empty. Add some values first!");
      return;
    }

    const url = generateShareUrl(
      { values: values.map(({ parameter, value, label }) => ({ parameter, value, label })) },
      window.location.origin
    );
    setShareUrl(url);
    setIsShareModalOpen(true);
  }

  async function copyShareUrl() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      toast.success("Share URL copied to clipboard");
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-950">UTM Values</h1>
          <p className="mt-1 text-muted-foreground">
            Manage dropdown values for your UTM parameters. These will appear as
            options when generating links.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleImport} className="gap-2">
            <Upload className="size-4" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download className="size-4" />
            Export
          </Button>
          <Button size="sm" onClick={handleShare} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            <Share2 className="size-4" />
            Share Library
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <NamingConventionSection />
        {PARAMETERS.map((param) => (
          <ValueSection key={param} parameter={param} />
        ))}
      </div>

      {/* Share Modal */}
      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Library</DialogTitle>
            <DialogDescription>
              Anyone with this link can view and import your naming conventions.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 py-4">
            <div className="grid flex-1 gap-2">
              <Input
                readOnly
                value={shareUrl}
                className="font-mono text-xs"
              />
            </div>
            <Button size="icon" onClick={copyShareUrl} className="shrink-0">
              {isCopied ? <Check className="size-4" /> : <Copy className="size-4" />}
            </Button>
          </div>
          <DialogFooter className="sm:justify-start">
            <p className="text-[10px] text-muted-foreground italic">
              Note: This link contains your entire value library. Be careful who you share it with.
            </p>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
