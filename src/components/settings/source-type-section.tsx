"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Info, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { getSourceTypes, saveSourceType, deleteSourceType, getMediums } from "@/lib/storage";
import { ALL_PLATFORMS } from "@/lib/utm-config";
import type { SourceType, UtmMedium } from "@/lib/types";

export function SourceTypeSection() {
  const [sourceTypes, setSourceTypes] = useState<SourceType[]>([]);
  const [mediums, setMediums] = useState<UtmMedium[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [utmSource, setUtmSource] = useState("auto");
  const [utmMedium, setUtmMedium] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  const loadData = useCallback(() => {
    setSourceTypes(getSourceTypes());
    setMediums(getMediums());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleAdd() {
    if (!name.trim()) {
      toast.error("Source type name is required");
      return;
    }
    if (!utmMedium) {
      toast.error("Please select a medium");
      return;
    }
    if (selectedPlatforms.length === 0) {
      toast.error("Select at least one platform");
      return;
    }

    saveSourceType({
      name: name.trim(),
      utm_source: utmSource.trim(),
      utm_medium: utmMedium,
      platforms: selectedPlatforms,
      isDefault: false,
    });

    toast.success(`Source type "${name}" created`);
    setName("");
    setUtmSource("auto");
    setUtmMedium("");
    setSelectedPlatforms([]);
    setIsAdding(false);
    loadData();
  }

  function handleDelete(id: string) {
    deleteSourceType(id);
    toast.success("Source type deleted");
    loadData();
  }

  function togglePlatform(platformValue: string) {
    setSelectedPlatforms((prev) =>
      prev.includes(platformValue)
        ? prev.filter((p) => p !== platformValue)
        : [...prev, platformValue]
    );
  }

  return (
    <Card className="border-indigo-100 shadow-sm overflow-hidden">
      <CardHeader className="bg-white border-b border-indigo-50 py-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold text-indigo-950 flex items-center gap-2">
              Source Types
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="size-4 text-neutral-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    Source Types group platforms together and define their default utm_source and utm_medium values.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <CardDescription>
              Configure how different distribution channels are mapped to UTMs.
            </CardDescription>
          </div>
          <Button
            variant={isAdding ? "outline" : "default"}
            size="sm"
            onClick={() => setIsAdding(!isAdding)}
            className="gap-2"
          >
            {isAdding ? (
              <>
                <ChevronUp className="size-4" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="size-4" />
                Add Source Type
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6 bg-white/50">
        {/* Add Form */}
        {isAdding && (
          <div className="space-y-4 p-4 rounded-lg bg-indigo-50/50 border border-indigo-100 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="source-name">Source Type Name</Label>
                <Input
                  id="source-name"
                  placeholder="e.g., Influencer Marketing"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="utm-medium-select">Default utm_medium</Label>
                <Select value={utmMedium} onValueChange={setUtmMedium}>
                  <SelectTrigger id="utm-medium-select" className="bg-white">
                    <SelectValue placeholder="Select a medium" />
                  </SelectTrigger>
                  <SelectContent>
                    {mediums.map((m) => (
                      <SelectItem key={m.id} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="utm-source-val">Default utm_source</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="size-3 text-neutral-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Use &quot;auto&quot; to inherit the platform&apos;s default name (e.g., facebook).
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="utm-source-val"
                  placeholder="auto"
                  value={utmSource}
                  onChange={(e) => setUtmSource(e.target.value)}
                  className="bg-white font-mono text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Associated Platforms</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-3 bg-white rounded-md border border-indigo-100">
                {ALL_PLATFORMS.map((platform) => (
                  <div key={platform.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`p-${platform.value}`}
                      checked={selectedPlatforms.includes(platform.value)}
                      onCheckedChange={() => togglePlatform(platform.value)}
                    />
                    <label
                      htmlFor={`p-${platform.value}`}
                      className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {platform.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={handleAdd} className="gap-2 shadow-sm">
                <Plus className="size-4" />
                Create Source Type
              </Button>
            </div>
          </div>
        )}

        {/* List */}
        <div className="space-y-3">
          {sourceTypes.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground border border-dashed rounded-lg bg-white flex flex-col items-center gap-2">
              <p>No custom source types added yet.</p>
              <p className="text-xs">Defaults are currently hardcoded in the generator.</p>
            </div>
          ) : (
            sourceTypes.map((type) => (
              <div
                key={type.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border bg-white hover:border-indigo-200 hover:shadow-sm transition-all group gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-950">{type.name}</span>
                    {type.isDefault && (
                      <Badge variant="outline" className="text-[10px] uppercase tracking-wider h-4 py-0 border-indigo-200 text-indigo-600">
                        System Default
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-3 text-xs font-mono">
                    <span className="text-neutral-500">
                      source: <span className="text-indigo-600">{type.utm_source}</span>
                    </span>
                    <span className="text-neutral-500">
                      medium: <span className="text-indigo-600">{type.utm_medium}</span>
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 max-w-xs">
                  {type.platforms.map((p) => (
                    <Badge key={p} variant="secondary" className="text-[10px] bg-indigo-50 text-indigo-700 border-indigo-100">
                      {ALL_PLATFORMS.find((plat) => plat.value === p)?.label || p}
                    </Badge>
                  ))}
                </div>

                {!type.isDefault && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(type.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-red-50 ml-auto"
                    aria-label={`Delete ${type.name}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
