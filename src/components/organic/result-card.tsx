"use client";

import { useState } from "react";
import { Copy, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { UtmLink } from "@/lib/types";

interface ResultCardProps {
  link: UtmLink;
  onDismiss: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ResultCard({ link, onDismiss }: ResultCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link.generatedUrl);
      setCopied(true);
      toast.success("URL copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  }

  const params = [
    { label: "utm_source", value: link.utm_source },
    { label: "utm_medium", value: link.utm_medium },
    { label: "utm_campaign", value: link.utm_campaign },
    { label: "utm_term", value: link.utm_term },
    { label: "utm_content", value: link.utm_content },
  ];

  return (
    <div
      className="relative rounded-lg border bg-[#F4FFF0] p-4 space-y-3"
      data-testid="result-card"
    >
      {/* Dismiss button */}
      <Button
        variant="ghost"
        size="icon-xs"
        className="absolute top-3 right-3"
        onClick={onDismiss}
        aria-label="Dismiss"
      >
        <X className="size-3.5" />
      </Button>

      {/* Header with platform badge + timestamp */}
      <div className="flex items-center gap-2 pr-8">
        <Badge variant="secondary">{link.utm_source}</Badge>
        <span className="text-xs text-muted-foreground">
          {formatDate(link.createdAt)}
        </span>
      </div>

      {/* Full URL */}
      <p className="font-mono text-sm break-all text-[#004D23]">
        {link.generatedUrl}
      </p>

      {/* UTM param breakdown */}
      <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
        {params.map(
          (p) =>
            p.value && (
              <div key={p.label} className="contents">
                <span className="text-muted-foreground">{p.label}</span>
                <span className="font-medium">{p.value}</span>
              </div>
            )
        )}
      </div>

      {/* Copy button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="gap-1.5"
      >
        {copied ? (
          <>
            <Check className="size-3.5" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="size-3.5" />
            Copy URL
          </>
        )}
      </Button>
    </div>
  );
}
