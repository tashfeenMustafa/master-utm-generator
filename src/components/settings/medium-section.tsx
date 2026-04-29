"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Info } from "lucide-react";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toSnakeCase } from "@/lib/utils/to-snake-case";
import { getMediums, saveMedium, deleteMedium } from "@/lib/storage";
import type { UtmMedium } from "@/lib/types";

export function MediumSection() {
  const [mediums, setMediums] = useState<UtmMedium[]>([]);
  const [label, setLabel] = useState("");
  const snakeValue = toSnakeCase(label);

  const loadMediums = useCallback(() => {
    setMediums(getMediums());
  }, []);

  useEffect(() => {
    loadMediums();
  }, [loadMediums]);

  function handleAdd() {
    if (!label.trim()) {
      toast.error("Label is required");
      return;
    }

    const newMedium = saveMedium({
      label: label.trim(),
      value: snakeValue,
    });

    if (newMedium) {
      toast.success(`Medium "${label}" added`);
      setLabel("");
      loadMediums();
    } else {
      toast.error("This medium already exists");
    }
  }

  function handleDelete(id: string) {
    deleteMedium(id);
    toast.success("Medium deleted");
    loadMediums();
  }

  return (
    <Card className="border-indigo-100 shadow-sm overflow-hidden">
      <CardHeader className="bg-white border-b border-indigo-50 py-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold text-indigo-950 flex items-center gap-2">
              utm_medium Options
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="size-4 text-neutral-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    Define the available mediums for your tracking links. These are used to group your traffic sources.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <CardDescription>
              Manage custom mediums (e.g., organic_social, paid_search).
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6 bg-white/50">
        {/* Add Form */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end p-4 rounded-lg bg-indigo-50/50 border border-indigo-100">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="medium-label">Display Name</Label>
            <Input
              id="medium-label"
              placeholder="Paid Social"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="bg-white"
            />
          </div>
          <div className="flex-1 space-y-1.5">
            <Label>Value (Auto-snake_case)</Label>
            <div className="h-10 flex items-center px-3 rounded-md bg-white border border-indigo-100 font-mono text-sm text-indigo-700">
              {snakeValue || "—"}
            </div>
          </div>
          <Button onClick={handleAdd} className="gap-2 shadow-sm">
            <Plus className="size-4" />
            Add
          </Button>
        </div>

        {/* List */}
        <div className="space-y-2">
          {mediums.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground border border-dashed rounded-lg bg-white">
              No custom mediums added yet.
            </div>
          ) : (
            mediums.map((medium) => (
              <div
                key={medium.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-white hover:border-indigo-200 hover:shadow-sm transition-all group"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-indigo-950">{medium.label}</span>
                  <span className="text-xs font-mono text-indigo-600">{medium.value}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(medium.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-red-50"
                  aria-label={`Delete ${medium.label}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
