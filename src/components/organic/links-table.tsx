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
import { ArrowUpDown, Copy, Trash2, Check, ChevronRight, ChevronDown, Search, X } from "lucide-react";
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
import { getLinks, deleteLink, getConnections } from "@/lib/storage";
import type { UtmLink } from "@/lib/types";
import { ExportDropdown } from "@/components/organic/export-dropdown";

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

// ── Main component ───────────────────────────────────────────────
interface LinksTableProps {
  refreshKey: number;
}

export function LinksTable({ refreshKey }: LinksTableProps) {
  const [links, setLinks] = useState<UtmLink[]>(() => getLinks());
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [grouping, setGrouping] = useState<GroupingState>([]);

  // Reload links from storage
  const loadLinks = useCallback(() => {
    setLinks(getLinks());
  }, []);

  useEffect(() => {
    if (refreshKey > 0) {
      loadLinks();
    }
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
        accessorKey: "generatedUrl",
        header: "Full URL",
        cell: ({ getValue, row }) => {
          if (row.getIsGrouped()) return null;
          const url = getValue<string>();
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="block max-w-[300px] truncate font-mono text-xs">
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
    return (
      <div
        className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center text-muted-foreground"
        data-testid="empty-state"
      >
        <p>No UTM links generated yet.</p>
        <p className="text-sm">Click &quot;Generate UTM Link&quot; to create your first one.</p>
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

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground text-xs">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            {" "}({table.getFilteredRowModel().rows.length} links)
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
