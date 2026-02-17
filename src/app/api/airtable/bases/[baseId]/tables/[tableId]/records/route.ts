import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getRecords } from "@/lib/airtable/api";

const COOKIE_NAME = "airtable_pat";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ baseId: string; tableId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { baseId, tableId } = await params;
    const fieldsParam = request.nextUrl.searchParams.get("fields");

    if (!fieldsParam) {
      return NextResponse.json(
        { error: "Missing 'fields' query parameter" },
        { status: 400 }
      );
    }

    const fieldNames = fieldsParam
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);

    if (fieldNames.length === 0) {
      return NextResponse.json(
        { error: "No valid field names specified" },
        { status: 400 }
      );
    }

    const records = await getRecords(token, baseId, tableId, fieldNames);
    return NextResponse.json(records);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch records",
      },
      { status: 500 }
    );
  }
}
