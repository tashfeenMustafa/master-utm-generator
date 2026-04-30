"use client";

import { useState, useMemo, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type GroupingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  Copy,
  Check,
  ChevronRight,
  ChevronDown,
  Search,
  X,
  Facebook,
  Chrome,
  Linkedin,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MOCK_ADS_DATA } from "@/lib/mock/ads-data";
import { analyzeUrl } from "@/lib/utm-health";
import { cn } from "@/lib/utils";
import type { AdCampaign, AdPlatform, AdCampaignStatus } from "@/lib/types";

// ── Platform display config ──────────────────────────────────────
const PLATFORM_CONFIG: Record<AdPlatform, { label: string; icon: React.ElementType }> = {
  meta: { label: "Meta", icon: Facebook },
  google: { label: "Google", icon: Chrome },
  linkedin: { label: "LinkedIn", icon: Linkedin },
};

// ── Status badge variant ─────────────────────────────────────────
function StatusBadge({ status }: { status: AdCampaignStatus }) {
  const variant = status === "active" ? "default" : status === "paused" ? "secondary" : "outline";
  return (
    <Badge variant={variant} className="text-xs capitalize">
      {status}
    </Badge>
  );
}

// ── Copy button with feedback ────────────────────────────────────
function CopyTemplateButton({ template }: { template: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(template);
      setCopied(true);
      toast.success("UTM template copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy template");
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon-xs" onClick={handleCopy} aria-label="Copy UTM Template">
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>Copy UTM Template</TooltipContent>
    </Tooltip>
  );
}

