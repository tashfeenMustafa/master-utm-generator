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
  Database,
  RefreshCw,
  Unplug,
  Loader2,
  CheckCircle2,
  XCircle,
  CircleDot,
} from "lucide-react";
import { toast } from "sonner";
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

interface AirtableBase {
  id: string;
  name: string;
}

interface AirtableTable {
  id: string;
  name: string;
  fields: { name: string; type: string }[];
}

const PARAMETER_LABELS: Record<string, string> = {
  utm_campaign: "Campaign",
  utm_term: "Term",
  utm_content: "Content",
};

export function AirtableConnection() {
  const [state, setState] = useState<ConnectionState>("disconnected");
  const [loading, setLoading] = useState(true);
  const [connection, setConnection] = useState<DataConnection | null>(null);

  // Token input
  const [patInput, setPatInput] = useState("");
  const [connecting, setConnecting] = useState(false);

  // Configuration
  const [bases, setBases] = useState<AirtableBase[]>([]);
  const [selectedBaseId, setSelectedBaseId] = useState("");
  const [selectedBaseName, setSelectedBaseName] = useState("");
  const [tables, setTables] = useState<AirtableTable[]>([]);
  const [selectedTableId, setSelectedTableId] = useState("");
  const [selectedTableName, setSelectedTableName] = useState("");
  const [fields, setFields] = useState<string[]>([]);
  const [columnMappings, setColumnMappings] = useState<
    Record<ManageableParameter, string>
  >({
    utm_campaign: "",
    utm_term: "",
    utm_content: "",
  });

  const [fetchingTables, setFetchingTables] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);

  const checkStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/airtable/status");
      const data = await res.json();

      if (!data.authenticated) {
        setState("disconnected");
        setConnection(null);
        setLoading(false);
        return;
      }

      // Check for existing connection
      const connections = getConnections();
      const existing = connections.find((c) => c.type === "airtable");

      if (existing) {
        setConnection(existing);
        setSelectedBaseId(existing.config.baseId ?? "");
        setSelectedBaseName(existing.config.baseName ?? "");
        setSelectedTableId(existing.config.tableId ?? "");
        setSelectedTableName(existing.config.tableName ?? "");
        setColumnMappings({
          utm_campaign: existing.config.col_utm_campaign ?? "",
          utm_term: existing.config.col_utm_term ?? "",
          utm_content: existing.config.col_utm_content ?? "",
        });
        setState("configured");
      } else {
        setState("authenticated");
        // Fetch bases for the dropdown
        try {
          const basesRes = await fetch("/api/airtable/bases");
          const basesData = await basesRes.json();
          setBases(basesData.bases ?? []);
        } catch {
          // silently fail — user can still proceed
        }
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

  async function handleConnect() {
    if (!patInput.trim()) {
      toast.error("Please enter your Airtable Personal Access Token");
      return;
    }

    setConnecting(true);
    try {
      const res = await fetch("/api/airtable/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: patInput.trim() }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to connect");
      }

      const data = await res.json();
      setBases(data.bases ?? []);
      setPatInput("");
      setState("authenticated");
      toast.success("Connected to Airtable!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to connect to Airtable"
      );
    } finally {
      setConnecting(false);
    }
  }

  async function handleBaseSelect(baseId: string) {
    setSelectedBaseId(baseId);
    const base = bases.find((b) => b.id === baseId);
    setSelectedBaseName(base?.name ?? "");
    setSelectedTableId("");
    setSelectedTableName("");
    setFields([]);
    setColumnMappings({ utm_campaign: "", utm_term: "", utm_content: "" });

    setFetchingTables(true);
    try {
      const res = await fetch(`/api/airtable/bases/${baseId}/tables`);
      if (!res.ok) throw new Error("Failed to fetch tables");
      const data = await res.json();
      setTables(data.tables ?? []);
      setState("configuring");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to fetch tables"
      );
    } finally {
      setFetchingTables(false);
    }
  }

  function handleTableSelect(tableId: string) {
    setSelectedTableId(tableId);
    const table = tables.find((t) => t.id === tableId);
    setSelectedTableName(table?.name ?? "");
    setFields(table?.fields.map((f) => f.name) ?? []);
    setColumnMappings({ utm_campaign: "", utm_term: "", utm_content: "" });
  }

  async function handleSaveConfig() {
    if (!selectedBaseId || !selectedTableId) return;

    const hasMappings = Object.values(columnMappings).some((v) => v !== "");
    if (!hasMappings) {
      toast.error("Map at least one column to a UTM parameter");
      return;
    }

    setSaving(true);
    try {
      const config: Record<string, string> = {
        baseId: selectedBaseId,
        baseName: selectedBaseName,
        tableId: selectedTableId,
        tableName: selectedTableName,
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
          name: selectedBaseName || "Airtable",
          type: "airtable",
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
    if (!connection) return;

    const baseId = connection.config.baseId;
    const tableId = connection.config.tableId;
    if (!baseId || !tableId) return;

    const mappedColumns: { param: ManageableParameter; col: string }[] = [];
    for (const [param, col] of Object.entries(columnMappings)) {
      if (col)
        mappedColumns.push({ param: param as ManageableParameter, col });
    }

    if (mappedColumns.length === 0) {
      toast.error("No columns mapped");
      return;
    }

    setSyncing(true);
    try {
      const fieldNames = mappedColumns.map((m) => m.col).join(",");
      const res = await fetch(
        `/api/airtable/bases/${baseId}/tables/${tableId}/records?fields=${encodeURIComponent(fieldNames)}`
      );

      if (res.status === 401) {
        updateConnection(connection.id, { status: "error" });
        setConnection({ ...connection, status: "error" });
        toast.error("Authentication expired. Please reconnect Airtable.");
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch records");

      const data: Record<string, string[]> = await res.json();

      // Delete existing synced values for this connection
      deleteValuesBySource("airtable", baseId);

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
            source: "airtable",
            sourceRef: baseId,
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

      toast.success(`Synced ${addedCount} values from Airtable`);
    } catch (error) {
      updateConnection(connection.id, { status: "error" });
      setConnection({ ...connection, status: "error" });
      toast.error(error instanceof Error ? error.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  async function handleDisconnect() {
    try {
      await fetch("/api/airtable/disconnect", { method: "POST" });

      if (connection) {
        if (connection.config.baseId) {
          deleteValuesBySource("airtable", connection.config.baseId);
        }
        deleteConnection(connection.id);
      }

      setConnection(null);
      setPatInput("");
      setBases([]);
      setSelectedBaseId("");
      setSelectedBaseName("");
      setTables([]);
      setSelectedTableId("");
      setSelectedTableName("");
      setFields([]);
      setColumnMappings({ utm_campaign: "", utm_term: "", utm_content: "" });
      setState("disconnected");
      toast.success("Airtable disconnected");
    } catch {
      toast.error("Failed to disconnect");
    }
  }

  function handleReconfigure() {
    setState("authenticated");
    setTables([]);
    setSelectedBaseId("");
    setSelectedBaseName("");
    setSelectedTableId("");
    setSelectedTableName("");
    setFields([]);
    // Re-fetch bases
    fetch("/api/airtable/bases")
      .then((res) => res.json())
      .then((data) => setBases(data.bases ?? []))
      .catch(() => {});
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
            <Database className="size-5" />
            Airtable
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
            <Database className="size-5" />
            <div>
              <CardTitle>Airtable</CardTitle>
              <CardDescription>
                Import UTM values from an Airtable base
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
        {/* State: Disconnected — PAT input */}
        {state === "disconnected" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Connect your Airtable account to import campaign, term, and
              content values from a base.
            </p>
            <div className="space-y-2">
              <Label htmlFor="airtable-pat">Personal Access Token</Label>
              <div className="flex gap-2">
                <Input
                  id="airtable-pat"
                  type="password"
                  placeholder="pat..."
                  value={patInput}
                  onChange={(e) => setPatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleConnect();
                  }}
                />
                <Button onClick={handleConnect} disabled={connecting || !patInput.trim()}>
                  {connecting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Connect"
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Create a token at airtable.com/create/tokens with
                &quot;data.records:read&quot; and &quot;schema.bases:read&quot;
                scopes.
              </p>
            </div>
          </div>
        )}

        {/* State: Authenticated — Base selector */}
        {state === "authenticated" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Base</Label>
              {fetchingTables ? (
                <div className="flex items-center gap-2 py-2">
                  <Loader2 className="size-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    Loading tables...
                  </span>
                </div>
              ) : (
                <Select value={selectedBaseId} onValueChange={handleBaseSelect}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a base" />
                  </SelectTrigger>
                  <SelectContent>
                    {bases.map((base) => (
                      <SelectItem key={base.id} value={base.id}>
                        {base.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        )}

        {/* State: Configuring (table + column mapping) */}
        {state === "configuring" && (
          <div className="space-y-4">
            <div className="rounded-md border p-3">
              <p className="text-sm font-medium">{selectedBaseName}</p>
              <p className="text-xs text-muted-foreground">
                Base ID: {selectedBaseId}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Table</Label>
              <Select value={selectedTableId} onValueChange={handleTableSelect}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a table" />
                </SelectTrigger>
                <SelectContent>
                  {tables.map((table) => (
                    <SelectItem key={table.id} value={table.id}>
                      {table.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTableId && fields.length > 0 && (
              <>
                <div className="space-y-3">
                  <Label>Column Mapping</Label>
                  {(["utm_campaign", "utm_term", "utm_content"] as const).map(
                    (param) => (
                      <div key={param} className="flex items-center gap-3">
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
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                          <SelectContent>
                            {fields.map((field) => (
                              <SelectItem key={field} value={field}>
                                {field}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )
                  )}
                </div>

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
                {connection.config.baseName || "Airtable"}
              </p>
              <p className="text-xs text-muted-foreground">
                Table: {connection.config.tableName}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {(["utm_campaign", "utm_term", "utm_content"] as const).map(
                  (param) => {
                    const col = connection.config[`col_${param}`];
                    if (!col) return null;
                    return (
                      <Badge key={param} variant="secondary">
                        {PARAMETER_LABELS[param]}: {col}
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
                    <AlertDialogTitle>Disconnect Airtable?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove the connection and all values imported
                      from this base. Manually added values will not be
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
              Authentication expired or failed. Please reconnect with a new
              token.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
