import type { UtmLink } from "@/lib/types";

const CSV_HEADERS = [
  "Full URL",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "Date Generated",
] as const;

function escapeField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function linkToRow(link: UtmLink): string {
  return [
    link.generatedUrl,
    link.utm_source,
    link.utm_medium,
    link.utm_campaign,
    link.utm_term ?? "",
    link.utm_content ?? "",
    link.createdAt,
  ]
    .map(escapeField)
    .join(",");
}

export function generateCsvContent(links: UtmLink[]): string {
  const header = CSV_HEADERS.map(escapeField).join(",");
  const rows = links.map(linkToRow);
  return [header, ...rows].join("\n");
}

export function exportToCsv(links: UtmLink[], filename?: string): void {
  const date = new Date().toISOString().slice(0, 10);
  const name = filename ?? `utm_links_${date}.csv`;
  const content = generateCsvContent(links);
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function linksToRows(links: UtmLink[]): string[][] {
  return [
    [...CSV_HEADERS],
    ...links.map((link) => [
      link.generatedUrl,
      link.utm_source,
      link.utm_medium,
      link.utm_campaign,
      link.utm_term ?? "",
      link.utm_content ?? "",
      link.createdAt,
    ]),
  ];
}
