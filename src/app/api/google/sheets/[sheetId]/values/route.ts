import { NextRequest, NextResponse } from "next/server";
import { getValidAccessToken } from "@/lib/google/auth";
import { getColumnHeaders, getColumnValues, appendRows } from "@/lib/google/sheets";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sheetId: string }> }
) {
  const accessToken = await getValidAccessToken();
  if (!accessToken) {
    return NextResponse.json(
      { error: "Not authenticated. Please connect Google Sheets first." },
      { status: 401 }
    );
  }

  const { sheetId } = await params;
  const tab = request.nextUrl.searchParams.get("tab");
  const columnsParam = request.nextUrl.searchParams.get("columns");

  if (!tab) {
    return NextResponse.json({ error: "Missing 'tab' query parameter" }, { status: 400 });
  }

  try {
    // If no columns specified, return headers for the tab
    if (!columnsParam) {
      const headers = await getColumnHeaders(accessToken, sheetId, tab);
      return NextResponse.json(headers);
    }

    // Otherwise return values for the specified columns
    const columns = columnsParam.split(",").map((c) => c.trim()).filter(Boolean);
    if (columns.length === 0) {
      return NextResponse.json({ error: "No valid columns specified" }, { status: 400 });
    }

    const values = await getColumnValues(accessToken, sheetId, tab, columns);
    return NextResponse.json(values);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch sheet values" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sheetId: string }> }
) {
  const accessToken = await getValidAccessToken();
  if (!accessToken) {
    return NextResponse.json(
      { error: "Not authenticated. Please connect Google Sheets first." },
      { status: 401 }
    );
  }

  const { sheetId } = await params;

  try {
    const body = await request.json();
    const { tab, rows } = body as { tab?: string; rows?: string[][] };

    if (!tab) {
      return NextResponse.json({ error: "Missing 'tab' field" }, { status: 400 });
    }
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "Missing or empty 'rows' field" }, { status: 400 });
    }

    const result = await appendRows(accessToken, sheetId, tab, rows);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to append rows" },
      { status: 500 }
    );
  }
}
