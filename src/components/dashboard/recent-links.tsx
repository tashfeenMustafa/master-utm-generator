"use client";

import Link from "next/link";
import { Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UtmLink } from "@/lib/types";
import { toast } from "sonner";

interface RecentLinksProps {
  links: UtmLink[];
}

export function RecentLinks({ links }: RecentLinksProps) {
  const recent = links.slice(0, 5);

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Copied to clipboard");
  };

  if (recent.length === 0) {
    return (
      <div className="rounded-[10px] border border-indigo-100 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold tracking-tight text-indigo-950">
          Recent Links
        </h3>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-sm text-muted-foreground">
            No tracking links yet
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Create your first link to get started
          </p>
          <Link href="/organic">
            <Button variant="outline" size="sm" className="mt-4">
              Create a Link
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[10px] border border-indigo-100 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold tracking-tight text-indigo-950">
        Recent Links
      </h3>

      <div className="space-y-2">
        {recent.map((link) => (
          <div
            key={link.id}
            className="flex items-center justify-between gap-2 rounded-md border border-border bg-background p-3 text-sm hover:bg-accent/50"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-foreground">
                {link.utm_campaign || "Untitled"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {link.utm_source} • {new Date(link.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(link.generatedUrl)}
                className="h-8 w-8 p-0"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <a href={link.generatedUrl} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <Link href="/organic">
          <Button variant="outline" size="sm" className="w-full">
            View All Links
          </Button>
        </Link>
      </div>
    </div>
  );
}
