"use client";

import Link from "next/link";
import { CircleDot, Facebook, Chrome, Linkedin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PLATFORMS = [
  { key: "meta", label: "Meta Ads", icon: Facebook },
  { key: "google", label: "Google Ads", icon: Chrome },
  { key: "linkedin", label: "LinkedIn Ads", icon: Linkedin },
] as const;

export function AdPlatformStatus() {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-wrap gap-6" data-testid="platform-status-bar">
          {PLATFORMS.map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center gap-2">
              <Icon className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">{label}</span>
              <Badge variant="secondary" className="gap-1 text-xs">
                <CircleDot className="size-3 text-muted-foreground" />
                Not Connected
              </Badge>
              <Link
                href="/settings/connections"
                className="text-xs text-primary hover:underline"
              >
                Connect
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
