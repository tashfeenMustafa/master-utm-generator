"use client";

import { useState, useEffect } from "react";
import { Settings2, Info, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
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
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getNamingConventions, updateNamingConventions } from "@/lib/storage";
import type { NamingConventions, NamingRule } from "@/lib/types";

export function NamingConventionSection() {
  const [conventions, setConventions] = useState<NamingConventions | null>(null);

  useEffect(() => {
    setConventions(getNamingConventions());
  }, []);

  if (!conventions) return null;

  function handleUpdateCampaignRule(rule: NamingRule) {
    const updated = updateNamingConventions({
      utm_campaign: { ...conventions!.utm_campaign, rule },
    });
    setConventions(updated);
    toast.success("Campaign rule updated");
  }

  function handleUpdateTermRule(rule: NamingRule) {
    const updated = updateNamingConventions({
      utm_term: { ...conventions!.utm_term, rule },
    });
    setConventions(updated);
    toast.success("Term rule updated");
  }

  function handleUpdateContentRule(rule: "format-hook" | "snake_case") {
    const updated = updateNamingConventions({
      utm_content: { ...conventions!.utm_content, rule },
    });
    setConventions(updated);
    toast.success("Content rule updated");
  }

  return (
    <Card className="border-indigo-100 shadow-sm overflow-hidden">
      <CardHeader className="bg-white border-b border-indigo-50 py-4">
        <div className="flex items-center gap-2">
          <Settings2 className="size-5 text-indigo-600" />
          <div>
            <CardTitle className="text-lg font-bold text-indigo-950">Naming Conventions</CardTitle>
            <CardDescription>
              Define how your UTM parameters should be auto-formatted.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-8 bg-white/50">
        {/* Campaign & Term Rules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-1.5">
              <Label className="text-indigo-950 font-bold">Campaign Naming Rule</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="size-3.5 text-neutral-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>How the utm_campaign field is formatted.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select 
              value={conventions.utm_campaign.rule} 
              onValueChange={(val) => handleUpdateCampaignRule(val as NamingRule)}
            >
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="snake_case">snake_case (Recommended)</SelectItem>
                <SelectItem value="lowercase">lowercase only</SelectItem>
                <SelectItem value="none">No formatting (Raw)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground italic px-1">
              Example: &quot;Summer Sale&quot; → <span className="text-indigo-600 font-mono">
                {conventions.utm_campaign.rule === "snake_case" ? "summer_sale" : 
                 conventions.utm_campaign.rule === "lowercase" ? "summer sale" : "Summer Sale"}
              </span>
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-1.5">
              <Label className="text-indigo-950 font-bold">Term/Theme Naming Rule</Label>
            </div>
            <Select 
              value={conventions.utm_term.rule} 
              onValueChange={(val) => handleUpdateTermRule(val as NamingRule)}
            >
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="snake_case">snake_case</SelectItem>
                <SelectItem value="lowercase">lowercase</SelectItem>
                <SelectItem value="none">Raw</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content Rule */}
        <div className="pt-6 border-t border-indigo-50 space-y-4">
          <div className="flex items-center gap-1.5">
            <Label className="text-indigo-950 font-bold text-base">Content Composition Rule</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="size-3.5 text-neutral-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  utm_content is often composed of multiple values. Define the logic here.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wider text-slate-400 font-black">Logic</Label>
              <Select 
                value={conventions.utm_content.rule} 
                onValueChange={(val) => handleUpdateContentRule(val as any)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="format-hook">Format + Hook (e.g. reels-intro)</SelectItem>
                  <SelectItem value="snake_case">Simple snake_case only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-start gap-3">
              <CheckCircle2 className="size-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-indigo-950">Active Convention</p>
                <p className="text-[11px] text-indigo-700 font-mono mt-1">
                  {conventions.utm_content.rule === "format-hook" 
                    ? "{post_format}-{content_hook}" 
                    : "{content_hook}"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
