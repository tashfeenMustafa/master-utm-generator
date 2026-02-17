"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Link2, Megaphone, Settings } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/organic", label: "Organic & DMs", icon: Link2 },
  { href: "/ads", label: "Ads", icon: Megaphone },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex group/sidebar flex-col items-center w-16 hover:w-[220px] transition-all duration-200 bg-dark-bg shrink-0 overflow-hidden">
      <div className="flex items-center h-14 px-4 w-full">
        <span className="text-white font-bold text-lg whitespace-nowrap">
          <span className="group-hover/sidebar:hidden">G</span>
          <span className="hidden group-hover/sidebar:inline">Get Levrg - Master UTM Generator</span>
        </span>
      </div>
      <nav className="flex flex-col gap-1 w-full px-2 mt-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Tooltip key={item.href} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors",
                    isActive && "bg-white/15 text-white"
                  )}
                >
                  <item.icon className="size-5 shrink-0" />
                  <span className="whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
                    {item.label}
                  </span>
                </Link>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="group-hover/sidebar:hidden"
              >
                {item.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
    </aside>
  );
}
