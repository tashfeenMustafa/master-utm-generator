"use client";

import { useRef, useCallback } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, Copy, Check, QrCode, ImageIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface QrCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  label?: string;
}

export function QrCodeModal({ open, onOpenChange, url, label }: QrCodeModalProps) {
  const [copied, setCopied] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("URL copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  }, [url]);

  const handleCopyImage = useCallback(async () => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          const item = new ClipboardItem({ "image/png": blob });
          await navigator.clipboard.write([item]);
          setCopiedImage(true);
          toast.success("QR code image copied to clipboard");
          setTimeout(() => setCopiedImage(false), 2000);
        } catch {
          toast.error("Clipboard image copy not supported in this browser");
        }
      });
    } catch {
      toast.error("Failed to copy QR code image");
    }
  }, []);

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    // Derive a clean filename from label or url
    const slug = (label || url)
      .replace(/^https?:\/\//, "")
      .replace(/[^a-z0-9]/gi, "_")
      .slice(0, 40);
    a.download = `qr_${slug}.png`;
    a.click();
    toast.success("QR code downloaded");
  }, [url, label]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <QrCode className="size-5 text-indigo-600" />
            <DialogTitle>QR Code</DialogTitle>
          </div>
          <DialogDescription className="text-xs break-all font-mono text-indigo-700 bg-indigo-50 rounded-md px-3 py-2 mt-2">
            {url}
          </DialogDescription>
        </DialogHeader>

        {/* QR Code */}
        <div className="flex flex-col items-center gap-5 py-2">
          <div
            ref={canvasRef}
            className="p-4 rounded-xl border border-indigo-100 bg-white shadow-sm"
          >
            <QRCodeCanvas
              value={url}
              size={200}
              level="H"
              marginSize={1}
              fgColor="#1e1b4b"
              bgColor="#ffffff"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 w-full">
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                className="flex-1 gap-2 text-xs font-bold"
                onClick={handleCopy}
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? "Copied!" : "Copy URL"}
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2 text-xs font-bold"
                onClick={handleCopyImage}
              >
                {copiedImage ? <Check className="size-3.5" /> : <ImageIcon className="size-3.5" />}
                {copiedImage ? "Copied!" : "Copy Image"}
              </Button>
            </div>
            <Button
              className="w-full gap-2 font-bold bg-indigo-600 hover:bg-indigo-700"
              onClick={handleDownload}
            >
              <Download className="size-4" />
              Download PNG
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
