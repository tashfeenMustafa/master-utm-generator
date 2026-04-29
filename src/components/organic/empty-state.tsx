"use client";

import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onAction: () => void;
}

function LinkIllustration() {
  return (
    <svg width="240" height="180" viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto drop-shadow-xl">
      <rect x="40" y="40" width="160" height="100" rx="12" fill="white" stroke="#E0E7FF" strokeWidth="2"/>
      <rect x="52" y="56" width="40" height="8" rx="4" fill="#EEF2FF"/>
      <rect x="52" y="72" width="136" height="1" fill="#F1F5F9"/>
      <rect x="52" y="84" width="136" height="1" fill="#F1F5F9"/>
      <rect x="52" y="96" width="136" height="1" fill="#F1F5F9"/>
      <rect x="52" y="108" width="136" height="1" fill="#F1F5F9"/>
      
      {/* Animated Link elements */}
      <circle cx="120" cy="90" r="30" fill="#4F46E5" fillOpacity="0.1" className="animate-pulse"/>
      <path d="M110 90H130M115 85L110 90L115 95M125 85L130 90L125 95" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      
      {/* Floating badges */}
      <rect x="160" y="30" width="50" height="20" rx="10" fill="#4F46E5" className="animate-bounce" style={{ animationDuration: '3s' }}/>
      <rect x="30" y="120" width="40" height="20" rx="10" fill="#818CF8" className="animate-bounce" style={{ animationDuration: '4s' }}/>
      
      <circle cx="200" cy="130" r="15" fill="#C7D2FE" fillOpacity="0.5"/>
      <circle cx="200" cy="130" r="8" fill="#4F46E5" fillOpacity="0.2"/>
    </svg>
  );
}

export function EmptyState({ onAction }: EmptyStateProps) {
  return (
    <div data-testid="empty-state" className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-indigo-100 rounded-full blur-3xl opacity-30 animate-pulse" />
        <LinkIllustration />
        <div className="absolute -top-4 -right-4">
          <Sparkles className="size-8 text-amber-400 fill-amber-400 animate-pulse" />
        </div>
      </div>

      <h3 className="text-2xl md:text-3xl font-black text-indigo-950 tracking-tight mb-3">
        Your library is ready & waiting.
      </h3>
      <p className="text-muted-foreground max-w-sm mx-auto mb-10 leading-relaxed text-sm">
        Stop guessing which posts drive traffic. Generate your first magic link and start tracking like a pro in seconds.
      </p>

      <Button 
        onClick={onAction}
        size="lg"
        className="h-16 px-10 bg-indigo-600 hover:bg-indigo-700 shadow-2xl shadow-indigo-200 gap-3 font-black text-xl rounded-2xl transition-all hover:scale-105 active:scale-95 group"
      >
        <Plus className="size-6 group-hover:rotate-90 transition-transform duration-300" />
        Create a Tracking Link
      </Button>
      
      <div className="mt-8 flex items-center gap-4 text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">
        <span>No Login Required</span>
        <span className="h-1 w-1 rounded-full bg-slate-300" />
        <span>Local & Secure</span>
      </div>
    </div>
  );
}
