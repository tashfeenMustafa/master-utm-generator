"use client";

import { useState, useMemo, useCallback, useRef, useEffect, Fragment } from "react";
import { Info, Wand2, Plus, Trash2, ChevronDown, ChevronUp, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Combobox } from "@/components/ui/combobox";
import { FormSection } from "./form-section";
import { toSnakeCase } from "@/lib/utils/to-snake-case";
import { getValues, addValue, addLink, getSourceTypes, getUser, getNamingConventions } from "@/lib/storage";
import type { UtmLink, SourceType, NamingRule } from "@/lib/types";
import { PaywallOverlay } from "@/components/shared/paywall-overlay";
import Link from "next/link";
import {
  type ChannelType,
  ALL_PLATFORMS,
  composeUtmContent,
  buildUtmUrl,
  isValidUrl,
} from "@/lib/utm-config";

function FieldTooltip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="size-3.5 text-neutral-400 cursor-help" />
      </TooltipTrigger>
      <TooltipContent side="top">{text}</TooltipContent>
    </Tooltip>
  );
}

interface FormErrors {
  baseUrl?: string;
  sourceTypeId?: string;
  platform?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  postFormat?: string;
  contentHook?: string;
}

interface CustomParam {
  id: string;
  key: string;
  value: string;
}

interface UtmGeneratorFormProps {
  onGenerated: (link: UtmLink) => void;
  onCancel: () => void;
}

function applyNamingRule(val: string, rule: NamingRule): string {
  if (!val) return "";
  switch (rule) {
    case "snake_case": return toSnakeCase(val);
    case "lowercase": return val.toLowerCase();
    default: return val;
  }
}

