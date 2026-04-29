"use client";

import { useState, useMemo } from "react";
import { Search, CheckCircle2, AlertCircle, XCircle, Copy, Check, RotateCcw, Activity } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { analyzeUrl, HealthReport } from "@/lib/utm-health";
import { cn } from "@/lib/utils";

export function HealthChecker() {
  const [url, setUrl] = useState("");
  const [report, setReport] = useState<HealthReport | null>(null);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = () => {
    if (!url.trim()) {
      toast.error("Please enter a URL to audit");
      return;
    }
    const result = analyzeUrl(url.trim());
    setReport(result);
  };

  const handleReset = () => {
    setUrl("");
    setReport(null);
  };

  const handleCopyFixed = async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report.fixedUrl);
      setCopied(true);
      toast.success("Fixed URL copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  const scoreColor = useMemo(() => {
    if (!report) return "bg-neutral-200";
    if (report.score === 100) return "bg-green-500";
    if (report.score >= 60) return "bg-amber-500";
    return "bg-destructive";
  }, [report]);

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto pb-12">
      <Card className="border-indigo-100 shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="size-5 text-indigo-600" />
            <CardTitle>UTM Health Audit</CardTitle>
          </div>
          <CardDescription>
            Paste any URL to check if your tracking parameters follow industry best practices.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="https://example.com?utm_source=FB&utm_medium=PaidSocial..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                className="pl-9 h-11"
              />
            </div>
            <Button onClick={handleAnalyze} className="h-11 px-6 shadow-sm">
              Analyze
            </Button>
          </div>
        </CardContent>
      </Card>

      {report && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Score Header */}
          <Card className={cn("overflow-hidden border-none shadow-lg", 
            report.status === "healthy" ? "bg-green-50 text-green-950" : 
            report.status === "warning" ? "bg-amber-50 text-amber-950" : "bg-red-50 text-red-950")}>
            <CardContent className="pt-6 pb-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                  <span className="text-4xl font-black mb-1">{report.score}%</span>
                  <span className="text-sm font-semibold uppercase tracking-wider opacity-70">
                    Health Score: {report.status}
                  </span>
                </div>
                
                <div className="flex-1 w-full max-w-[300px] space-y-2">
                  <div className="h-3 w-full bg-white/50 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all duration-1000", scoreColor)} 
                      style={{ width: `${report.score}%` }} 
                    />
                  </div>
                  <p className="text-xs opacity-80 text-center">
                    {report.score === 100 
                      ? "Perfect! Your tracking parameters are spot on." 
                      : report.score >= 60 
                      ? "Getting there, but some optimizations are recommended."
                      : "Critical issues found. Your tracking may be unreliable."}
                  </p>
                </div>

                <Button variant="ghost" size="sm" onClick={handleReset} className="opacity-60 hover:opacity-100">
                  <RotateCcw className="size-4 mr-2" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Findings */}
          <Card className="border-indigo-50 shadow-sm">
            <CardHeader className="pb-3 border-b border-indigo-50">
              <CardTitle className="text-sm font-bold uppercase tracking-wide text-neutral-500">Audit Results</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-indigo-50">
                {report.findings.map((finding, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4">
                    {finding.type === "success" ? (
                      <CheckCircle2 className="size-5 text-green-500 shrink-0 mt-0.5" />
                    ) : finding.type === "warning" ? (
                      <AlertCircle className="size-5 text-amber-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="size-5 text-destructive shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{finding.message}</p>
                      {finding.param && (
                        <code className="text-[10px] uppercase font-bold text-neutral-400">Parameter: {finding.param}</code>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Fixed URL Solution */}
          <Card className="border-indigo-50 bg-indigo-50/30 border-dashed shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">MagicUTM Recommended Version</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-indigo-600/5 blur-xl group-hover:bg-indigo-600/10 transition-all rounded-xl" />
                <div className="relative font-mono text-xs break-all bg-white border border-indigo-100 rounded-lg p-4 pr-12 shadow-inner min-h-[60px] flex items-center">
                  {report.fixedUrl}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleCopyFixed}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    {copied ? <Check className="size-4 text-green-600" /> : <Copy className="size-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-3 pt-2">
                <p className="text-xs text-muted-foreground text-center">
                  Want to stop manually fixing URLs? Use MagicUTMs for perfect tracking, every time.
                </p>
                <Button variant="outline" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50" asChild>
                  <a href="/organic">Go to Generator</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
