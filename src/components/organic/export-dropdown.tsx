"use client";

import { useState, useRef, useEffect } from "react";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { exportToCsv, linksToRows } from "@/lib/export/csv";
import { parseGoogleSheetUrl } from "@/lib/google/parse-sheet-url";
import type { UtmLink } from "@/lib/types";

interface ExportDropdownProps {
  getFilteredRows: () => UtmLink[];
  hasGoogleSheets: boolean;
}

export function ExportDropdown({
  getFilteredRows,
  hasGoogleSheets,
}: ExportDropdownProps) {
  const [open, setOpen] = useState(false);
  const [sheetsDialogOpen, setSheetsDialogOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Google Sheets export state
  const [sheetUrl, setSheetUrl] = useState("");
  const [tabs, setTabs] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState("");
  const [fetchingTabs, setFetchingTabs] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [sheetId, setSheetId] = useState<string | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  function handleCsvExport() {
    setOpen(false);
    const rows = getFilteredRows();
    if (rows.length === 0) {
      toast("No data to export");
      return;
    }
    exportToCsv(rows);
    toast.success(`Exported ${rows.length} links as CSV`);
  }

  function handleSheetsClick() {
    setOpen(false);
    const rows = getFilteredRows();
    if (rows.length === 0) {
      toast("No data to export");
      return;
    }
    setSheetUrl("");
    setTabs([]);
    setSelectedTab("");
    setSheetId(null);
    setSheetsDialogOpen(true);
  }

  async function handleLoadSheet() {
    const parsed = parseGoogleSheetUrl(sheetUrl);
    if (!parsed) {
      toast.error("Invalid Google Sheets URL");
      return;
    }

    setFetchingTabs(true);
    try {
      const res = await fetch(`/api/google/sheets/${parsed}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to fetch sheet");
      }
      const data = await res.json();
      setSheetId(parsed);
      setTabs(data.tabs ?? []);
      setSelectedTab("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load sheet"
      );
    } finally {
      setFetchingTabs(false);
    }
  }

  async function handleSheetsExport() {
    if (!sheetId || !selectedTab) return;

    const rows = getFilteredRows();
    if (rows.length === 0) {
      toast("No data to export");
      return;
    }

    setExporting(true);
    try {
      const dataRows = linksToRows(rows);
      const res = await fetch(`/api/google/sheets/${sheetId}/values`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tab: selectedTab, rows: dataRows }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to export");
      }

      const data = await res.json();
      toast.success(
        `Exported ${data.updatedRows ?? rows.length} links to Google Sheets`
      );
      setSheetsDialogOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Export failed"
      );
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-sm gap-1.5"
          onClick={() => setOpen(!open)}
          data-testid="export-button"
        >
          <Download className="size-3.5" />
          Export
        </Button>

        {open && (
          <div className="absolute right-0 top-full z-50 mt-1 w-52 rounded-md border bg-popover p-1 shadow-md">
            <button
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
              onClick={handleCsvExport}
              data-testid="export-csv"
            >
              <Download className="size-4" />
              Export as CSV
            </button>
            {hasGoogleSheets && (
              <button
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                onClick={handleSheetsClick}
                data-testid="export-google-sheets"
              >
                <FileSpreadsheet className="size-4" />
                Export to Google Sheets
              </button>
            )}
          </div>
        )}
      </div>

      {/* Google Sheets export dialog */}
      <AlertDialog open={sheetsDialogOpen} onOpenChange={setSheetsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Export to Google Sheets</AlertDialogTitle>
            <AlertDialogDescription>
              Enter the URL of the Google Sheet to export data to and select a
              tab.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="export-sheet-url">Google Sheet URL</Label>
              <div className="flex gap-2">
                <Input
                  id="export-sheet-url"
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                />
                <Button
                  onClick={handleLoadSheet}
                  disabled={!sheetUrl || fetchingTabs}
                  size="sm"
                >
                  {fetchingTabs ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Load"
                  )}
                </Button>
              </div>
            </div>

            {tabs.length > 0 && (
              <div className="space-y-2">
                <Label>Tab</Label>
                <Select value={selectedTab} onValueChange={setSelectedTab}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a tab" />
                  </SelectTrigger>
                  <SelectContent>
                    {tabs.map((tab) => (
                      <SelectItem key={tab} value={tab}>
                        {tab}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleSheetsExport();
              }}
              disabled={!sheetId || !selectedTab || exporting}
            >
              {exporting ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="mr-2 size-4" />
              )}
              Export
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
