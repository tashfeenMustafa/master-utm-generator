"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { toSnakeCase } from "@/lib/utils/to-snake-case";
import { getValues, addValue, addLink } from "@/lib/storage";
import type { UtmLink } from "@/lib/types";
import {
  CHANNEL_TYPES,
  type ChannelType,
  getPlatformsForChannel,
  getUtmMedium,
  composeUtmContent,
  buildUtmUrl,
  isValidUrl,
} from "@/lib/utm-config";

// ── Field tooltip helper ─────────────────────────────────────────
function FieldTooltip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="size-3.5 text-muted-foreground cursor-help" />
      </TooltipTrigger>
      <TooltipContent side="top">{text}</TooltipContent>
    </Tooltip>
  );
}

// ── Errors type ──────────────────────────────────────────────────
interface FormErrors {
  baseUrl?: string;
  channelType?: string;
  platform?: string;
  utmCampaign?: string;
  utmTerm?: string;
  postFormat?: string;
  contentHook?: string;
}

// ── Props ────────────────────────────────────────────────────────
interface UtmGeneratorFormProps {
  onGenerated: (link: UtmLink) => void;
  onCancel: () => void;
}

export function UtmGeneratorForm({ onGenerated, onCancel }: UtmGeneratorFormProps) {
  const [baseUrl, setBaseUrl] = useState("");
  const [channelType, setChannelType] = useState<ChannelType | "">("");
  const [platform, setPlatform] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [utmTerm, setUtmTerm] = useState("");
  const [postFormat, setPostFormat] = useState("");
  const [contentHook, setContentHook] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  // Refs for scroll-to-first-error
  const fieldRefs = {
    baseUrl: useRef<HTMLDivElement>(null),
    channelType: useRef<HTMLDivElement>(null),
    platform: useRef<HTMLDivElement>(null),
    utmCampaign: useRef<HTMLDivElement>(null),
    utmTerm: useRef<HTMLDivElement>(null),
    postFormat: useRef<HTMLDivElement>(null),
    contentHook: useRef<HTMLDivElement>(null),
  };

  // ── Derived values ──────────────────────────────────────────────
  const platforms = useMemo(
    () => (channelType ? getPlatformsForChannel(channelType) : []),
    [channelType]
  );

  const selectedPlatform = useMemo(
    () => platforms.find((p) => p.value === platform),
    [platforms, platform]
  );

  const utmSource = selectedPlatform?.utmSource ?? "";
  const utmMedium = channelType ? getUtmMedium(channelType) : "";

  const isBlog = channelType === "blog";
  const campaignSnake = toSnakeCase(utmCampaign);
  const termSnake = toSnakeCase(utmTerm);
  const hookSnake = toSnakeCase(contentHook);
  const formatSnake = toSnakeCase(postFormat);

  const utmContent = useMemo(() => {
    if (!channelType) return "";
    return composeUtmContent(channelType, formatSnake, hookSnake);
  }, [channelType, formatSnake, hookSnake]);

  // Campaign/term dropdown options
  const campaignOptions = useMemo(() => getValues("utm_campaign"), []);
  const termOptions = useMemo(() => getValues("utm_term"), []);

  // ── Form completeness check ───────────────────────────────────
  const isFormComplete = useMemo(() => {
    if (!baseUrl.trim() || !isValidUrl(baseUrl.trim())) return false;
    if (!channelType) return false;
    if (!platform) return false;
    if (!utmCampaign.trim() || utmCampaign.trim().length < 2) return false;
    if (utmTerm.trim() && utmTerm.trim().length < 2) return false;
    if (!isBlog && !postFormat) return false;
    if (!contentHook.trim() || contentHook.trim().length < 2) return false;
    return true;
  }, [baseUrl, channelType, platform, utmCampaign, utmTerm, postFormat, contentHook, isBlog]);

  // ── Live preview URL ────────────────────────────────────────────
  const previewUrl = useMemo(() => {
    const url = baseUrl || "https://example.com/page";
    const params: Record<string, string> = {};
    params.utm_source = utmSource || "???";
    params.utm_medium = utmMedium || "???";
    params.utm_campaign = campaignSnake || "???";
    if (termSnake) params.utm_term = termSnake;
    params.utm_content = utmContent || "???";
    return buildUtmUrl(url, params);
  }, [baseUrl, utmSource, utmMedium, campaignSnake, termSnake, utmContent]);

  // ── Validation ──────────────────────────────────────────────────
  const validateField = useCallback((field: keyof FormErrors): string | undefined => {
    switch (field) {
      case "baseUrl":
        if (!baseUrl.trim()) return "Base URL is required.";
        if (!isValidUrl(baseUrl.trim())) return "Enter a valid URL with https://.";
        return undefined;
      case "channelType":
        if (!channelType) return "Select a channel type.";
        return undefined;
      case "platform":
        if (!platform) return "Select a platform.";
        return undefined;
      case "utmCampaign":
        if (!utmCampaign.trim()) return "Campaign is required.";
        if (utmCampaign.trim().length < 2) return "Minimum 2 characters.";
        return undefined;
      case "utmTerm":
        if (utmTerm.trim() && utmTerm.trim().length < 2) return "Minimum 2 characters.";
        return undefined;
      case "postFormat":
        if (!isBlog && !postFormat) return "Select a post format.";
        return undefined;
      case "contentHook":
        if (!contentHook.trim()) return isBlog ? "Blog title is required." : "Content hook is required.";
        if (contentHook.trim().length < 2) return "Minimum 2 characters.";
        return undefined;
      default:
        return undefined;
    }
  }, [baseUrl, channelType, platform, utmCampaign, utmTerm, postFormat, contentHook, isBlog]);

  const validate = useCallback((): FormErrors => {
    const fields: (keyof FormErrors)[] = [
      "baseUrl", "channelType", "platform", "utmCampaign",
      "utmTerm", "postFormat", "contentHook",
    ];
    const errs: FormErrors = {};
    for (const field of fields) {
      const err = validateField(field);
      if (err) errs[field] = err;
    }
    return errs;
  }, [validateField]);

  // ── On-blur handler ────────────────────────────────────────────
  function handleBlur(field: keyof FormErrors) {
    setTouched((prev) => new Set(prev).add(field));
    const err = validateField(field);
    setErrors((prev) => ({ ...prev, [field]: err }));
  }

  // ── Submit ──────────────────────────────────────────────────────
  function handleGenerate() {
    const errs = validate();
    setErrors(errs);
    // Mark all fields as touched
    setTouched(new Set(["baseUrl", "channelType", "platform", "utmCampaign", "utmTerm", "postFormat", "contentHook"]));

    if (Object.keys(errs).length > 0) {
      // Scroll to first error
      const errorOrder: (keyof FormErrors)[] = [
        "baseUrl", "channelType", "platform", "utmCampaign",
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

    // Auto-save new free-text values
    if (campaignSnake) {
      addValue({
        parameter: "utm_campaign",
        value: campaignSnake,
        label: utmCampaign.trim(),
        source: "auto",
        sourceRef: null,
      });
    }
    if (termSnake) {
      addValue({
        parameter: "utm_term",
        value: termSnake,
        label: utmTerm.trim(),
        source: "auto",
        sourceRef: null,
      });
    }

    const params: Record<string, string> = {
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: campaignSnake,
    };
    if (termSnake) params.utm_term = termSnake;
    if (utmContent) params.utm_content = utmContent;

    const generatedUrl = buildUtmUrl(baseUrl.trim(), params);

    const link = addLink({
      baseUrl: baseUrl.trim(),
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: campaignSnake,
      utm_term: termSnake || undefined,
      utm_content: utmContent || undefined,
      generatedUrl,
    });

    toast.success("UTM link generated!");
    onGenerated(link);
  }

  // ── Channel change handler ──────────────────────────────────────
  function handleChannelChange(value: string) {
    const ch = value as ChannelType;
    setChannelType(ch);
    // Reset dependent fields
    const newPlatforms = getPlatformsForChannel(ch);
    if (ch === "blog") {
      setPlatform("google");
    } else if (!newPlatforms.find((p) => p.value === platform)) {
      setPlatform("");
    }
    setPostFormat("");
    setErrors((prev) => ({ ...prev, channelType: undefined, platform: undefined, postFormat: undefined }));
  }

  function handlePlatformChange(value: string) {
    setPlatform(value);
    setPostFormat("");
    setErrors((prev) => ({ ...prev, platform: undefined, postFormat: undefined }));
  }

  // ── Render ──────────────────────────────────────────────────────
  return (
    <TooltipProvider>
      <div className="flex flex-col gap-5">
        {/* Base URL */}
        <div className="space-y-1.5" ref={fieldRefs.baseUrl}>
          <div className="flex items-center gap-1.5">
            <Label htmlFor="base-url">Base URL</Label>
            <FieldTooltip text="The destination page URL. Must include https://" />
          </div>
          <Input
            id="base-url"
            placeholder="https://example.com/page"
            value={baseUrl}
            onChange={(e) => { setBaseUrl(e.target.value); setErrors((p) => ({ ...p, baseUrl: undefined })); }}
            onBlur={() => handleBlur("baseUrl")}
          />
          {errors.baseUrl && <p className="text-xs text-destructive">{errors.baseUrl}</p>}
        </div>

        {/* Channel Type */}
        <div className="space-y-1.5" ref={fieldRefs.channelType}>
          <div className="flex items-center gap-1.5">
            <Label>Channel Type</Label>
            <FieldTooltip text="How this content is being distributed" />
          </div>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Channel type">
            {CHANNEL_TYPES.map((ch) => (
              <button
                key={ch.value}
                type="button"
                role="radio"
                aria-checked={channelType === ch.value}
                onClick={() => handleChannelChange(ch.value)}
                className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                  channelType === ch.value
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-input hover:bg-accent"
                }`}
              >
                {ch.label}
              </button>
            ))}
          </div>
          {errors.channelType && <p className="text-xs text-destructive">{errors.channelType}</p>}
        </div>

        {/* Platform */}
        {channelType && (
          <div className="space-y-1.5" ref={fieldRefs.platform}>
            <div className="flex items-center gap-1.5">
              <Label htmlFor="platform">Platform</Label>
              <FieldTooltip text="The social platform or channel" />
            </div>
            {isBlog ? (
              <Input id="platform" value="Google" disabled />
            ) : (
              <Select value={platform} onValueChange={handlePlatformChange}>
                <SelectTrigger id="platform">
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
            {errors.platform && <p className="text-xs text-destructive">{errors.platform}</p>}
          </div>
        )}

        {/* utm_source & utm_medium badges */}
        {(utmSource || utmMedium) && (
          <div className="flex flex-wrap gap-4">
            {utmSource && (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">utm_source</Label>
                <Badge variant="secondary">{utmSource}</Badge>
              </div>
            )}
            {utmMedium && (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">utm_medium</Label>
                <Badge variant="secondary">{utmMedium}</Badge>
              </div>
            )}
          </div>
        )}

        {/* utm_campaign */}
        <div className="space-y-1.5" ref={fieldRefs.utmCampaign}>
          <div className="flex items-center gap-1.5">
            <Label htmlFor="utm-campaign">utm_campaign</Label>
            <FieldTooltip text="Your content pillar or campaign name. e.g., brand_awareness" />
          </div>
          <Input
            id="utm-campaign"
            list="campaign-options"
            placeholder="e.g., brand_awareness"
            value={utmCampaign}
            onChange={(e) => { setUtmCampaign(e.target.value); setErrors((p) => ({ ...p, utmCampaign: undefined })); }}
            onBlur={() => handleBlur("utmCampaign")}
          />
          <datalist id="campaign-options">
            {campaignOptions.map((v) => (
              <option key={v.id} value={v.label} />
            ))}
          </datalist>
          {utmCampaign.trim() && (
            <p className="text-xs text-muted-foreground">Value: <code>{campaignSnake}</code></p>
          )}
          {errors.utmCampaign && <p className="text-xs text-destructive">{errors.utmCampaign}</p>}
          {!errors.utmCampaign && !utmCampaign.trim() && touched.has("utmCampaign") === false && (
            <p className="text-xs text-muted-foreground">e.g., brand_awareness, product_launch_q1</p>
          )}
        </div>

        {/* utm_term */}
        <div className="space-y-1.5" ref={fieldRefs.utmTerm}>
          <div className="flex items-center gap-1.5">
            <Label htmlFor="utm-term">utm_term <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <FieldTooltip text="Your content theme. e.g., customer_stories" />
          </div>
          <Input
            id="utm-term"
            list="term-options"
            placeholder="e.g., customer_stories"
            value={utmTerm}
            onChange={(e) => { setUtmTerm(e.target.value); setErrors((p) => ({ ...p, utmTerm: undefined })); }}
            onBlur={() => handleBlur("utmTerm")}
          />
          <datalist id="term-options">
            {termOptions.map((v) => (
              <option key={v.id} value={v.label} />
            ))}
          </datalist>
          {utmTerm.trim() && (
            <p className="text-xs text-muted-foreground">Value: <code>{termSnake}</code></p>
          )}
          {errors.utmTerm && <p className="text-xs text-destructive">{errors.utmTerm}</p>}
          {!errors.utmTerm && !utmTerm.trim() && (
            <p className="text-xs text-muted-foreground">e.g., social_proof, customer_stories</p>
          )}
        </div>

        {/* Post Format (hidden for blog) */}
        {channelType && !isBlog && (
          <div className="space-y-1.5" ref={fieldRefs.postFormat}>
            <div className="flex items-center gap-1.5">
              <Label htmlFor="post-format">Post Format</Label>
              <FieldTooltip text="The format of your post on this platform" />
            </div>
            <Select
              value={postFormat}
              onValueChange={(v) => { setPostFormat(v); setErrors((p) => ({ ...p, postFormat: undefined })); }}
              disabled={!selectedPlatform}
            >
              <SelectTrigger id="post-format">
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
            {errors.postFormat && <p className="text-xs text-destructive">{errors.postFormat}</p>}
          </div>
        )}

        {/* Content Hook / Blog Title */}
        <div className="space-y-1.5" ref={fieldRefs.contentHook}>
          <div className="flex items-center gap-1.5">
            <Label htmlFor="content-hook">
              {isBlog ? "Blog Content Title" : "Content Hook"}
            </Label>
            <FieldTooltip
              text={
                isBlog
                  ? "The title of your blog post. e.g., how_to_build_a_brand"
                  : "A short descriptor of the content. e.g., 5_tips_for_growth"
              }
            />
          </div>
          <Input
            id="content-hook"
            placeholder={isBlog ? "e.g., How to Build a Brand" : "e.g., 5 Tips for Growth"}
            value={contentHook}
            onChange={(e) => { setContentHook(e.target.value); setErrors((p) => ({ ...p, contentHook: undefined })); }}
            onBlur={() => handleBlur("contentHook")}
          />
          {contentHook.trim() && (
            <p className="text-xs text-muted-foreground">Value: <code>{hookSnake}</code></p>
          )}
          {errors.contentHook && <p className="text-xs text-destructive">{errors.contentHook}</p>}
          {!errors.contentHook && !contentHook.trim() && touched.has("contentHook") === false && (
            <p className="text-xs text-muted-foreground">
              {isBlog
                ? "e.g., how_to_build_a_brand, ultimate_guide_seo"
                : "e.g., 5_tips_for_growth, behind_the_scenes"}
            </p>
          )}
        </div>

        {/* utm_content (computed, read-only) */}
        {utmContent && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">utm_content (computed)</Label>
            <Badge variant="outline" className="font-mono text-xs">
              {utmContent}
            </Badge>
          </div>
        )}

        {/* Live URL Preview */}
        <div className="rounded-md border bg-muted/50 p-3 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Preview</p>
          <p className="text-xs font-mono break-all">{previewUrl}</p>
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
            <span className="text-muted-foreground">utm_source</span>
            <span className={utmSource ? "" : "text-destructive"}>{utmSource || "???"}</span>
            <span className="text-muted-foreground">utm_medium</span>
            <span className={utmMedium ? "" : "text-destructive"}>{utmMedium || "???"}</span>
            <span className="text-muted-foreground">utm_campaign</span>
            <span className={campaignSnake ? "" : "text-destructive"}>{campaignSnake || "???"}</span>
            {(termSnake || true) && (
              <>
                <span className="text-muted-foreground">utm_term</span>
                <span className="text-muted-foreground">{termSnake || "—"}</span>
              </>
            )}
            <span className="text-muted-foreground">utm_content</span>
            <span className={utmContent ? "" : "text-destructive"}>{utmContent || "???"}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            className={`flex-1 ${!isFormComplete ? "opacity-60" : ""}`}
          >
            Generate
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
