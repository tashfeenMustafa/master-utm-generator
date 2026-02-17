import { NextRequest, NextResponse } from "next/server";
import { getValidAccessToken } from "@/lib/google/auth";
import { getSheetMetadata } from "@/lib/google/sheets";

export async function GET(
  _request: NextRequest,
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
    const metadata = await getSheetMetadata(accessToken, sheetId);
    return NextResponse.json(metadata);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch sheet metadata" },
      { status: 500 }
    );
  }
}
