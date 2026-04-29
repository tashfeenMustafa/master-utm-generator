"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Link2, Megaphone, Settings, ChevronRight, ChevronLeft, Activity } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/organic", label: "Organic & DMs", icon: Link2 },
  { href: "/ads", label: "Ads", icon: Megaphone },
  { href: "/health-checker", label: "Health Checker", icon: Activity },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <TooltipProvider>
      <aside 
        className={cn(
          "hidden md:flex flex-col relative bg-dark-bg shrink-0 z-50 border-r transition-all duration-300 ease-in-out",
          isExpanded ? "w-[240px]" : "w-[72px]"
        )}
      >
        <div className="flex items-center min-h-[64px] px-4 w-full py-2 overflow-hidden border-b border-white/5 relative">
          {/* Logo Icon */}
          <div className="flex items-center justify-center min-w-[40px] h-[40px] rounded-lg bg-indigo-600 text-white font-bold text-xl mr-3 shrink-0 shadow-sm">
            M
          </div>
          
          {/* Brand Concept */}
          <div 
            className={cn(
              "flex flex-col whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out",
              isExpanded ? "opacity-100 max-w-[200px]" : "opacity-0 max-w-0"
            )}
          >
            <span className="text-white font-black text-xl tracking-tight leading-none pt-0.5">
              MagicUTMs
            </span>
          </div>
        </div>

        <nav className="flex flex-col gap-1 w-full px-3 mt-6 flex-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Tooltip key={item.href} delayDuration={isExpanded ? 10000 : 0}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 group relative overflow-hidden",
                      isActive && "bg-indigo-600 text-white hover:bg-indigo-600 shadow-sm",
                      !isExpanded && "justify-center"
                    )}
                  >
                    <item.icon className={cn("size-5 shrink-0 z-10")} />
                    <span 
                      className={cn(
                        "whitespace-nowrap transition-all duration-300 ease-in-out z-10",
                        isExpanded ? "opacity-100 max-w-[150px] translate-x-0" : "opacity-0 max-w-0 -translate-x-4 hidden"
                      )}
                    >
                      {item.label}
                    </span>
                    
                    {/* Active highlight block */}
                    {isActive && (
                      <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-indigo-600 opacity-0 transition-opacity" />
                    )}
                  </Link>
                </TooltipTrigger>
                {!isExpanded && (
                  <TooltipContent
                    side="right"
                    sideOffset={20}
                    className="font-medium bg-dark-bg text-white border-white/10"
                  >
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>

        {/* Toggle Button */}
        <div className="p-3 border-t border-white/5 mt-auto">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "flex items-center justify-center h-10 w-full rounded-lg text-white/50 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-200",
              !isExpanded && "w-12 h-12 mx-auto"
            )}
            aria-label="Toggle Sidebar"
          >
            {isExpanded ? (
              <div className="flex items-center gap-2">
                <ChevronLeft className="size-4" />
                <span className="text-sm font-medium">Collapse</span>
              </div>
            ) : (
              <ChevronRight className="size-5" />
            )}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
