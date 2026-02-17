"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Link2, Megaphone, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/organic", label: "Organic & DMs", icon: Link2 },
  { href: "/ads", label: "Ads", icon: Megaphone },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden items-center justify-around border-t border-border bg-white py-2">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-1 text-xs text-muted-foreground transition-colors",
              isActive && "text-primary"
            )}
          >
            <item.icon className="size-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
