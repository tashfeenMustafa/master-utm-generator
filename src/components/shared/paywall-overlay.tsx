"use client";

import { ReactNode, useState, useEffect } from "react";
import { Lock, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/storage";
import { useRouter } from "next/navigation";

interface PaywallOverlayProps {
  children: ReactNode;
  featureName: string;
  description?: string;
}

export function PaywallOverlay({ 
  children, 
  featureName, 
  description = "Upgrade to Pro to unlock this feature and supercharge your marketing tracking."
}: PaywallOverlayProps) {
  const [isPremium, setIsPremium] = useState(true); // Default true to prevent flicker
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    setIsPremium(user.isPremium);
  }, []);

  if (isPremium) return <>{children}</>;

  return (
    <div className="relative group">
      {/* Blurred Content */}
      <div className="blur-[2px] pointer-events-none select-none opacity-50 grayscale">
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-white/10 backdrop-blur-[1px] rounded-xl border border-dashed border-indigo-200">
        <div className="max-w-xs w-full bg-white shadow-2xl border border-indigo-100 rounded-2xl p-6 text-center animate-in zoom-in-95 duration-200">
          <div className="mx-auto w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
            <Lock className="size-6 text-indigo-600" />
          </div>
          
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="size-2.5" />
            Pro Feature
          </div>
          
          <h3 className="text-lg font-bold text-indigo-950 mb-2">{featureName}</h3>
          <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
            {description}
          </p>
          
          <Button 
            className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2 font-bold shadow-lg shadow-indigo-100"
            onClick={() => router.push("/settings/account")}
          >
            Upgrade Now
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
