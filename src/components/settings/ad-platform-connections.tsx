"use client";

import { Facebook, Chrome, Linkedin, CircleDot } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const AD_PLATFORMS = [
  {
    key: "meta",
    label: "Meta Ads",
    description: "Import campaigns from Facebook & Instagram Ads",
    icon: Facebook,
  },
  {
    key: "google",
    label: "Google Ads",
    description: "Import campaigns from Google Search, Display & YouTube Ads",
    icon: Chrome,
  },
  {
    key: "linkedin",
    label: "LinkedIn Ads",
    description: "Import campaigns from LinkedIn Campaign Manager",
    icon: Linkedin,
  },
] as const;

export function AdPlatformConnections() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Ad Platforms</h2>
      {AD_PLATFORMS.map(({ key, label, description, icon: Icon }) => (
        <Card key={key}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon className="size-5" />
                <div>
                  <CardTitle>{label}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <CircleDot className="size-3 text-muted-foreground" />
                Not Connected
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => toast("Coming Soon", { description: `${label} integration is not yet available.` })}
            >
              Connect {label}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
