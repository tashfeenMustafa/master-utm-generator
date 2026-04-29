"use client";

import { useState } from "react";
import { Copy, Check, X, QrCode, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCodeModal } from "@/components/organic/qr-code-modal";
import { toSnakeCase } from "@/lib/utils/to-snake-case";
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
  const [qrOpen, setQrOpen] = useState(false);

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

  async function handleShare() {
    const text = `Hey! Here's the tracking link for the ${link.utm_campaign} campaign: ${link.generatedUrl}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Share message copied!");
    } catch {
      toast.error("Failed to copy share message");
    }
  }

  const standardParams = [
    { label: "utm_source", value: link.utm_source },
    { label: "utm_medium", value: link.utm_medium },
    { label: "utm_campaign", value: link.utm_campaign },
    { label: "utm_term", value: link.utm_term },
    { label: "utm_content", value: link.utm_content },
  ];

  return (
    <div
      className="relative rounded-[16px] border-2 border-indigo-100 bg-indigo-50 p-5 space-y-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500"
      data-testid="result-card"
    >
      {/* Dismiss button */}
      <Button
        variant="ghost"
        size="icon-xs"
        className="absolute top-3 right-3 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100/50"
        onClick={onDismiss}
        aria-label="Dismiss"
      >
        <X className="size-4" />
      </Button>

      <div className="space-y-1">
        <div className="flex items-center gap-2 pr-8">
          <Badge className="bg-indigo-600 hover:bg-indigo-600 uppercase text-[10px] tracking-widest px-2 py-0">Success</Badge>
          <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
            Generated {formatDate(link.createdAt)}
          </span>
        </div>
        <h3 className="text-sm font-black text-indigo-950 uppercase tracking-tight">Your Tracking Link is Ready</h3>
      </div>

      {/* Full URL */}
      <div className="bg-white rounded-lg border border-indigo-100 p-3 shadow-inner">
        <p className="font-mono text-xs break-all text-indigo-900 leading-relaxed">
          {link.generatedUrl}
        </p>
      </div>

      {/* UTM param breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-1">
        {standardParams.map(
          (p) =>
            p.value && (
              <div key={p.label} className="flex flex-col">
                <span className="text-[9px] uppercase font-bold text-indigo-400 tracking-tighter">{p.label}</span>
                <span className="text-[11px] font-bold text-indigo-900 truncate" title={p.value}>{p.value}</span>
              </div>
            )
        )}
        {link.customParams && Object.entries(link.customParams).map(([k, v]) => (
          <div key={k} className="flex flex-col">
            <span className="text-[9px] uppercase font-bold text-indigo-400 tracking-tighter">{toSnakeCase(k)}</span>
            <span className="text-[11px] font-bold text-indigo-900 truncate" title={v}>{v}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-2">
        <Button
          onClick={handleCopy}
          className="gap-2 flex-1 bg-indigo-600 hover:bg-indigo-700 shadow-md font-bold text-xs h-10"
        >
          {copied ? (
            <>
              <Check className="size-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="size-4" />
              Copy URL
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={handleShare}
          className="gap-2 flex-1 border-indigo-200 text-indigo-600 hover:bg-indigo-100/50 font-bold text-xs h-10"
        >
          <Share2 className="size-4" />
          Share Link
        </Button>
        <Button
          variant="outline"
          onClick={() => setQrOpen(true)}
          className="gap-2 border-indigo-200 text-indigo-600 hover:bg-indigo-100/50 font-bold text-xs h-10 px-4"
          aria-label="Show QR code"
        >
          <QrCode className="size-4" />
          QR Code
        </Button>
      </div>

      <QrCodeModal
        open={qrOpen}
        onOpenChange={setQrOpen}
        url={link.generatedUrl}
        label={link.utm_campaign}
      />
    </div>
  );
}
