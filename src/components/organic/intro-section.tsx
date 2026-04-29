"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, Target, Zap, Layout, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ExampleLink } from "./example-link";

export function IntroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("utm-generator:onboarding-dismissed");
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  function handleDismiss() {
    localStorage.setItem("utm-generator:onboarding-dismissed", "true");
    setIsVisible(false);
  }

  if (!isVisible) return null;

  const steps = [
    {
      icon: <Target className="size-5 text-indigo-600" />,
      title: "1. Destination",
      text: "Enter the final URL where you want to send your audience."
    },
    {
      icon: <Zap className="size-5 text-amber-500" />,
      title: "2. Channel",
      text: "Select your source type (Social, Blog, DM) and platform."
    },
    {
      icon: <Layout className="size-5 text-blue-500" />,
      title: "3. Campaign",
      text: "Define your content pillar and specific topic identifiers."
    },
    {
      icon: <Sparkles className="size-5 text-purple-500" />,
      title: "4. Distribution",
      text: "Specify the post format and content hook for deep tracking."
    }
  ];

  return (
    <div className="relative group overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm transition-all hover:shadow-md mb-8">
      {/* Decorative gradient background */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 h-48 w-48 rounded-full bg-indigo-50/50 blur-3xl" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 h-48 w-48 rounded-full bg-blue-50/50 blur-3xl" />

      <div className="relative p-6 md:p-8">
        <button 
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
          aria-label="Dismiss onboarding"
        >
          <X className="size-5" />
        </button>

        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="size-3" />
              New Feature: 5-Step Magic Wizard
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-indigo-950 tracking-tight leading-tight">
              Stop guessing why your <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-4">numbers are up</span>.
            </h2>
            <p className="text-muted-foreground max-w-xl leading-relaxed">
              Our new Organic Generator enforces clean naming conventions across your entire team. 
              Follow the steps to create pixel-perfect tracking links in seconds.
            </p>
            <ExampleLink />
          </div>
          
          <div className="shrink-0 flex items-center justify-center pt-4 md:pt-0">
            <Button 
              onClick={handleDismiss}
              className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 gap-2 font-bold transition-all hover:scale-105 active:scale-95"
            >
              <CheckCircle2 className="size-5" />
              Got it, let&apos;s go!
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10 pt-8 border-t border-indigo-50">
          {steps.map((step, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                {step.icon}
                <h3 className="font-bold text-indigo-950 text-sm">{step.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
