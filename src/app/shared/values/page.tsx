"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { 
  Download, 
  ArrowLeft, 
  ShieldAlert, 
  Library,
  PlusCircle,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { decompressValues } from "@/lib/sharing";
import { importValues } from "@/lib/storage";
import type { SharedLibrary } from "@/lib/sharing";

export default function SharedValuesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("lib");
  const [library, setLibrary] = useState<SharedLibrary | null>(null);
  const [isImported, setIsImported] = useState(false);

  useEffect(() => {
    if (token) {
      const decoded = decompressValues(token);
      setLibrary(decoded);
    }
  }, [token]);

  const stats = useMemo(() => {
    if (!library) return { campaign: 0, term: 0, content: 0 };
    return {
      campaign: library.values.filter(v => v.parameter === "utm_campaign").length,
      term: library.values.filter(v => v.parameter === "utm_term").length,
      content: library.values.filter(v => v.parameter === "utm_content").length,
    };
  }, [library]);

  if (!token || !library) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <ShieldAlert className="text-red-600" />
            </div>
            <CardTitle>Invalid or Missing Library</CardTitle>
            <CardDescription>
              The sharing link you followed appears to be broken or expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => router.push("/dashboard")} className="w-full">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  function handleImport() {
    try {
      const json = JSON.stringify(library?.values);
      const { imported, skipped } = importValues(json);
      toast.success(`Imported ${imported} values! (${skipped} duplicates skipped)`);
      setIsImported(true);
    } catch {
      toast.error("Failed to import shared values");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")} className="gap-2 text-muted-foreground hover:text-indigo-600">
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Library className="size-5 text-indigo-600" />
            <span className="font-bold text-indigo-950">Shared Library</span>
          </div>
          <div className="w-20" /> {/* Spacer */}
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 mt-8 space-y-6">
        <Card className="border-indigo-100 shadow-sm">
          <CardHeader className="text-center border-b border-indigo-50 bg-indigo-50/30">
            <CardTitle className="text-2xl font-black text-indigo-950">
              {library.name || "UTM Naming Conventions"}
            </CardTitle>
            <CardDescription>
              Shared with you via MagicUTMs
            </CardDescription>
            <div className="flex justify-center gap-4 mt-4">
              <div className="text-center">
                <p className="text-lg font-bold text-indigo-600">{stats.campaign}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Campaigns</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-indigo-600">{stats.term}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Terms</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-indigo-600">{stats.content}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Content</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-8">
              {/* Campaign Group */}
              {stats.campaign > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Badge className="bg-indigo-600">utm_campaign</Badge>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {library.values.filter(v => v.parameter === "utm_campaign").map((v, i) => (
                      <div key={i} className="flex flex-col p-2 rounded border bg-white shadow-sm">
                        <span className="text-sm font-semibold text-slate-900">{v.label}</span>
                        <span className="text-xs font-mono text-indigo-600">{v.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Term Group */}
              {stats.term > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Badge variant="outline" className="border-indigo-600 text-indigo-600">utm_term</Badge>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {library.values.filter(v => v.parameter === "utm_term").map((v, i) => (
                      <div key={i} className="flex flex-col p-2 rounded border bg-white shadow-sm">
                        <span className="text-sm font-semibold text-slate-900">{v.label}</span>
                        <span className="text-xs font-mono text-indigo-600">{v.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Content Group */}
              {stats.content > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Badge variant="secondary">utm_content</Badge>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {library.values.filter(v => v.parameter === "utm_content").map((v, i) => (
                      <div key={i} className="flex flex-col p-2 rounded border bg-white shadow-sm">
                        <span className="text-sm font-semibold text-slate-900">{v.label}</span>
                        <span className="text-xs font-mono text-indigo-600">{v.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Floating Bar */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-4">
          {isImported ? (
            <Button 
              className="w-full h-14 bg-green-600 hover:bg-green-700 text-lg font-bold gap-3 shadow-xl rounded-full transition-all"
              onClick={() => router.push("/settings/values")}
            >
              <CheckCircle2 className="size-6" />
              View in My Library
            </Button>
          ) : (
            <Button 
              className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-lg font-bold gap-3 shadow-xl rounded-full transition-all group"
              onClick={handleImport}
            >
              <PlusCircle className="size-6 group-hover:scale-110 transition-transform" />
              Import to My Library
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