// ── Health status indicator ──────────────────────────────────────
function HealthIndicator({ url }: { url: string }) {
  const report = useMemo(() => analyzeUrl(url), [url]);

  if (report.status === "healthy") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-center size-5 text-green-500">
            <CheckCircle2 className="size-4" />
          </div>
        </TooltipTrigger>
        <TooltipContent>UTM configuration is healthy</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn(
          "flex items-center justify-center size-5 rounded-full cursor-help",
          report.status === "warning" ? "text-amber-500" : "text-destructive"
        )}>
          {report.status === "warning" ? <AlertCircle className="size-4" /> : <XCircle className="size-4" />}
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs p-0 overflow-hidden border-none shadow-lg">
        <div className={cn("p-2 text-xs font-bold uppercase tracking-wider", 
          report.status === "warning" ? "bg-amber-100 text-amber-950" : "bg-red-100 text-red-950")}>
          Audit Findings ({report.findings.length})
        </div>
        <div className="p-3 space-y-2 bg-white">
          {report.findings.filter(f => f.type !== "success").map((f, i) => (
            <div key={i} className="flex gap-2 leading-tight">
              <span className="text-[10px] uppercase font-black text-neutral-400 mt-0.5 shrink-0">[{f.type}]</span>
              <span className="text-neutral-700">{f.message}</span>
            </div>
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

// ── Format date ──────────────────────────────────────────────────
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ── Group-by options ─────────────────────────────────────────────
const GROUP_BY_OPTIONS = [
  { value: "none", label: "No grouping" },
  { value: "platform", label: "Platform" },
  { value: "utm_campaign", label: "utm_campaign" },
  { value: "utm_medium", label: "utm_medium" },
] as const;

// ── Status filter options ────────────────────────────────────────
const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
] as const;

// ── Main component ───────────────────────────────────────────────
export function AdsTable() {
  const [data] = useState<AdCampaign[]>(MOCK_ADS_DATA);
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([{ id: "lastUpdated", desc: true }]);
  const [grouping, setGrouping] = useState<GroupingState>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Column filters for status — must use useState + useEffect so TanStack Table
  // has a proper onColumnFiltersChange handler (prevents "state update before mount" error)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  useEffect(() => {
    setColumnFilters(
      statusFilter === "all" ? [] : [{ id: "status", value: statusFilter }]
    );
  }, [statusFilter]);

  // ── Column definitions ────────────────────────────────────────
  const columns = useMemo<ColumnDef<AdCampaign>[]>(
    () => [
      {
        id: "health",
        header: "",
        cell: ({ row }) => {
          if (row.getIsGrouped()) return null;
          return <HealthIndicator url={row.original.utmTemplate} />;
        },
        size: 40,
        enableSorting: false,
        enableGrouping: false,
      },
      {
        accessorKey: "utmTemplate",
        header: "UTM URL",
        cell: ({ getValue, row }) => {
          if (row.getIsGrouped()) return null;
          const url = getValue<string>();
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="block max-w-[280px] truncate font-mono text-xs">
                  {url}
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-md break-all">
                {url}
              </TooltipContent>
            </Tooltip>
          );
        },
        enableGrouping: false,
      },
      {
        accessorKey: "platform",
        header: "Platform",
        cell: ({ getValue }) => {
          const platform = getValue<AdPlatform>();
          const config = PLATFORM_CONFIG[platform];
          const Icon = config.icon;
          return (
            <span className="inline-flex items-center gap-1.5 text-xs">
              <Icon className="size-3.5" />
              {config.label}
            </span>
          );
        },
      },
      {
        accessorKey: "utm_source",
        header: "Source",
        cell: ({ getValue }) => (
          <Badge variant="secondary" className="text-xs">
            {getValue<string>()}
          </Badge>
        ),
      },
      {
        accessorKey: "utm_medium",
        header: "Medium",
        cell: ({ getValue }) => <span className="text-xs">{getValue<string>()}</span>,
      },
      {
        accessorKey: "utm_campaign",
        header: "Campaign",
        cell: ({ getValue }) => <span className="text-xs font-medium">{getValue<string>()}</span>,
      },
      {
        accessorKey: "utm_term",
        header: "Term",
        cell: ({ getValue }) => {
          const val = getValue<string | undefined>();
          return <span className="text-xs text-muted-foreground">{val || "—"}</span>;
        },
      },
      {
        accessorKey: "utm_content",
        header: "Content",
        cell: ({ getValue }) => {
          const val = getValue<string | undefined>();
          return <span className="text-xs text-muted-foreground">{val || "—"}</span>;
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => <StatusBadge status={getValue<AdCampaignStatus>()} />,
        filterFn: (row, _columnId, filterValue: string) => {
          return row.original.status === filterValue;
        },
      },
      {
        accessorKey: "lastUpdated",
        header: "Last Updated",
        cell: ({ getValue }) => (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDate(getValue<string>())}
          </span>
        ),
        enableGrouping: false,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          if (row.getIsGrouped()) return null;
          return <CopyTemplateButton template={row.original.utmTemplate} />;
        },
        enableSorting: false,
        enableGrouping: false,
      },
    ],
    []
  );

  // ── Table state ──────────────────────────────────────────────
  const tableState = useMemo(() => ({
    sorting,
    globalFilter: debouncedSearch,
    grouping,
    columnFilters,
  }), [sorting, debouncedSearch, grouping, columnFilters]);

  // ── Table instance ────────────────────────────────────────────
  const table = useReactTable({
    data,
    columns,
    state: tableState,
    onSortingChange: setSorting,
    onGroupingChange: setGrouping,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setDebouncedSearch,
    globalFilterFn: (row, _columnId, filterValue: string) => {
      const q = filterValue.toLowerCase();
      const r = row.original;
      return (
        r.utmTemplate.toLowerCase().includes(q) ||
        r.platform.toLowerCase().includes(q) ||
        r.campaignName.toLowerCase().includes(q) ||
        r.utm_source.toLowerCase().includes(q) ||
        r.utm_medium.toLowerCase().includes(q) ||
        r.utm_campaign.toLowerCase().includes(q) ||
        (r.utm_term?.toLowerCase().includes(q) ?? false) ||
        (r.utm_content?.toLowerCase().includes(q) ?? false)
      );
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    initialState: {
      pagination: { pageSize: 25 },
    },
  });

  const rows = table.getRowModel().rows;

  function handleGroupByChange(value: string) {
    setGrouping(value === "none" ? [] : [value]);
  }

  // ── Mounted guard ─────────────────────────────────────────────
  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center text-muted-foreground min-h-[400px]">
        <Loader2 className="size-6 animate-spin mb-2" />
        <p className="text-sm">Initializing table...</p>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────
  if (data.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center text-muted-foreground"
        data-testid="ads-empty-state"
      >
        <p>No ad campaigns found.</p>
        <p className="text-sm">Connect your ad platforms in Settings to import campaigns.</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm"
              aria-label="Search campaigns"
            />
            {search && (
              <Button
                variant="ghost"
                size="icon-xs"
                className="absolute right-1.5 top-1/2 -translate-y-1/2"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X className="size-3" />
              </Button>
            )}
          </div>
          <Select value={grouping[0] ?? "none"} onValueChange={handleGroupByChange}>
            <SelectTrigger className="w-[160px] h-8 text-sm">
              <SelectValue placeholder="Group by..." />
            </SelectTrigger>
            <SelectContent>
              {GROUP_BY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] h-8 text-sm">
              <SelectValue placeholder="Status..." />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active filter chip */}
        {debouncedSearch && (
          <div className="flex items-center gap-1.5">
            <Badge variant="secondary" className="gap-1 text-xs">
              Search: &quot;{debouncedSearch}&quot;
              <button onClick={() => setSearch("")} className="ml-0.5 hover:text-destructive">
                <X className="size-3" />
              </button>
            </Badge>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b bg-muted/50">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-3 py-2 text-left text-xs font-medium text-muted-foreground"
                    >
                      {header.isPlaceholder ? null : (
                        <button
                          className={`inline-flex items-center gap-1 ${
                            header.column.getCanSort()
                              ? "cursor-pointer select-none hover:text-foreground"
                              : ""
                          }`}
                          onClick={header.column.getToggleSortingHandler()}
                          disabled={!header.column.getCanSort()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && <ArrowUpDown className="size-3" />}
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-3 py-8 text-center text-muted-foreground">
                    No campaigns match your search.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-2">
                        {cell.getIsGrouped() ? (
                          <button
                            className="inline-flex items-center gap-1 font-medium text-xs"
                            onClick={row.getToggleExpandedHandler()}
                          >
                            {row.getIsExpanded() ? (
                              <ChevronDown className="size-3.5" />
                            ) : (
                              <ChevronRight className="size-3.5" />
                            )}
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            <Badge variant="secondary" className="ml-1 text-[10px]">
                              {row.subRows.length}
                            </Badge>
                          </button>
                        ) : cell.getIsAggregated() ? null : cell.getIsPlaceholder() ? null : (
                          flexRender(cell.column.columnDef.cell, cell.getContext())
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {table.getPageCount() > 1 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground text-xs">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              {" "}({table.getFilteredRowModel().rows.length} campaigns)
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="xs"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