export function UtmGeneratorForm({ onGenerated, onCancel }: UtmGeneratorFormProps) {
  const [baseUrl, setBaseUrl] = useState("");
  const [sourceTypeId, setSourceTypeId] = useState<string>("");
  const [platform, setPlatform] = useState("");
  
  // Editable source/medium
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");

  const [utmCampaign, setUtmCampaign] = useState("");
  const [utmTerm, setUtmTerm] = useState("");
  const [postFormat, setPostFormat] = useState("");
  const [contentHook, setContentHook] = useState("");
  
  // Advanced/Custom Params
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [customParams, setCustomParams] = useState<CustomParam[]>([]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  // Refs for scroll-to-first-error
  const fieldRefs = {
    baseUrl: useRef<HTMLDivElement>(null),
    sourceTypeId: useRef<HTMLDivElement>(null),
    platform: useRef<HTMLDivElement>(null),
    utmSource: useRef<HTMLDivElement>(null),
    utmMedium: useRef<HTMLDivElement>(null),
    utmCampaign: useRef<HTMLDivElement>(null),
    utmTerm: useRef<HTMLDivElement>(null),
    postFormat: useRef<HTMLDivElement>(null),
    contentHook: useRef<HTMLDivElement>(null),
  };

  const sourceTypes = useMemo(() => getSourceTypes(), []);
  const conventions = useMemo(() => getNamingConventions(), []);
  
  const selectedSourceType = useMemo(
    () => sourceTypes.find((s) => s.id === sourceTypeId),
    [sourceTypes, sourceTypeId]
  );

  const platforms = useMemo(() => {
    if (!selectedSourceType) return [];
    return ALL_PLATFORMS.filter((p) => selectedSourceType.platforms.includes(p.value));
  }, [selectedSourceType]);

  const selectedPlatform = useMemo(
    () => platforms.find((p) => p.value === platform),
    [platforms, platform]
  );

  const isBlog = selectedSourceType?.name.toLowerCase() === "blog";
  
  // Formatted values based on naming conventions
  const campaignFormatted = useMemo(() => applyNamingRule(utmCampaign, conventions.utm_campaign.rule), [utmCampaign, conventions]);
  const termFormatted = useMemo(() => applyNamingRule(utmTerm, conventions.utm_term.rule), [utmTerm, conventions]);
  const hookFormatted = useMemo(() => toSnakeCase(contentHook), [contentHook]);
  const formatFormatted = useMemo(() => toSnakeCase(postFormat), [postFormat]);
  const sourceFormatted = useMemo(() => toSnakeCase(utmSource), [utmSource]);
  const mediumFormatted = useMemo(() => toSnakeCase(utmMedium), [utmMedium]);

  // Auto-fill source & medium when platform/source type changes
  useEffect(() => {
    if (selectedPlatform) {
      if (selectedSourceType?.utm_source === "auto") {
        setUtmSource(selectedPlatform.utmSource);
      } else if (selectedSourceType?.utm_source) {
        setUtmSource(selectedSourceType.utm_source);
      }
    }
  }, [selectedPlatform, selectedSourceType]);

  useEffect(() => {
    if (selectedSourceType) {
      setUtmMedium(selectedSourceType.utm_medium);
    }
  }, [selectedSourceType]);

  const utmContent = useMemo(() => {
    if (!selectedSourceType) return "";
    
    if (conventions.utm_content.rule === "format-hook") {
      const channel: ChannelType = isBlog ? "blog" : "organic_social"; 
      return composeUtmContent(channel, formatFormatted, hookFormatted);
    } else {
      return hookFormatted;
    }
  }, [selectedSourceType, isBlog, formatFormatted, hookFormatted, conventions]);

  const campaignOptions = useMemo(() => 
    getValues("utm_campaign").map(v => ({ label: v.label, value: v.label })), 
  []);
  const termOptions = useMemo(() => 
    getValues("utm_term").map(v => ({ label: v.label, value: v.label })), 
  []);

  const isFormComplete = useMemo(() => {
    if (!baseUrl.trim() || !isValidUrl(baseUrl.trim())) return false;
    if (!sourceTypeId) return false;
    if (!platform) return false;
    if (!utmSource.trim()) return false;
    if (!utmMedium.trim()) return false;
    if (!utmCampaign.trim() || utmCampaign.trim().length < 2) return false;
    if (utmTerm.trim() && utmTerm.trim().length < 2) return false;
    if (!isBlog && conventions.utm_content.rule === "format-hook" && !postFormat) return false;
    if (!contentHook.trim() || contentHook.trim().length < 2) return false;
    return true;
  }, [baseUrl, sourceTypeId, platform, utmSource, utmMedium, utmCampaign, utmTerm, postFormat, contentHook, isBlog, conventions]);

  const previewUrl = useMemo(() => {
    const url = baseUrl || "https://example.com/page";
    const params: Record<string, string> = {};
    params.utm_source = sourceFormatted || "???";
    params.utm_medium = mediumFormatted || "???";
    params.utm_campaign = campaignFormatted || "???";
    if (termFormatted) params.utm_term = termFormatted;
    params.utm_content = utmContent || "???";
    
    // Add custom params
    customParams.forEach(p => {
      if (p.key.trim() && p.value.trim()) {
        params[toSnakeCase(p.key)] = p.value.trim();
      }
    });

    return buildUtmUrl(url, params);
  }, [baseUrl, sourceFormatted, mediumFormatted, campaignFormatted, termFormatted, utmContent, customParams]);

  const validateField = useCallback((field: keyof FormErrors): string | undefined => {
    switch (field) {
      case "baseUrl":
        if (!baseUrl.trim()) return "Base URL is required.";
        if (!isValidUrl(baseUrl.trim())) return "Enter a valid URL with https://.";
        return undefined;
      case "sourceTypeId":
        if (!sourceTypeId) return "Select a channel type.";
        return undefined;
      case "platform":
        if (!platform) return "Select a platform.";
        return undefined;
      case "utmSource":
        if (!utmSource.trim()) return "Source is required.";
        return undefined;
      case "utmMedium":
        if (!utmMedium.trim()) return "Medium is required.";
        return undefined;
      case "utmCampaign":
        if (!utmCampaign.trim()) return "Campaign is required.";
        if (utmCampaign.trim().length < 2) return "Minimum 2 characters.";
        return undefined;
      case "utmTerm":
        if (utmTerm.trim() && utmTerm.trim().length < 2) return "Minimum 2 characters.";
        return undefined;
      case "postFormat":
        if (!isBlog && conventions.utm_content.rule === "format-hook" && !postFormat) return "Select a post format.";
        return undefined;
      case "contentHook":
        if (!contentHook.trim()) return isBlog ? "Blog title is required." : "Content hook is required.";
        if (contentHook.trim().length < 2) return "Minimum 2 characters.";
        return undefined;
      default:
        return undefined;
    }
  }, [baseUrl, sourceTypeId, platform, utmSource, utmMedium, utmCampaign, utmTerm, postFormat, contentHook, isBlog, conventions]);

  const validate = useCallback((): FormErrors => {
    const fields: (keyof FormErrors)[] = [
      "baseUrl", "sourceTypeId", "platform", "utmSource", "utmMedium", "utmCampaign",
      "utmTerm", "postFormat", "contentHook",
    ];
    const errs: FormErrors = {};
    for (const field of fields) {
      const err = validateField(field);
      if (err) errs[field] = err;
    }
    return errs;
  }, [validateField]);

  function handleBlur(field: keyof FormErrors) {
    setTouched((prev) => new Set(prev).add(field));
    const err = validateField(field);
    setErrors((prev) => ({ ...prev, [field]: err }));
  }

  function handleAddCustomParam() {
    setCustomParams([...customParams, { id: crypto.randomUUID(), key: "", value: "" }]);
  }

  function handleRemoveCustomParam(id: string) {
    setCustomParams(customParams.filter(p => p.id !== id));
  }

  function handleUpdateCustomParam(id: string, field: "key" | "value", val: string) {
    setCustomParams(customParams.map(p => p.id === id ? { ...p, [field]: val } : p));
  }

  function handleGenerate() {
    const errs = validate();
    setErrors(errs);
    setTouched(new Set(["baseUrl", "sourceTypeId", "platform", "utmSource", "utmMedium", "utmCampaign", "utmTerm", "postFormat", "contentHook"]));

    if (Object.keys(errs).length > 0) {
      const errorOrder: (keyof FormErrors)[] = [
        "baseUrl", "sourceTypeId", "platform", "utmSource", "utmMedium", "utmCampaign",
        "utmTerm", "postFormat", "contentHook",
      ];
      for (const field of errorOrder) {
        if (errs[field] && fieldRefs[field].current) {
          fieldRefs[field].current.scrollIntoView({ behavior: "smooth", block: "center" });
          break;
        }
      }
      return;
    }

    if (campaignFormatted) {
      addValue({
        parameter: "utm_campaign",
        value: campaignFormatted,
        label: utmCampaign.trim(),
        source: "auto",
        sourceRef: null,
      });
    }
    if (termFormatted) {
      addValue({
        parameter: "utm_term",
        value: termFormatted,
        label: utmTerm.trim(),
        source: "auto",
        sourceRef: null,
      });
    }

    const params: Record<string, string> = {
      utm_source: sourceFormatted,
      utm_medium: mediumFormatted,
      utm_campaign: campaignFormatted,
    };
    if (termFormatted) params.utm_term = termFormatted;
    if (utmContent) params.utm_content = utmContent;

    // Custom Params
    const custom: Record<string, string> = {};
    customParams.forEach(p => {
      if (p.key.trim() && p.value.trim()) {
        custom[toSnakeCase(p.key)] = p.value.trim();
      }
    });

    const generatedUrl = buildUtmUrl(baseUrl.trim(), { ...params, ...custom });

    const link = addLink({
      baseUrl: baseUrl.trim(),
      utm_source: sourceFormatted,
      utm_medium: mediumFormatted,
      utm_campaign: campaignFormatted,
      utm_term: termFormatted || undefined,
      utm_content: utmContent || undefined,
      customParams: Object.keys(custom).length > 0 ? custom : undefined,
      generatedUrl,
    });

    toast.success("UTM link generated!");
    onGenerated(link);
  }

  function handleSourceTypeChange(id: string) {
    setSourceTypeId(id);
    const type = sourceTypes.find(s => s.id === id);
    if (type?.name.toLowerCase() === "blog") {
      setPlatform("google");
    } else {
      setPlatform("");
    }
    setPostFormat("");
    setErrors((prev) => ({ ...prev, sourceTypeId: undefined, platform: undefined, postFormat: undefined }));
  }

  function handlePlatformChange(value: string) {
    setPlatform(value);
    setPostFormat("");
    setErrors((prev) => ({ ...prev, platform: undefined, postFormat: undefined }));
  }

  const ruleLabel = (rule: NamingRule) => {
    if (rule === "snake_case") return "snake_case";
    if (rule === "lowercase") return "lowercase";
    return "raw";
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-6 md:gap-8 max-w-2xl mx-auto pb-12">
        
        {/* SECTION 1: Destination */}
        <FormSection 
          step={1} 
          title="Where does it go?" 
          description="The final destination URL your audience will land on."
        >
          <div className="space-y-1.5" ref={fieldRefs.baseUrl}>
            <div className="flex items-center gap-1.5">
              <Label htmlFor="base-url">Base URL</Label>
              <FieldTooltip text="Must include https://" />
            </div>
            <Input
              id="base-url"
              placeholder="https://example.com/page"
              value={baseUrl}
              onChange={(e) => { setBaseUrl(e.target.value); setErrors((p) => ({ ...p, baseUrl: undefined })); }}
              onBlur={() => handleBlur("baseUrl")}
              aria-describedby="base-url-desc"
            />
            <div className="flex justify-between items-center px-1">
              <p id="base-url-desc" className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Protocol Required</p>
              {errors.baseUrl && <p className="text-xs text-destructive font-medium" role="alert">{errors.baseUrl}</p>}
            </div>
          </div>
        </FormSection>

        {/* SECTION 2: Promotion Channel */}
        <FormSection 
          step={2} 
          title="Where are you promoting?" 
          description="Select the channel and platform sharing this link."
        >
          <div className="flex flex-col gap-4">
            <div className="space-y-1.5" ref={fieldRefs.sourceTypeId}>
              <div className="flex items-center gap-1.5">
                <Label>Source Type</Label>
              </div>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Source Type">
                {sourceTypes.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    role="radio"
                    aria-checked={sourceTypeId === st.id}
                    onClick={() => handleSourceTypeChange(st.id)}
                    className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                      sourceTypeId === st.id
                        ? "border-primary bg-primary text-primary-foreground font-medium"
                        : "border-input hover:bg-indigo-50"
                    }`}
                  >
                    {st.name}
                  </button>
                ))}
              </div>
              
              <div className="pt-2">
                <PaywallOverlay 
                  featureName="Unlimited Source Types" 
                  description="Upgrade to Pro to create and manage custom distribution channels beyond the standard defaults."
                >
                  <Link 
                    href="/settings/source-types" 
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 w-fit"
                  >
                    <Plus className="size-3" />
                    Manage Sources in Settings
                  </Link>
                </PaywallOverlay>
              </div>

              {errors.sourceTypeId && <p className="text-xs text-destructive font-medium" role="alert">{errors.sourceTypeId}</p>}
            </div>

            {sourceTypeId && (
              <div className="space-y-1.5" ref={fieldRefs.platform}>
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="platform">Platform</Label>
                </div>
                {isBlog ? (
                  <Input id="platform" value="Google" disabled />
                ) : (
                  <Select value={platform} onValueChange={handlePlatformChange}>
                    <SelectTrigger id="platform" aria-label="Select platform">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {errors.platform && <p className="text-xs text-destructive font-medium" role="alert">{errors.platform}</p>}
              </div>
            )}
          </div>

          {sourceTypeId && platform && (
            <div className="flex flex-col gap-4 pt-2 border-t mt-4 border-indigo-50">
              <div className="space-y-1.5" ref={fieldRefs.utmSource}>
                 <Label htmlFor="utm-source">Source Override <span className="font-mono text-[11px] text-indigo-400 font-normal ml-1">utm_source</span></Label>
                 <Input 
                   id="utm-source" 
                   value={utmSource} 
                   onChange={(e) => setUtmSource(e.target.value)} 
                   className="h-8 text-sm"
                   aria-describedby="source-rule"
                 />
                 <p id="source-rule" className="text-[10px] text-muted-foreground">Rule: <span className="font-bold uppercase tracking-tighter">snake_case</span> • Outputs as: <span className="font-mono text-indigo-600">{sourceFormatted || "???"}</span></p>
                 {errors.utmSource && <p className="text-xs text-destructive font-medium" role="alert">{errors.utmSource}</p>}
              </div>
              <div className="space-y-1.5" ref={fieldRefs.utmMedium}>
                 <Label htmlFor="utm-medium">Medium Override <span className="font-mono text-[11px] text-indigo-400 font-normal ml-1">utm_medium</span></Label>
                 <Input 
                   id="utm-medium" 
                   value={utmMedium} 
                   onChange={(e) => setUtmMedium(e.target.value)} 
                   className="h-8 text-sm"
                   aria-describedby="medium-rule"
                 />
                 <p id="medium-rule" className="text-[10px] text-muted-foreground">Rule: <span className="font-bold uppercase tracking-tighter">snake_case</span> • Outputs as: <span className="font-mono text-indigo-600">{mediumFormatted || "???"}</span></p>
                 {errors.utmMedium && <p className="text-xs text-destructive font-medium" role="alert">{errors.utmMedium}</p>}
              </div>
            </div>
          )}
        </FormSection>

        {/* SECTION 3: Campaign Identity */}
        <FormSection 
          step={3} 
          title="What are you promoting?" 
          description="Describe your content so analytics are human-readable."
        >
          <div className="flex flex-col gap-4">
            <div className="space-y-1.5" ref={fieldRefs.utmCampaign}>
              <div className="flex items-center gap-1.5">
                <Label htmlFor="utm-campaign">Campaign Name <span className="font-mono text-[11px] text-indigo-400 font-normal ml-1">utm_campaign</span></Label>
                <FieldTooltip text="Broad content pillar. E.g. 'Brand Awareness'" />
              </div>
              <Combobox 
                options={campaignOptions}
                value={utmCampaign}
                onValueChange={(val) => { setUtmCampaign(val); setErrors((p) => ({ ...p, utmCampaign: undefined })); }}
                placeholder="Type or select campaign..."
                emptyText="No saved campaigns found. Type to add new."
                className="bg-white"
              />
              <p id="campaign-rule" className="text-[10px] text-muted-foreground">
                Rule: <span className="font-bold uppercase tracking-tighter">{ruleLabel(conventions.utm_campaign.rule)}</span> • 
                Outputs as: <span className="font-mono text-indigo-600">{campaignFormatted || "???"}</span>
              </p>
              {errors.utmCampaign && <p className="text-xs text-destructive font-medium" role="alert">{errors.utmCampaign}</p>}
            </div>

            <div className="space-y-1.5" ref={fieldRefs.utmTerm}>
              <div className="flex items-center gap-1.5">
                <Label htmlFor="utm-term">Content Topic (Theme) <span className="font-mono text-[11px] text-indigo-400 font-normal ml-1">utm_term</span></Label>
                <FieldTooltip text="Specific topic identifier. E.g. 'Customer Stories'" />
              </div>
              <Combobox 
                options={termOptions}
                value={utmTerm}
                onValueChange={(val) => { setUtmTerm(val); setErrors((p) => ({ ...p, utmTerm: undefined })); }}
                placeholder="Type or select topic..."
                emptyText="No saved topics found. Type to add new."
                className="bg-white"
              />
              <p id="term-rule" className="text-[10px] text-muted-foreground">
                Rule: <span className="font-bold uppercase tracking-tighter">{ruleLabel(conventions.utm_term.rule)}</span> • 
                Outputs as: <span className="font-mono text-indigo-600">{termFormatted || "—"}</span>
              </p>
              {errors.utmTerm && <p className="text-xs text-destructive font-medium" role="alert">{errors.utmTerm}</p>}
            </div>
            
            <Link 
              href="/settings/values" 
              className="text-[10px] font-bold text-indigo-400 hover:text-indigo-600 flex items-center gap-1 w-fit pt-1"
            >
              <Settings2 className="size-2.5" />
              Manage Naming Rules in Settings
            </Link>
          </div>
        </FormSection>

        {/* SECTION 4: Distribution Formatting */}
        <FormSection 
          step={4} 
          title="How is it being shared?" 
          description="Tell us the format and key message."
        >
          <div className="flex flex-col gap-4">
            {!isBlog && conventions.utm_content.rule === "format-hook" && (
              <div className="space-y-1.5" ref={fieldRefs.postFormat}>
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="post-format">Post Format</Label>
                </div>
                <Select
                  value={postFormat}
                  onValueChange={(v) => { setPostFormat(v); setErrors((p) => ({ ...p, postFormat: undefined })); }}
                  disabled={!selectedPlatform}
                >
                  <SelectTrigger id="post-format" aria-label="Select post format">
                    <SelectValue placeholder={selectedPlatform ? "Select format" : "Select a platform first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {(selectedPlatform?.postFormats ?? []).map((fmt) => (
                      <SelectItem key={fmt} value={toSnakeCase(fmt)}>
                        {fmt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.postFormat && <p className="text-xs text-destructive font-medium" role="alert">{errors.postFormat}</p>}
              </div>
            )}

            <div className="space-y-1.5" ref={fieldRefs.contentHook}>
              <div className="flex items-center gap-1.5">
                <Label htmlFor="content-hook">
                  {isBlog ? "Blog Title" : "Content Hook"} <span className="font-mono text-[11px] text-indigo-400 font-normal ml-1">utm_content</span>
                </Label>
              </div>
              <Input
                id="content-hook"
                placeholder={isBlog ? "e.g. How to Scale Tracking" : "e.g. 5 Growth Tips"}
                value={contentHook}
                onChange={(e) => { setContentHook(e.target.value); setErrors((p) => ({ ...p, contentHook: undefined })); }}
                onBlur={() => handleBlur("contentHook")}
                aria-describedby="hook-rule"
              />
              <p id="hook-rule" className="text-[10px] text-muted-foreground">
                Rule: <span className="font-bold uppercase tracking-tighter">
                  {conventions.utm_content.rule === "format-hook" ? "{format}-{hook}" : "snake_case"}
                </span> • 
                Outputs as: <span className="font-mono text-indigo-600">{utmContent || "???"}</span>
              </p>
              {errors.contentHook && <p className="text-xs text-destructive font-medium" role="alert">{errors.contentHook}</p>}
            </div>
          </div>
        </FormSection>

        {/* ADVANCED SECTION */}
        <div className="border border-indigo-50 rounded-lg overflow-hidden">
          <button 
            type="button"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors"
            aria-expanded={isAdvancedOpen}
          >
            <div className="flex items-center gap-2">
              <Settings2 className="size-4 text-indigo-600" />
              <span className="text-sm font-bold text-indigo-950">Advanced Parameters (Optional)</span>
            </div>
            {isAdvancedOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
          
          {isAdvancedOpen && (
            <div className="p-4 bg-white space-y-4 border-t border-indigo-50 animate-in slide-in-from-top-2 duration-200">
              <p className="text-xs text-muted-foreground">Add extra parameters like utm_id or utm_source_platform.</p>
              
              {customParams.map((p) => (
                <div key={p.id} className="flex gap-2 items-end">
                  <div className="flex-1 space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-slate-400">Key</Label>
                    <Input 
                      placeholder="utm_id" 
                      value={p.key} 
                      onChange={(e) => handleUpdateCustomParam(p.id, "key", e.target.value)}
                      className="h-8 text-xs font-mono"
                      aria-label="Custom parameter key"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-slate-400">Value</Label>
                    <Input 
                      placeholder="12345" 
                      value={p.value} 
                      onChange={(e) => handleUpdateCustomParam(p.id, "value", e.target.value)}
                      className="h-8 text-xs font-mono"
                      aria-label="Custom parameter value"
                    />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive" 
                    onClick={() => handleRemoveCustomParam(p.id)}
                    aria-label="Remove parameter"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddCustomParam}
                className="w-full h-8 border-dashed border-indigo-200 text-indigo-600 hover:bg-indigo-50 gap-1.5"
              >
                <Plus className="size-3.5" />
                Add Parameter
              </Button>
            </div>
          )}
        </div>

        {/* SECTION 5: Review & Generate */}
        <FormSection 
          step={5} 
          title="Review and Generate" 
          description="Your final tracking parameters look like this."
          className="bg-indigo-50 border-indigo-200"
        >
          <div className="rounded-lg border border-indigo-200 bg-white p-4 space-y-3 shadow-sm">
            <p className="text-xs font-mono break-all text-indigo-950" aria-live="polite">
              {previewUrl}
            </p>
            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-[11px]" aria-label="UTM Parameters Breakdown">
              <span className="text-neutral-500">utm_source</span>
              <span className={sourceFormatted ? "text-indigo-700 font-medium" : "text-destructive"}>{sourceFormatted || "Required"}</span>
              
              <span className="text-neutral-500">utm_medium</span>
              <span className={mediumFormatted ? "text-indigo-700 font-medium" : "text-destructive"}>{mediumFormatted || "Required"}</span>
              
              <span className="text-neutral-500">utm_campaign</span>
              <span className={campaignFormatted ? "text-indigo-700 font-medium" : "text-destructive"}>{campaignFormatted || "Required"}</span>
              
              {(termFormatted || true) && (
                <>
                  <span className="text-neutral-500">utm_term</span>
                  <span className="text-indigo-700 font-medium">{termFormatted || "—"}</span>
                </>
              )}
              
              <span className="text-neutral-500">utm_content</span>
              <span className={utmContent ? "text-indigo-700 font-medium" : "text-destructive"}>{utmContent || "Required"}</span>

              {customParams.filter(p => p.key && p.value).map(p => (
                <Fragment key={p.id}>
                  <span className="text-neutral-500">{toSnakeCase(p.key)}</span>
                  <span className="text-indigo-700 font-medium">{p.value}</span>
                </Fragment>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onCancel} className="flex-1 bg-white">
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              className={`flex-1 gap-2 ${!isFormComplete ? "opacity-60" : "shadow-md"}`}
            >
              <Wand2 className="size-4" />
              Generate Magic Link
            </Button>
          </div>
        </FormSection>

      </div>
    </TooltipProvider>
  );
}
