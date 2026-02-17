const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";

export interface SheetMetadata {
  title: string;
  tabs: string[];
}

export interface ColumnHeaders {
  headers: string[];
}

async function sheetsGet(accessToken: string, url: string): Promise<Response> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google Sheets API error (${res.status}): ${err}`);
  }
  return res;
}

export async function getSheetMetadata(
  accessToken: string,
  sheetId: string
): Promise<SheetMetadata> {
  const res = await sheetsGet(
    accessToken,
    `${SHEETS_API}/${sheetId}?fields=properties.title,sheets.properties.title`
  );
  const data = await res.json();
  return {
    title: data.properties?.title ?? "",
    tabs: (data.sheets ?? []).map(
      (s: { properties?: { title?: string } }) => s.properties?.title ?? ""
    ),
  };
}

export async function getColumnHeaders(
  accessToken: string,
  sheetId: string,
  tabName: string
): Promise<ColumnHeaders> {
  const range = encodeURIComponent(`'${tabName}'!1:1`);
  const res = await sheetsGet(
    accessToken,
    `${SHEETS_API}/${sheetId}/values/${range}`
  );
  const data = await res.json();
  const row = data.values?.[0] ?? [];
  return { headers: row as string[] };
}

export async function appendRows(
  accessToken: string,
  sheetId: string,
  tabName: string,
  rows: string[][]
): Promise<{ updatedRows: number }> {
  const range = encodeURIComponent(`'${tabName}'!A1`);
  const url = `${SHEETS_API}/${sheetId}/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values: rows }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google Sheets API error (${res.status}): ${err}`);
  }
  const data = await res.json();
  return { updatedRows: data.updates?.updatedRows ?? 0 };
}

export async function getColumnValues(
  accessToken: string,
  sheetId: string,
  tabName: string,
  columns: string[] // column letters like ["A", "B", "D"]
): Promise<Record<string, string[]>> {
  const ranges = columns.map(
    (col) => `'${tabName}'!${col}2:${col}`
  );
  const params = new URLSearchParams();
  for (const r of ranges) {
    params.append("ranges", r);
  }

  const res = await sheetsGet(
    accessToken,
    `${SHEETS_API}/${sheetId}/values:batchGet?${params.toString()}`
  );
  const data = await res.json();

  const result: Record<string, string[]> = {};
  const valueRanges: { values?: string[][] }[] = data.valueRanges ?? [];

  columns.forEach((col, i) => {
    const rows = valueRanges[i]?.values ?? [];
    const unique = [...new Set(
      rows
        .map((r) => r[0]?.trim())
        .filter((v): v is string => Boolean(v))
    )];
    result[col] = unique;
  });

  return result;
}
