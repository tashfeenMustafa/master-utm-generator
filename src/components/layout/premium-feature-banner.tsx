"use client";

import { useState, useEffect } from "react";
import { HardDrive, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/storage";
import Link from "next/link";

export function PremiumFeatureBanner() {
  const [isPremium, setIsPremium] = useState(true);

  useEffect(() => {
    const user = getUser();
    setIsPremium(user.isPremium);
  }, []);

  if (isPremium) return null;

  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm">
          <HardDrive className="size-5 text-indigo-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-indigo-950">Local-Only Storage Active</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            💾 Your data is saved locally. Upgrade to Pro to sync your library across devices and unlock team sharing.
          </p>
        </div>
      </div>
      <Link href="/settings/account">
        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 font-bold gap-2 whitespace-nowrap">
          <Zap className="size-3.5 fill-current" />
          Upgrade to Pro
          <ArrowRight className="size-3.5" />
        </Button>
      </Link>
    </div>
  );
}
