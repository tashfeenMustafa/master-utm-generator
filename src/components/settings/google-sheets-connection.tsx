"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  RefreshCw,
  Unplug,
  ExternalLink,
  Loader2,
  CheckCircle2,
  XCircle,
  CircleDot,
} from "lucide-react";
import { toast } from "sonner";
import { parseGoogleSheetUrl } from "@/lib/google/parse-sheet-url";
import {
  getConnections,
  saveConnection,
  updateConnection,
  deleteConnection,
  deleteValuesBySource,
  addValue,
} from "@/lib/storage";
import { toSnakeCase } from "@/lib/utils/to-snake-case";
import type { DataConnection, ManageableParameter } from "@/lib/types";

type ConnectionState =
  | "disconnected"
  | "authenticated"
  | "configuring"
  | "configured";

const PARAMETER_LABELS: Record<string, string> = {
  utm_campaign: "Campaign",
  utm_term: "Term",
  utm_content: "Content",
};

const COLUMN_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function GoogleSheetsConnection() {
  const [state, setState] = useState<ConnectionState>("disconnected");
  const [loading, setLoading] = useState(true);
  const [connection, setConnection] = useState<DataConnection | null>(null);

  // Sheet configuration
  const [sheetUrl, setSheetUrl] = useState("");
  const [sheetId, setSheetId] = useState<string | null>(null);
  const [sheetTitle, setSheetTitle] = useState("");
  const [tabs, setTabs] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMappings, setColumnMappings] = useState<
    Record<ManageableParameter, string>
  >({
    utm_campaign: "",
    utm_term: "",
    utm_content: "",
  });

  const [fetchingMetadata, setFetchingMetadata] = useState(false);
  const [fetchingHeaders, setFetchingHeaders] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Check auth status and load existing connection
  const checkStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/google/status");
      const data = await res.json();

      if (!data.authenticated) {
        setState("disconnected");
        setConnection(null);
        setLoading(false);
        return;
      }

      // Check for existing connection
      const connections = getConnections();
      const existing = connections.find((c) => c.type === "google_sheets");

      if (existing) {
        setConnection(existing);
        setSheetId(existing.config.sheetId ?? null);
        setSheetTitle(existing.config.sheetTitle ?? "");
        setSelectedTab(existing.config.tabName ?? "");
        setColumnMappings({
          utm_campaign: existing.config.col_utm_campaign ?? "",
          utm_term: existing.config.col_utm_term ?? "",
          utm_content: existing.config.col_utm_content ?? "",
        });
        setState("configured");
      } else {
        setState("authenticated");
      }
    } catch {
      setState("disconnected");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Handle connected=true query param (after OAuth redirect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected") === "true") {
      toast.success("Google Sheets connected successfully!");
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
      checkStatus();
    }
    const error = params.get("error");
    if (error) {
      toast.error(`Connection failed: ${error}`);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [checkStatus]);

  async function handleFetchMetadata() {
    const parsed = parseGoogleSheetUrl(sheetUrl);
    if (!parsed) {
      toast.error("Invalid Google Sheets URL");
      return;
    }

    setFetchingMetadata(true);
    try {
      const res = await fetch(`/api/google/sheets/${parsed}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to fetch sheet");
      }
      const data = await res.json();
      setSheetId(parsed);
      setSheetTitle(data.title);
      setTabs(data.tabs);
      setSelectedTab("");
      setHeaders([]);
      setColumnMappings({ utm_campaign: "", utm_term: "", utm_content: "" });
      setState("configuring");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to fetch sheet metadata"
      );
    } finally {
      setFetchingMetadata(false);
    }
  }

  async function handleTabSelect(tabName: string) {
    setSelectedTab(tabName);
    if (!sheetId) return;

    setFetchingHeaders(true);
    try {
      const res = await fetch(
        `/api/google/sheets/${sheetId}/values?tab=${encodeURIComponent(tabName)}`
      );
      if (!res.ok) throw new Error("Failed to fetch headers");
      const data = await res.json();
      setHeaders(data.headers ?? []);
      setColumnMappings({ utm_campaign: "", utm_term: "", utm_content: "" });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to fetch column headers"
      );
    } finally {
      setFetchingHeaders(false);
    }
  }

  async function handleSaveConfig() {
    if (!sheetId || !selectedTab) return;

    // At least one column must be mapped
    const hasMappings = Object.values(columnMappings).some((v) => v !== "");
    if (!hasMappings) {
      toast.error("Map at least one column to a UTM parameter");
      return;
    }

    setSaving(true);
    try {
      const config: Record<string, string> = {
        sheetId,
        sheetTitle,
        tabName: selectedTab,
      };
      for (const [param, col] of Object.entries(columnMappings)) {
        if (col) config[`col_${param}`] = col;
      }

      if (connection) {
        const updated = updateConnection(connection.id, {
          config,
          status: "active",
        });
        if (updated) setConnection(updated);
      } else {
        const created = saveConnection({
          name: sheetTitle || "Google Sheet",
          type: "google_sheets",
          config,
          lastSynced: null,
          status: "active",
        });
        setConnection(created);
      }

      setState("configured");
      toast.success("Configuration saved");
    } finally {
      setSaving(false);
    }
  }

  async function handleSync() {
    if (!connection || !sheetId) return;

    const mappedColumns: { param: ManageableParameter; col: string }[] = [];
    for (const [param, col] of Object.entries(columnMappings)) {
      if (col) mappedColumns.push({ param: param as ManageableParameter, col });
    }

    if (mappedColumns.length === 0) {
      toast.error("No columns mapped");
      return;
    }

    setSyncing(true);
    try {
      const tab = connection.config.tabName;
      const columns = mappedColumns.map((m) => m.col).join(",");
      const res = await fetch(
        `/api/google/sheets/${sheetId}/values?tab=${encodeURIComponent(tab)}&columns=${columns}`
      );

      if (res.status === 401) {
        updateConnection(connection.id, { status: "error" });
        setConnection({ ...connection, status: "error" });
        toast.error("Authentication expired. Please reconnect Google Sheets.");
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch values");

      const data: Record<string, string[]> = await res.json();

      // Delete existing synced values for this connection
      deleteValuesBySource("google_sheets", sheetId);

      // Add new values
      let addedCount = 0;
      for (const { param, col } of mappedColumns) {
        const values = data[col] ?? [];
        for (const rawValue of values) {
          const snaked = toSnakeCase(rawValue);
          if (!snaked) continue;
          const result = addValue({
            parameter: param,
            value: snaked,
            label: rawValue,
            source: "google_sheets",
            sourceRef: sheetId,
          });
          if (result) addedCount++;
        }
      }

      const now = new Date().toISOString();
      const updated = updateConnection(connection.id, {
        lastSynced: now,
        status: "active",
      });
      if (updated) setConnection(updated);

      toast.success(`Synced ${addedCount} values from Google Sheets`);
    } catch (error) {
      updateConnection(connection.id, { status: "error" });
      setConnection({ ...connection, status: "error" });
      toast.error(
        error instanceof Error ? error.message : "Sync failed"
      );
    } finally {
      setSyncing(false);
    }
  }

  async function handleDisconnect() {
    try {
      await fetch("/api/google/disconnect", { method: "POST" });

      if (connection) {
        // Remove synced values
        if (connection.config.sheetId) {
          deleteValuesBySource("google_sheets", connection.config.sheetId);
        }
        deleteConnection(connection.id);
      }

      setConnection(null);
      setSheetUrl("");
      setSheetId(null);
      setSheetTitle("");
      setTabs([]);
      setSelectedTab("");
      setHeaders([]);
      setColumnMappings({ utm_campaign: "", utm_term: "", utm_content: "" });
      setState("disconnected");
      toast.success("Google Sheets disconnected");
    } catch {
      toast.error("Failed to disconnect");
    }
  }

  function handleReconfigure() {
    setState("authenticated");
    setSheetUrl("");
    setTabs([]);
    setSelectedTab("");
    setHeaders([]);
  }

  const statusColor =
    connection?.status === "active"
      ? "text-green-500"
      : connection?.status === "error"
        ? "text-red-500"
        : "text-muted-foreground";

  const statusLabel =
    connection?.status === "active"
      ? "Connected"
      : connection?.status === "error"
        ? "Error"
        : "Disconnected";

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sheet className="size-5" />
            Google Sheets
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sheet className="size-5" />
            <div>
              <CardTitle>Google Sheets</CardTitle>
              <CardDescription>
                Import UTM values from a Google spreadsheet
              </CardDescription>
            </div>
          </div>
          {state !== "disconnected" && (
            <Badge
              variant={
                connection?.status === "active"
                  ? "default"
                  : connection?.status === "error"
                    ? "destructive"
                    : "secondary"
              }
              className="flex items-center gap-1"
            >
              <CircleDot className={`size-3 ${statusColor}`} />
              {statusLabel}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* State: Disconnected */}
        {state === "disconnected" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Connect your Google account to import campaign, term, and content
              values from a spreadsheet.
            </p>
            <Button asChild>
              <a href="/api/google/auth">
                <ExternalLink className="mr-2 size-4" />
                Connect Google Sheets
              </a>
            </Button>
          </div>
        )}

        {/* State: Authenticated, no sheet */}
        {state === "authenticated" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sheet-url">Google Sheet URL</Label>
              <div className="flex gap-2">
                <Input
                  id="sheet-url"
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                />
                <Button
                  onClick={handleFetchMetadata}
                  disabled={!sheetUrl || fetchingMetadata}
                >
                  {fetchingMetadata ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Load"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* State: Configuring (tab + column mapping) */}
        {state === "configuring" && (
          <div className="space-y-4">
            <div className="rounded-md border p-3">
              <p className="text-sm font-medium">{sheetTitle}</p>
              <p className="text-xs text-muted-foreground">
                Sheet ID: {sheetId}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Worksheet Tab</Label>
              <Select value={selectedTab} onValueChange={handleTabSelect}>
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

            {selectedTab && (
              <>
                {fetchingHeaders ? (
                  <div className="flex items-center gap-2 py-2">
                    <Loader2 className="size-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      Loading column headers...
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Label>Column Mapping</Label>
                    {(
                      ["utm_campaign", "utm_term", "utm_content"] as const
                    ).map((param) => (
                      <div
                        key={param}
                        className="flex items-center gap-3"
                      >
                        <span className="w-24 text-sm">
                          {PARAMETER_LABELS[param]}
                        </span>
                        <Select
                          value={columnMappings[param]}
                          onValueChange={(val) =>
                            setColumnMappings((prev) => ({
                              ...prev,
                              [param]: val,
                            }))
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select column" />
                          </SelectTrigger>
                          <SelectContent>
                            {headers.map((header, i) => (
                              <SelectItem
                                key={`${COLUMN_LETTERS[i]}-${header}`}
                                value={COLUMN_LETTERS[i]}
                              >
                                {COLUMN_LETTERS[i]}: {header}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  onClick={handleSaveConfig}
                  disabled={
                    saving ||
                    !Object.values(columnMappings).some((v) => v !== "")
                  }
                >
                  {saving ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 size-4" />
                  )}
                  Save Configuration
                </Button>
              </>
            )}
          </div>
        )}

        {/* State: Fully configured */}
        {state === "configured" && connection && (
          <div className="space-y-4">
            <div className="rounded-md border p-3 space-y-1">
              <p className="text-sm font-medium">
                {connection.config.sheetTitle || "Google Sheet"}
              </p>
              <p className="text-xs text-muted-foreground">
                Tab: {connection.config.tabName}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {(["utm_campaign", "utm_term", "utm_content"] as const).map(
                  (param) => {
                    const col = connection.config[`col_${param}`];
                    if (!col) return null;
                    return (
                      <Badge key={param} variant="secondary">
                        {PARAMETER_LABELS[param]}: Column {col}
                      </Badge>
                    );
                  }
                )}
              </div>
              {connection.lastSynced && (
                <p className="text-xs text-muted-foreground mt-2">
                  Last synced:{" "}
                  {new Date(connection.lastSynced).toLocaleString()}
                </p>
              )}
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button onClick={handleSync} disabled={syncing}>
                {syncing ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 size-4" />
                )}
                Sync Now
              </Button>

              <Button variant="outline" onClick={handleReconfigure}>
                Reconfigure
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Unplug className="mr-2 size-4" />
                    Disconnect
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Disconnect Google Sheets?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove the connection and all values imported
                      from this sheet. Manually added values will not be
                      affected.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      onClick={handleDisconnect}
                    >
                      <XCircle className="mr-2 size-4" />
                      Disconnect
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}

        {/* Error: re-auth prompt */}
        {connection?.status === "error" && state === "configured" && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
            <p className="text-sm text-destructive">
              Authentication expired or failed. Please reconnect.
            </p>
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <a href="/api/google/auth">Reconnect</a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
