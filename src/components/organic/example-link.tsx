"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function ExampleLink() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors group"
      >
        {isOpen ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
        See an example tracking link
      </button>

      {isOpen && (
        <div className="mt-3 p-4 bg-white border border-indigo-100 rounded-xl shadow-inner animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-3">
            <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-50 font-mono text-[10px] break-all text-indigo-900 leading-relaxed">
              https://magicutm.com/pricing?<span className="bg-amber-100 px-0.5 rounded">utm_source=facebook</span>&<span className="bg-blue-100 px-0.5 rounded">utm_medium=organic_social</span>&<span className="bg-purple-100 px-0.5 rounded">utm_campaign=winter_sale</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] uppercase font-black text-amber-600 tracking-tighter">utm_source</span>
                <span className="text-[10px] text-muted-foreground leading-tight">The platform (e.g. facebook)</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] uppercase font-black text-blue-600 tracking-tighter">utm_medium</span>
                <span className="text-[10px] text-muted-foreground leading-tight">The channel (e.g. organic_social)</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] uppercase font-black text-purple-600 tracking-tighter">utm_campaign</span>
                <span className="text-[10px] text-muted-foreground leading-tight">Your campaign name</span>
              </div>
            </div>

            <div className="flex items-start gap-2 pt-2 border-t border-indigo-50 text-[10px] text-muted-foreground italic">
              <Info className="size-3 mt-0.5 text-indigo-400 shrink-0" />
              <p>When someone clicks this link, Google Analytics knows exactly which post sent them.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
