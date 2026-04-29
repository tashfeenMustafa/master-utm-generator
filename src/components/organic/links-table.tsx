"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
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
} from "@tanstack/react-table";
import { ArrowUpDown, Copy, Trash2, Check, ChevronRight, ChevronDown, Search, X, Link2, QrCode, AlertCircle, CheckCircle2, XCircle, Share2, MoreVertical } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getLinks, deleteLink, getConnections } from "@/lib/storage";
import { analyzeUrl } from "@/lib/utm-health";
import type { UtmLink } from "@/lib/types";
import { ExportDropdown } from "@/components/organic/export-dropdown";
import { QrCodeModal } from "@/components/organic/qr-code-modal";
import { EmptyState } from "@/components/organic/empty-state";
import { cn } from "@/lib/utils";

// ── Copy button with feedback ────────────────────────────────────
function CopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("URL copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon-xs" onClick={handleCopy} aria-label="Copy URL">
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>Copy URL</TooltipContent>
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
        <div className="p-3 space-y-2 bg-white text-dark-bg">
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

// ── QR button with modal ─────────────────────────────────────────
function QrButton({ url, campaign }: { url: string; campaign: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setOpen(true)}
            aria-label="Show QR code"
          >
            <QrCode className="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>QR Code</TooltipContent>
      </Tooltip>
      <QrCodeModal
        open={open}
        onOpenChange={setOpen}
        url={url}
        label={campaign}
      />
    </>
  );
}

