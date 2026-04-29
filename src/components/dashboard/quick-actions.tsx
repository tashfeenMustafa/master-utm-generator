"use client";

import Link from "next/link";
import { Plus, Eye, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QuickActions() {
  return (
    <div className="rounded-[10px] border border-indigo-100 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold tracking-tight text-indigo-950">
        Quick Actions
      </h3>

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
        <Link href="/organic">
          <Button
            variant="default"
            className="w-full justify-start gap-2 bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Create Link
          </Button>
        </Link>

        <Link href="/organic">
          <Button variant="outline" className="w-full justify-start gap-2">
            <Eye className="h-4 w-4" />
            View All Links
          </Button>
        </Link>

        <Link href="/settings/values">
          <Button variant="outline" className="w-full justify-start gap-2">
            <Settings className="h-4 w-4" />
            Manage Values
          </Button>
        </Link>

        <Link href="/settings/connections">
          <Button variant="outline" className="w-full justify-start gap-2">
            <Settings className="h-4 w-4" />
            Connect Tools
          </Button>
        </Link>
      </div>
    </div>
  );
}
