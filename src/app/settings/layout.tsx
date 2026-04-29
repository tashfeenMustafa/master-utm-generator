"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { name: "UTM Values", href: "/settings/values" },
  { name: "Connections", href: "/settings/connections" },
  { name: "Source Types & Mediums", href: "/settings/source-types" },
  { name: "Account", href: "/settings/account" },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col flex-1 h-full bg-slate-50">
      <div className="border-b bg-white px-6">
        <div className="flex h-14 items-center gap-8">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "relative flex h-full items-center text-sm font-medium transition-colors hover:text-indigo-600",
                  isActive ? "text-indigo-600" : "text-muted-foreground"
                )}
              >
                {tab.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 h-0.5 w-full bg-indigo-600" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