// ── Delete button with confirmation ──────────────────────────────
function DeleteButton({ id, onDeleted }: { id: string; onDeleted: () => void }) {
  return (
    <AlertDialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon-xs" aria-label="Delete link">
              <Trash2 className="size-3.5 text-destructive" />
            </Button>
          </AlertDialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Delete</TooltipContent>
      </Tooltip>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this link?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. The link will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              deleteLink(id);
              onDeleted();
              toast.success("Link deleted");
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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
  { value: "utm_source", label: "utm_source" },
  { value: "utm_medium", label: "utm_medium" },
  { value: "utm_campaign", label: "utm_campaign" },
  { value: "utm_term", label: "utm_term" },
  { value: "utm_content", label: "utm_content" },
] as const;

// ── Mobile Link Card ─────────────────────────────────────────────
function MobileLinkCard({ link, onDeleted }: { link: UtmLink; onDeleted: () => void }) {
  const [openQr, setOpenQr] = useState(false);
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(link.generatedUrl);
    toast.success("URL copied");
  };

  const handleShare = async () => {
    const text = `Tracking link for ${link.utm_campaign}: ${link.generatedUrl}`;
    await navigator.clipboard.writeText(text);
    toast.success("Share message copied");
  };

  return (
    <div className="bg-white border rounded-xl p-4 space-y-3 shadow-sm md:hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HealthIndicator url={link.generatedUrl} />
          <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">
            {link.utm_source}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-xs" onClick={handleCopy}><Copy className="size-3.5" /></Button>
          <Button variant="ghost" size="icon-xs" onClick={() => setOpenQr(true)}><QrCode className="size-3.5" /></Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-xs"><MoreVertical className="size-3.5" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleShare} className="gap-2">
                <Share2 className="size-4" /> Share Link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => { deleteLink(link.id); onDeleted(); toast.success("Deleted"); }}
                className="text-destructive gap-2"
              >
                <Trash2 className="size-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-black text-indigo-950 truncate">{link.utm_campaign}</p>
        <p className="text-[10px] font-mono text-indigo-600/70 truncate break-all">{link.generatedUrl}</p>
      </div>

      <div className="flex gap-3 text-[10px] text-muted-foreground pt-1 border-t border-slate-50">
        <span>{link.utm_medium}</span>
        {link.utm_term && <span>• {link.utm_term}</span>}
        <span className="ml-auto">{formatDate(link.createdAt)}</span>
      </div>

      <QrCodeModal open={openQr} onOpenChange={setOpenQr} url={link.generatedUrl} label={link.utm_campaign} />
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────
interface LinksTableProps {
  refreshKey: number;
  onAction?: () => void;
}

export function LinksTable({ refreshKey, onAction }: LinksTableProps) {
  const [links, setLinks] = useState<UtmLink[]>(() => getLinks());
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [grouping, setGrouping] = useState<GroupingState>([]);

  // Reload links from storage
  const loadLinks = useCallback(() => {
    setLinks(getLinks());
  }, []);

  useEffect(() => {
    loadLinks();
  }, [loadLinks, refreshKey]);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // ── Column definitions ────────────────────────────────────────
  const columns = useMemo<ColumnDef<UtmLink>[]>(
    () => [
      {
        id: "health",
        header: "",
        cell: ({ row }) => {
          if (row.getIsGrouped()) return null;
          return <HealthIndicator url={row.original.generatedUrl} />;
        },
        size: 40,
        enableSorting: false,
        enableGrouping: false,
      },
      {
        accessorKey: "generatedUrl",
        header: "Generated URL",
        cell: ({ getValue, row }) => {
          if (row.getIsGrouped()) return null;
          const url = getValue<string>();
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="block max-w-[200px] lg:max-w-[300px] truncate font-mono text-xs">
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
        id: "custom_params",
        header: "Advanced",
        cell: ({ row }) => {
          const params = row.original.customParams;
          if (!params || Object.keys(params).length === 0) return <span className="text-muted-foreground text-[10px]">—</span>;
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="text-[9px] border-indigo-100 text-indigo-600 bg-indigo-50/30">
                  {Object.keys(params).length} custom
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="p-2 space-y-1">
                {Object.entries(params).map(([k, v]) => (
                  <div key={k} className="text-[10px] font-mono">
                    <span className="text-indigo-300">{k}:</span> {v}
                  </div>
                ))}
              </TooltipContent>
            </Tooltip>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Date",
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
          return (
            <div className="flex items-center gap-0.5">
              <CopyButton url={row.original.generatedUrl} />
              <QrButton url={row.original.generatedUrl} campaign={row.original.utm_campaign} />
              <DeleteButton id={row.original.id} onDeleted={loadLinks} />
            </div>
          );
        },
        enableSorting: false,
        enableGrouping: false,
      },
    ],
    [loadLinks]
  );

  // ── Table instance ────────────────────────────────────────────
  const table = useReactTable({
    data: links,
    columns,
    state: { sorting, globalFilter: debouncedSearch, grouping },
    onSortingChange: setSorting,
    onGroupingChange: setGrouping,
    globalFilterFn: (row, _columnId, filterValue: string) => {
      const q = filterValue.toLowerCase();
      const r = row.original;
      return (
        r.generatedUrl.toLowerCase().includes(q) ||
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

  // ── Empty state ───────────────────────────────────────────────
  if (links.length === 0) {
    return <EmptyState onAction={onAction || (() => {})} />;
  }

  return (
    <TooltipProvider>
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search links..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
            aria-label="Search links"
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
        <ExportDropdown
          getFilteredRows={() =>
            table.getFilteredRowModel().rows.map((r) => r.original)
          }
          hasGoogleSheets={getConnections().some(
            (c) => c.type === "google_sheets" && c.status === "active"
          )}
        />
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

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-md border bg-white">
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
                          header.column.getCanSort() ? "cursor-pointer select-none hover:text-foreground" : ""
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                        disabled={!header.column.getCanSort()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <ArrowUpDown className="size-3" />
                        )}
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
                  No links match your search.
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

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {table.getFilteredRowModel().rows.map((row) => (
          <MobileLinkCard key={row.id} link={row.original} onDeleted={loadLinks} />
        ))}
        {table.getFilteredRowModel().rows.length === 0 && (
          <div className="py-12 text-center text-muted-foreground border border-dashed rounded-xl">
            No links found.
          </div>
        )}
      </div>

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between text-sm pt-2">
          <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
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
